import { Effects, Environment } from "../shared/constants/gameConfig";
import { CharacterList } from "../shared/constants/characters";
import { Color, Rarity, AttackType, ClassType, UnitType } from "../shared/enums";
import { ICard, ILeaderCard } from "../shared/interfaces";
import { CombatContext, EffectType, ISkill, SkillEffect, SkillResult, SkillTiming } from "../shared/interfaces/skillInterfaces";
import { SkillFactory } from "./skills/SkillFactory";
import { GenericSkill } from "./skills/GenericSkill";

// New skills are eligible by timing. Only timings resolved by a normal attack belong here.
const copyableSkillTimings = new Set([SkillTiming.BeforeAttack, SkillTiming.AfterAttack, SkillTiming.OnKill]);
const negativeEffects = new Set([
  EffectType.Bleed, EffectType.Burn, EffectType.Poison, EffectType.Freeze,
  EffectType.Silence, EffectType.AttackReduction, EffectType.Mark, EffectType.ThunderMark, EffectType.Taunt,
  EffectType.ZombifyPending, EffectType.VoidLock, EffectType.Fear,
]);

export class Card implements ICard {
  private static nextId = 0;
  protected _id: number;
  protected _name: string;
  protected _cover: string;
  protected _attack: number;
  protected _health: number;
  protected _rarity: Rarity;
  protected _color: Color;
  protected _attackType: AttackType;
  protected _classType: ClassType;
  protected _unitType: UnitType;
  protected _skill: ISkill | null = null;
  private readonly copiedSkills = new Map<string, GenericSkill>();
  protected _activeEffects: SkillEffect[] = [];
  protected _skillUsedThisTurn: boolean = false;
  protected _initialAttack?: number; // Yeni özellik, başlangıç attack değerini saklamak için
  protected _initialHealth?: number; // Yeni özellik, başlangıç canını saklamak için
  protected _maxHealth: number; // Başlangıç canını saklamak için
  protected _effectCover?: string;
  private phoenixRebirthUsed = false;
  private reforgeUsed = false;
  private awaitingReforge = false;
  private attackBonus = 0;
  private maxHealthBonus = 0;
  public warriorRageUsed = false;

  constructor(options: ICard) {
    this._id = Card.nextId++;
    this._name = options.name;
    this._attack = options.attack;
    this._health = options.health;
    this._rarity = options.rarity;
    this._color = options.color;
    this._cover = options.cover;
    this._attackType = options.attackType;
    this._classType = options.classType;
    this._unitType = options.unitType;
    this._initialHealth = this._health; // Başlangıç canını sakla
    this._initialAttack = this._attack; // Başlangıç attack değerini sakla
    this._maxHealth = this._health; // Başlangıç canını sakla
    this._skill = SkillFactory.createSkill(this._name);
  }

  public get isZombified(): boolean {
    return this.hasEffect(EffectType.Zombify);
  }

  public get isPhoenixEgg(): boolean {
    return this.hasEffect(EffectType.PhoenixEgg);
  }

  public get isOnLastHunt(): boolean {
    return this.hasEffect(EffectType.LastHunt);
  }

  public get isAlive(): boolean {
    return this.health > 0 || this.isOnLastHunt;
  }

  public get isEmpowered(): boolean {
    return this.hasEffect(EffectType.Empowered);
  }

  public queueReforge(): boolean {
    if (this.isAlive || this.reforgeUsed || !this.passiveEffect(EffectType.Reforge)) return false;
    this.reforgeUsed = true;
    this.awaitingReforge = true;
    return true;
  }

  public completeReforge(): boolean {
    if (!this.awaitingReforge) return false;
    this.awaitingReforge = false;
    this.clearEffects();
    this.removeStatBuffs();
    this._attack = this._initialAttack ?? this._attack;
    this._maxHealth = this._initialHealth ?? this._maxHealth;
    this.health = Math.floor(this._maxHealth / 2);
    this.resetTurnSkillUsage();
    this.addEffect({ type: EffectType.Empowered, target: this, duration: Infinity });
    return true;
  }

  public get isAwaitingReforge(): boolean {
    return this.awaitingReforge;
  }

  public tryEnterPhoenixEgg(): boolean {
    if (this.isAlive || this.phoenixRebirthUsed || !this.passiveEffect(EffectType.PhoenixRebirth)) return false;

    this.phoenixRebirthUsed = true;
    this.clearEffects();
    this.removeStatBuffs();
    this._cover = "phoenixegg";
    this._attack = 0;
    this._maxHealth = this._health = CharacterList.Phoenix.health;
    this.addEffect({ type: EffectType.PhoenixEgg, target: this, duration: 2 });
    return true;
  }

