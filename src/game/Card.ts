import { Effects, Environment } from "../shared/constants/gameConfig";
import { Color, Rarity, AttackType, ClassType, UnitType } from "../shared/enums";
import { ICard, ILeaderCard } from "../shared/interfaces";
import { CombatContext, EffectType, ISkill, SkillEffect, SkillResult } from "../shared/interfaces/skillInterfaces";
import { SkillFactory } from "./skills/SkillFactory";

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
  protected _activeEffects: SkillEffect[] = [];
  protected _skillUsedThisTurn: boolean = false;
  protected _initialAttack?: number; // Yeni özellik, başlangıç attack değerini saklamak için
  protected _maxAttack?: number; // Orijinal attack değerini saklamak için
  protected _initialHealth?: number; // Yeni özellik, başlangıç canını saklamak için
  protected _maxHealth: number; // Başlangıç canını saklamak için
  protected _effectCover?: string;

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

  // Skill kullanma
  public useSkill(target?: Card, context?: CombatContext): SkillResult | null {
    if (!this._skill || this.hasEffect(EffectType.Silence) || this._skillUsedThisTurn) {
      return null;
    }

    if (!this._skill.canUse(this, target, context)) {
      return null;
    }

    const result = this._skill.execute(this, target, context);
    if (result.success) {
      this._skillUsedThisTurn = true;
    }

    return result;
  }

  // Effect yönetimi
  public addEffect(effect: SkillEffect): void {
    this.removeEffect(effect.type);
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
      case EffectType.Zombify:
        this._effectCover = Effects.zombify;
        break;
      case EffectType.AttackReduction:
        if (!this._maxAttack) {
          this._maxAttack = this._attack;
        }
    }
  }

  public removeEffect(effectType: EffectType): void {
    this._activeEffects = this._activeEffects.filter(e => e.type !== effectType);
  }

  public hasEffect(effectType: EffectType): boolean {
    return this._activeEffects.some(e => e.type === effectType);
  }

  public async updateEffects(): Promise<void> {
    this._activeEffects = this._activeEffects.filter(effect => {
      effect.duration--;

      // Effect bittiğinde temizlik yap
      if (effect.duration <= 0) {
        switch (effect.type) {
          case EffectType.Bleed:
            this.removeEffect(EffectType.Bleed);
            this._effectCover = undefined;
            break;
          case EffectType.Burn:
            this.removeEffect(EffectType.Burn);
            this._effectCover = undefined;
            break;
          case EffectType.Freeze:
            this.removeEffect(EffectType.Freeze);
            this._effectCover = undefined;
            break;
          case EffectType.Zombify:
            this.removeEffect(EffectType.Zombify);
            this._effectCover = undefined;
            break;
          case EffectType.WarriorRage:
            this.removeEffect(EffectType.WarriorRage);
            break;
        }

        // Attack reduction bittiğinde attack'ı restore et
        if (effect.type === EffectType.AttackReduction && this._maxAttack) {
          this.removeEffect(EffectType.AttackReduction);
          this._attack = this._maxAttack; // Original attack'a geri dön
          this._maxAttack = undefined; // Temizle
        }
      }

      return effect.duration > 0;
    });

    this._skillUsedThisTurn = false;
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
    return this._attack;
  }

  public set attack(value: number) {
    this._attack = value;
  }

  public get health(): number {
    return this._health;
  }

  public set health(value: number) {
    this._health = value;
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

  public get maxAttack(): number | undefined {
    return this._maxAttack;
  }

  public set maxAttack(value: number | undefined) {
    this._maxAttack = value;
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