  private restorePhoenixForm(): void {
    this.removeStatBuffs();
    const phoenix = CharacterList.Phoenix;
    this._cover = phoenix.cover;
    this._attack = phoenix.attack;
    this._maxHealth = phoenix.health;
  }

  public passiveEffect(type: EffectType) {
    if (this.isZombified || this.hasEffect(EffectType.Silence)) return undefined;
    return this.skill?.passiveEffect?.(type);
  }

  public get hasThreefoldBite(): boolean {
    return Boolean(this.skill?.passiveEffect?.(EffectType.ThreeHeads));
  }

  public get hasUsedPhoenixRebirth(): boolean {
    return this.phoenixRebirthUsed;
  }

  public activeHeadCount(health = this.health): number {
    if (!this.passiveEffect(EffectType.ThreeHeads)) return 0;
    return Math.min(3, Math.ceil(Math.max(0, health) / 2));
  }

  // Skill kullanma
  public useSkill(target?: Card, context?: CombatContext): SkillResult | null {
    return this.executeSkill(this._skill, target, context);
  }

  public get readyCopiedSkill(): ISkill | undefined {
    const copy = this._activeEffects.find(effect => effect.type === EffectType.SkillCopy);
    return copy?.duration === 1 ? copy.copiedSkill : undefined;
  }

  public copySkillFrom(target: Card): ISkill | undefined {
    const original = target.skill;
    if (!this.isAlive || !this.passiveEffect(EffectType.SkillCopy)
      || this.hasEffect(EffectType.SkillCopy) || target.isZombified
      || !(original instanceof GenericSkill) || !copyableSkillTimings.has(original.triggerTiming)) {
      return undefined;
    }

    // Each Mimic owns its copies and remembers successful once-per-match uses.
    const copy = this.copiedSkills.get(original.name) ?? original.freshCopy();
    if (copy.exhausted) return undefined;
    this.copiedSkills.set(original.name, copy);
    this.addEffect({ type: EffectType.SkillCopy, target: this, duration: 2, copiedSkill: copy });
    return copy;
  }

  public useCopiedSkill(target: Card, context: CombatContext): SkillResult | null {
    const result = this.executeSkill(this.readyCopiedSkill, target, context);
    if (result?.success) this.removeEffect(EffectType.SkillCopy);
    return result;
  }

  private executeSkill(skill: ISkill | null | undefined, target?: Card, context?: CombatContext): SkillResult | null {
    if (!skill || this.isZombified || this.hasEffect(EffectType.Silence)) {
      return null;
    }
    const isArcaneBlast = context?.isArcaneBlast === true;
    if (isArcaneBlast ? !skill.triggersOnArcaneBlast : this._skillUsedThisTurn) {
      return null;
    }

    if (!skill.canUse(this, target, context)) {
      return null;
    }

    const result = skill.execute(this, target ?? skill.target, context);
    if (result.success && !isArcaneBlast) {
      this._skillUsedThisTurn = true;
    }

    return result;
  }

  // Effect yönetimi
  public addEffect(effect: SkillEffect): void {
    if (this.blocksEffect(effect.type)) return;
    if (effect.type === EffectType.Fear) {
      this._activeEffects = this._activeEffects.filter(active =>
        active.type !== EffectType.Fear || active.source !== effect.source);
    } else {
      this.removeEffect(effect.type);
    }
    this._activeEffects.push(effect);

    switch (effect.type) {
      case EffectType.Bleed:
        this._effectCover = Effects.bleed;
        break;
      case EffectType.Burn:
        this._effectCover = Effects.burn;
        break;
      case EffectType.Freeze:
        this._effectCover = Effects.freeze;
        break;
      case EffectType.Poison:
        this._effectCover = Effects.poison;
        break;
      case EffectType.Protection:
        this._effectCover = Effects.protection;
        break;
      case EffectType.Zombify:
        this._effectCover = Effects.zombify;
        break;
    }
  }

  public removeEffect(effectType: EffectType): void {
    this._activeEffects = this._activeEffects.filter(e => e.type !== effectType);
    if ((effectType === EffectType.Protection && this._effectCover === Effects.protection)
        || (effectType === EffectType.Freeze && this._effectCover === Effects.freeze)) {
      this._effectCover = undefined;
    }
  }

  public hasEffect(effectType: EffectType): boolean {
    return this._activeEffects.some(e => e.type === effectType);
  }

  public fears(source: Card): boolean {
    return source.isAlive && this._activeEffects.some(effect =>
      effect.type === EffectType.Fear && effect.source === source);
  }

  public removeEffectsFromFallenSources(): void {
    this._activeEffects = this._activeEffects.filter(effect =>
      (effect.type !== EffectType.Fear && effect.type !== EffectType.VowLink) || effect.source?.isAlive);
  }

  public get hasNegativeEffects(): boolean {
    return this._activeEffects.some(effect => negativeEffects.has(effect.type));
  }

  public blocksEffect(type: EffectType): boolean {
    return (this.isEmpowered && type !== EffectType.Empowered)
      || (negativeEffects.has(type) && (this.isOnLastHunt || this.hasEffect(EffectType.DebuffImmunity)));
  }

  public cleanseNegativeEffects(): void {
    this._activeEffects = this._activeEffects.filter(effect => !negativeEffects.has(effect.type));
    const lastCoverEffect = this._activeEffects.filter(effect =>
      effect.type === EffectType.Protection || effect.type === EffectType.Zombify).pop();
    this._effectCover = lastCoverEffect?.type === EffectType.Protection ? Effects.protection
      : lastCoverEffect ? Effects.zombify : undefined;
  }

  public clearEffects(): void {
    if (this.isPhoenixEgg) this.restorePhoenixForm();
    this._activeEffects = this._activeEffects.filter(effect => effect.type === EffectType.Zombify);
    this._effectCover = undefined;
  }

  public resetTurnSkillUsage(): void {
    this._skillUsedThisTurn = false;
  }

  public async updateEffects(): Promise<void> {
    let zombify = false;
    const wasEgg = this.isPhoenixEgg;
    this._activeEffects = this._activeEffects.filter(effect => {
      // These effects expire at separate turn boundaries.
      if (effect.type === EffectType.Protection || effect.type === EffectType.VowLink
          || effect.type === EffectType.Mark || effect.type === EffectType.ThunderMark || effect.type === EffectType.Freeze
          || effect.type === EffectType.DebuffImmunity || effect.type === EffectType.LastHunt) {
        return true;
      }

      effect.duration--;

      // Effect bittiğinde temizlik yap
      if (effect.duration <= 0) {
        switch (effect.type) {
          case EffectType.ZombifyPending:
            zombify = true;
            break;
          case EffectType.Bleed:
            this.removeEffect(EffectType.Bleed);
            this._effectCover = undefined;
            break;
          case EffectType.Burn:
            this.removeEffect(EffectType.Burn);
            this._effectCover = undefined;
            break;
          case EffectType.Poison:
            this.removeEffect(EffectType.Poison);
            this._effectCover = undefined;
            break;
          case EffectType.WarriorRage:
            this.removeEffect(EffectType.WarriorRage);
            break;
        }
      }

      return effect.duration > 0;
    });

    if (zombify) {
      this.transformIntoZombie();
    } else if (wasEgg && !this.isPhoenixEgg && this.health > 0) {
      this.restorePhoenixForm();
      this._health = this._maxHealth;
      this.clearEffects();
    }
    this.resetTurnSkillUsage();
  }

  public advanceZombification(): boolean {
    const infection = this._activeEffects.find(effect => effect.type === EffectType.ZombifyPending);
    if (!infection) return false;

    if (--infection.duration <= 0) this.transformIntoZombie();
    return true;
  }

  private transformIntoZombie(): void {
    this.removeEffect(EffectType.ZombifyPending);
    this.removeStatBuffs();
    const zombie = CharacterList.Zombie;
    this._name = zombie.name;
    this._cover = zombie.cover;
    this._classType = zombie.classType;
    this._attackType = zombie.attackType;
    this._unitType = zombie.unitType;
    this._attack = Math.floor(zombie.attack / 2);
    this._maxHealth = Math.floor(zombie.health / 2);
    this.health = this._maxHealth;
    this._skill = null;
    this.removeEffect(EffectType.PhoenixEgg);
    this.removeEffect(EffectType.SkillCopy);
    this.removeEffect(EffectType.WarriorRage);
    this.addEffect({ type: EffectType.Zombify, target: this, duration: Infinity });
  }

  public get id(): number {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get cover(): string {
    return this._cover;
  }

  public set cover(value: string) {
    this._cover = value;
  }

  public get attack(): number {
    if (this.isPhoenixEgg) return 0;
    const reduction = this.activeEffects.find(effect => effect.type === EffectType.AttackReduction);
    return reduction ? Math.max(1, this._attack - Math.floor(this._attack * (reduction.value ?? 0.5))) : this._attack;
  }

  public get unreducedAttack(): number {
    return this._attack;
  }

  public set attack(value: number) {
    this._attack = value;
  }

  public setDisplayedAttack(value: number): void {
    const reduction = this.activeEffects.find(effect => effect.type === EffectType.AttackReduction);
    this._attack = reduction ? Math.floor(value / (1 - (reduction.value ?? 0.5))) : value;
    // A stat swap replaces the attack value, including any bonuses it contained.
    this.attackBonus = 0;
    this.removeEffect(EffectType.WarriorRage);
  }

  public get health(): number {
    return this._health;
  }

  public set health(value: number) {
    if (!this.isOnLastHunt) this._health = value;
  }

  public get rarity(): Rarity {
    return this._rarity;
  }

  public get color(): Color {
    return this._color;
  }

  public get attackType(): AttackType {
    return this._attackType;
  }

  public get classType(): ClassType {
    return this._classType;
  }

  public get unitType(): UnitType {
    return this._unitType;
  }

  public get skill(): ISkill | null {
    return this._skill;
  }

  public set skill(skill: ISkill | null) {
    this._skill = skill;
  }

  public get activeEffects(): SkillEffect[] {
    return this._activeEffects;
  }

  public set activeEffects(effects: SkillEffect[]) {
    this._activeEffects = effects;
  }

  public amplifyIncomingDamage(damage: number): number {
    const mark = this.activeEffects.find(effect => effect.type === EffectType.Mark);
    return Math.floor(damage * (mark?.value ?? 1));
  }

  public increaseAttack(amount: number): void {
    this._attack += amount;
    this.attackBonus += amount;
  }

  public get blocksStatBuffs(): boolean {
    return this.isEmpowered || this.blocksStatRecovery;
  }

  public get blocksStatRecovery(): boolean {
    return this.hasEffect(EffectType.VoidLock);
  }

  public increaseHealth(amount: number): void {
    this._maxHealth += amount;
    this.health += amount;
    this.maxHealthBonus += amount;
  }

  public removeStatBuffs(): void {
    this._attack = Math.max(0, this._attack - this.attackBonus);
    if (this.maxHealthBonus > 0) {
      this._maxHealth = Math.max(1, this._maxHealth - this.maxHealthBonus);
      this._health = Math.min(this._health, this._maxHealth);
    }
    this.attackBonus = 0;
    this.maxHealthBonus = 0;
    this.removeEffect(EffectType.WarriorRage);
  }

  public tickSourceTurnEffects(activeTeam: Card[]): void {
    for (const effect of this.activeEffects) {
      if ((effect.type === EffectType.Mark || effect.type === EffectType.ThunderMark || effect.type === EffectType.Freeze)
          && effect.source && activeTeam.includes(effect.source) && --effect.duration <= 0) {
        this.removeEffect(effect.type);
      }
    }
  }

  public tickLastHunt(): void {
    const hunt = this.activeEffects.find(effect => effect.type === EffectType.LastHunt);
    if (hunt && --hunt.duration <= 0) this.removeEffect(EffectType.LastHunt);
  }

  public tickOpponentTurnEffects(): void {
    for (const effect of this.activeEffects) {
      if (effect.type === EffectType.DebuffImmunity && --effect.duration <= 0) {
        this.removeEffect(effect.type);
      }
    }
  }

  public get maxHealth(): number {
    return this._maxHealth;
  }

  public set maxHealth(value: number) {
    this._maxHealth = value;
  }

  public get effectCover(): string | undefined {
    return this._effectCover;
  }

  public set effectCover(value: string | undefined) {
    this._effectCover = value;
  }
}

export class LeaderCard extends Card implements ILeaderCard {
  protected _crown: string;

  constructor(
    card: ICard,
    crown: string = Environment.crown
  ) {
    super({
      name: card.name,
      cover: card.cover,
      attack: card.attack,
      health: card.health,
      rarity: card.rarity,
      color: card.color,
      attackType: card.attackType,
      classType: card.classType,
      unitType: card.unitType,
      skill: card.skill || null // Ensure skill is set if available
    });

    this._crown = crown;
  }

  public get card(): ICard {
    return {
      name: this._name,
      cover: this._cover,
      attack: this._attack,
      health: this._health,
      rarity: this._rarity,
      color: this._color,
      attackType: this._attackType,
      classType: this._classType,
      unitType: this._unitType,
      skill: this._skill
    };
  }

  public get crown(): string {
    return this._crown;
  }
}
