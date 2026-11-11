import { Card } from "../game/Card";
import { Player } from "../game/Player";
import { CharacterList } from "../shared/constants/characters";
import { BroadcastEvents } from "../shared/constants/events";
import { AttackType, ClassType, UnitType } from "../shared/enums";
import { CombatOption } from "../shared/interfaces";
import { CombatContext, EffectType, SkillTiming } from "../shared/interfaces/skillInterfaces";
import { CardView } from "../ui/CardView";
import { Broadcast } from "../utils/Broadcast";

export class CombatManager {
    private _player!: Player;
    private _opponent!: Player;

    constructor(private readonly _broadcast: Broadcast, public readonly random: () => number = () => Math.random()) {
        this.eventListeners();
    }

    private eventListeners() {
        this._broadcast.on(BroadcastEvents.CHECK_ARCANE_BLAST, this.handleMageAbility.bind(this));
    }

    public async resolveCombat(attacker: CardView, defender: CardView): Promise<CombatOption | null> {
        if (!this.canAttackTarget(attacker.card, defender.card, this._opponent.hand)) return null;

        const context: CombatContext = {
            random: this.random,
            attacker: attacker.card,
            defender: defender.card,
            isCounterAttack: false,
            allPlayerCards: this._player.hand,
            allOpponentCards: this._opponent.hand,
            player: this._player,
            opponent: this._opponent
        };

        const copiedSkill = attacker.card.readyCopiedSkill;
        const attackSkill = copiedSkill ?? attacker.card.skill;
        const defenderWasAlive = defender.card.health > 0;
        if (attackSkill?.triggerTiming === SkillTiming.BeforeAttack) {
            this.triggerAttackSkill(attacker, defender, context, SkillTiming.BeforeAttack, "#9932cc");
            attacker.updateStats();
        }

        const critChance = this.attackCritChance(attacker.card);
        const critical = critChance > 0 && this.random() <= critChance;
        const combatData: CombatOption = {
            attacker,
            defender,
            attackDamage: this.calculateAttackDamage(attacker, defender, critical),
            followUp: false,
            counterDamage: attacker.card.attackType === AttackType.Melee && !attacker.card.hasEffect(EffectType.Invisible)
                ? this.calculateCounterDamage(defender.card, true) : 0
        };

        // 6. Hasarları uygula (health'ler değişsin ama animation öncesi)
        const dodged = this.dodges(attacker.card, defender.card);
        combatData.attackDamage = this.applyCombatDamage(attacker, defender, defender.card.amplifyIncomingDamage(combatData.attackDamage), "Saldırı", dodged);
        if (dodged && this.canCounterOnDodge(defender.card, attacker.card)) {
            combatData.counterDamage = this.applyDodgeCounter(defender, attacker);
        } else if (combatData.counterDamage > 0) {
            const counterDodged = this.dodges(defender.card, attacker.card);
            combatData.counterDamage = this.applyCombatDamage(defender, attacker, combatData.counterDamage,
                "Karşı saldırı", counterDodged);
            if (counterDodged) this.showDodgeCounter(attacker, defender);
        }
        context.dodged = dodged;
        const killedDefender = defenderWasAlive && defender.card.health <= 0;

        // 7. AfterAttack skills
        if (attacker.card.health > 0 || attackSkill?.persistsAfterDeath) {
            this.triggerAttackSkill(attacker, defender, context, SkillTiming.AfterAttack, "#ff6600");
        }

        if (killedDefender && !this.tryPhoenixRebirth(defender)) {
            this.triggerAttackSkill(attacker, defender, context, SkillTiming.OnKill, "#00ff00");
        }

        const newCopy = dodged ? undefined : attacker.card.copySkillFrom(defender.card);
        if (newCopy) {
            this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                targetView: attacker,
                abilityName: attacker.card.skill?.name,
                message: `Kopyalanan yetenek: ${newCopy.name}`,
                color: "#9932cc"
            });
        }

        combatData.followUp = critical && !dodged && !killedDefender && attacker.card.health > 0
            && Boolean(attacker.card.passiveEffect(EffectType.CriticalFollowUp))
            && this.canAttackTarget(attacker.card, defender.card, this._opponent.hand);
        return combatData;
    }

    public tryPhoenixRebirth(view: CardView): boolean {
        if (!view.card.tryEnterPhoenixEgg()) return false;
        this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
            targetView: view, abilityName: view.card.skill?.name, message: "Phoenix yumurtaya dönüştü!", color: "#ff6600"
        });
        return true;
    }

    private applyCombatDamage(source: CardView, targetView: CardView, damage: number, action: string, dodged = false): number {
        const target = targetView.card;
        if (dodged) {
            this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                targetView, message: "Saldırıdan kaçındı", color: "#52bd9b"
            });
            return 0;
        }

        const protector = this.ignoresDefense(source.card) ? undefined : this.livingProtector(target);
        let shared: { name: string; damage: number } | undefined;
        if (protector) {
            const sharedDamage = damage - this.damageAfterProtection(target, damage);
            const previousHealth = protector.health;
            protector.health = Math.max(0, protector.health - sharedDamage);
            damage -= sharedDamage;
            shared = { name: protector.name, damage: previousHealth - protector.health };
        }

        const previousHealth = target.health;
        target.health = Math.max(0, target.health - damage);
        this._broadcast.emit(BroadcastEvents.COMBAT_HIT, {
            source, target: targetView, action, shared, damage
        });
        if (target.health > 0 && target.health < previousHealth) {
            this.triggerDamageReceivedSkills({
                random: this.random,
                attacker: source.card, defender: target,
                isCounterAttack: this._player.hand.includes(target)
            }, targetView);
        }
        return damage;
    }

    public canAttackTarget(attacker: Card | null, target: Card, opponents: Card[]): boolean {
        if (target.health <= 0 || this.blocksInvisibleTarget(attacker, target, opponents)
            || attacker?.isPhoenixEgg || attacker?.hasEffect(EffectType.Freeze)
            || (attacker && this.blocksRangedTarget(attacker, target, opponents))) {
            return false;
        }
        const provoker = this.getActiveProvoker(attacker, opponents);
        if (provoker) {
            return target === provoker;
        }
        return target.unitType !== UnitType.Leader
            || !opponents.some(card => card.health > 0 && card.unitType !== UnitType.Leader);
    }

    private blocksInvisibleTarget(attacker: Card | null, target: Card, opponents: Card[]): boolean {
        if (!target.hasEffect(EffectType.Invisible)) return false;
        if (!attacker || target.name !== CharacterList.Alien.name || target.unitType === UnitType.Leader) return true;

        const allies = opponents.filter(card =>
            card !== target && card.health > 0 && card.unitType !== UnitType.Leader);
        if (allies.length === 0) return false;

        const luxen = allies[0];
        return !(allies.length === 1 && luxen.passiveEffect(EffectType.RangedTargetImmunity)
            && attacker.attackType === AttackType.Ranged && !this.hasMeleeTargeting(luxen, opponents));
    }

    private blocksRangedTarget(attacker: Card, target: Card, opponents: Card[]): boolean {
        if (attacker.attackType !== AttackType.Ranged || !target.passiveEffect(EffectType.RangedTargetImmunity)) {
            return false;
        }

        if (target.unitType === UnitType.Leader || opponents.some(card =>
            card !== target && card.health > 0 && card.unitType !== UnitType.Leader)) {
            return true;
        }

        return this.hasMeleeTargeting(target, opponents);
    }

    private hasMeleeTargeting(target: Card, opponents: Card[]): boolean {
        return (this._player?.hand ?? []).some(card =>
            card.attackType === AttackType.Melee && card.health > 0 && this.canAttackTarget(card, target, opponents));
    }

    private getActiveProvoker(attacker: Card | null, opponents: Card[]): Card | undefined {
        const provoker = attacker?.activeEffects.find(effect => effect.type === EffectType.Taunt)?.source;
        return provoker && provoker.health > 0 && opponents.includes(provoker) && !provoker.hasEffect(EffectType.Invisible)
            ? provoker : undefined;
    }

    private ignoresDefense(card: Card): boolean {
        return Boolean(card.passiveEffect(EffectType.IgnoreDefense));
    }

    private dodgeChance(source: Card, target: Card): number {
        return this.ignoresDefense(source) ? 0 : target.passiveEffect(EffectType.Dodge)?.chance ?? 0;
    }

    private dodges(source: Card, target: Card): boolean {
        const chance = this.dodgeChance(source, target);
        return chance > 0 && this.random() < chance;
    }

    private canCounterOnDodge(source: Card, target: Card): boolean {
        return source.health > 0 && target.health > 0
            && !source.hasEffect(EffectType.Freeze) && !target.hasEffect(EffectType.Invisible)
            && !target.passiveEffect(EffectType.RangedTargetImmunity)
            && Boolean(source.passiveEffect(EffectType.Dodge)?.counterOnDodge);
    }

    private dodgeCounterDamage(source: Card, target: Card): number {
        return this.tankBlocks(source, target, AttackType.Ranged) ? Math.floor(source.attack / 2) : source.attack;
    }

    private applyDodgeCounter(source: CardView, target: CardView): number {
        return this.applyCombatDamage(source, target, this.dodgeCounterDamage(source.card, target.card),
            "Menzilli karşı saldırı", this.dodges(source.card, target.card));
    }

    private showDodgeCounter(source: CardView, target: CardView): void {
        if (!this.canCounterOnDodge(source.card, target.card)) return;
        const damage = this.applyDodgeCounter(source, target);
        this._broadcast.emit(BroadcastEvents.SHOW_DAMAGE_ANIMATION, { targetView: target, damage });
    }

    private previewDamage(source: Card, target: Card, damage: number): number {
        return this.ignoresDefense(source) ? damage : this.damageAfterProtection(target, damage);
    }

    private livingProtector(target: Card): Card | undefined {
        const protector = target.activeEffects.find(effect => effect.type === EffectType.Protection)?.protector;
        return protector && protector.health > 0 ? protector : undefined;
    }

    private damageAfterProtection(target: Card, damage: number): number {
        const protector = this.livingProtector(target);
        return protector ? damage - Math.min(protector.health, Math.floor(damage / 2)) : damage;
    }

    private tankBlocks(attacker: Card, defender: Card, attackType = attacker.attackType): boolean {
        return !defender.isZombified && (defender.classType === ClassType.Tank || Boolean(defender.passiveEffect(EffectType.IronWall)))
            && attackType === AttackType.Ranged && !this.ignoresDefense(attacker);
    }

    public previewCombat(attacker: Card, defender: Card) {
        const reduction = this.tankBlocks(attacker, defender) ? 0.5 : 1;
        const normal = this.previewDamage(attacker, defender, defender.amplifyIncomingDamage(Math.floor(attacker.attack * reduction)));
        const critChance = this.attackCritChance(attacker);
        const critical = critChance > 0
            ? this.previewDamage(attacker, defender, defender.amplifyIncomingDamage(Math.floor(attacker.attack * 2 * reduction)))
            : null;
        const canCounter = attacker.attackType === AttackType.Melee && !attacker.hasEffect(EffectType.Invisible)
            && !defender.isPhoenixEgg && !defender.hasEffect(EffectType.Freeze);
        const counter = canCounter ? this.previewDamage(defender, attacker, this.calculateCounterDamage(defender)) : 0;
        const counterCritChance = canCounter ? defender.passiveEffect(EffectType.CritBoost)?.chance ?? 0 : 0;
        const counterCritical = counterCritChance > 0 ? this.previewDamage(defender, attacker, defender.attack * 2) : null;
        const dodgeCounter = this.dodgeChance(attacker, defender) > 0 && this.canCounterOnDodge(defender, attacker)
            ? this.previewDamage(defender, attacker, this.dodgeCounterDamage(defender, attacker)) : null;
        return { normal, critical, counter, counterCritical, critChance, counterCritChance, dodgeCounter,
            dodgeChance: this.dodgeChance(attacker, defender),
            counterDodgeChance: canCounter ? this.dodgeChance(defender, attacker) : 0 };
    }

    // Helper function to get initial health from character data
    private getInitialHealth = (card: Card): number => {
        const characterData = Object.values(CharacterList).find(char =>
            char.name === card.name.replace(/^Leader /, "") // Remove "Leader " prefix if present
        );
        if (characterData) {
            // If it's a leader card, add the leader bonus
            return card.name.includes("Leader") ? characterData.health + 5 : characterData.health;
        }
        // Fallback: assume current health is initial health
        return card.health;
    };

    public calculateCounterDamage(defender: Card | null, rollCritical = false): number {
        if (!defender || defender.health <= 0 || defender.isPhoenixEgg || defender.hasEffect(EffectType.Freeze)) {
            //console.log("Defender is null or dead, no counter damage.");
            return 0;
        }

        const chance = defender.passiveEffect(EffectType.CritBoost)?.chance ?? 0;
        return rollCritical && chance > 0 && this.random() <= chance ? defender.attack * 2 : defender.attack;
    }

    private calculateAttackDamage(attacker: CardView, defender: CardView, critical: boolean): number {
        const damage = critical ? Math.floor(attacker.card.attack * 2) : attacker.card.attack;
        if (critical && attacker.element.isConnected) {
            this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                targetView: attacker, message: "Critical Strike!", color: 0xff0000
            });
        }

        if (this.tankBlocks(attacker.card, defender.card)) {
            return this.handleTankAbility(damage, defender);
        }

        return damage;
    }

    public handleWarriorAbility(playerCardViews: CardView[], botCardViews: CardView[]): void {
        // Null/undefined kontrolü
        if (!playerCardViews || !botCardViews) {
            //console.warn("handleWarriorAbility: Invalid data received", data);
            return;
        }

        const allCardViews = [...playerCardViews, ...botCardViews];
        for (const cardView of allCardViews) {
            const card = cardView?.card;
            if (!card) continue;

            if (card.classType === ClassType.Warrior && !card.isZombified && card.health > 0
                && !card.warriorRageUsed && !card.blocksStatRecovery) {
                const initialHealth = this.getInitialHealth(card);
                const currentHealthPercentage = (card.health / initialHealth) * 100;

                if (currentHealthPercentage <= 50) {
                    const attackBonus = Math.floor(card.attack * 0.5);
                    card.increaseAttack(attackBonus);
                    card.warriorRageUsed = true;

                    //console.log(`${card.Name} enters berserker rage! Attack increased by ${attackBonus}!`);

                    card.addEffect?.({
                        type: EffectType.WarriorRage,
                        target: card,
                        duration: 999,
                        value: attackBonus
                    });

                    const abilityMessage = {
                        targetView: cardView,
                        message: "Berserker Rage!",
                        color: 0xff4444,
                    };

                    this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, abilityMessage);

                    cardView.updateStats();
                }
            }
        }
    }

    private handleMageAbility(data: { attacker: CardView, opponentCardViews: CardView[] }): void {
        const { attacker, opponentCardViews } = data;

        // IMPORTANT: Only apply if the attacker is actually a Mage
        if (attacker.card.classType !== ClassType.Mage || attacker.card.isZombified || attacker.card.isPhoenixEgg || attacker.card.health <= 0) {
            //console.log(`ERROR: MageAbility called for non-Mage card: ${attacker.Name} (ClassType: ${attacker.ClassType})`);
            return;
        }

        // Arcane Blast: After attacking, deal 50% base damage to one random opponent (except leader)
        const randomTarget = this.getRandomOpponentTarget(attacker.card, opponentCardViews);

        const targetView = opponentCardViews.find(view => view.card === randomTarget);
        if (targetView) {
            const dodged = this.dodges(attacker.card, targetView.card);
            const mageDamage = this.applyCombatDamage(attacker, targetView, Math.floor(attacker.card.attack * 0.5), "Arcane Blast", dodged);
            if (dodged) this.showDodgeCounter(targetView, attacker);

            if (targetView.element.isConnected) {
                this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                    targetView,
                    sourceView: attacker,
                    message: "Arcane Blast!",
                    color: 0x9966ff
                });
                setTimeout(() => {
                    this._broadcast.emit(BroadcastEvents.SHOW_DAMAGE_ANIMATION, {
                        targetView: targetView,
                        damage: mageDamage
                    });
                }, 250);
            }
        }
    }

    private getRandomOpponentTarget(attacker: Card, opponentCardViews: CardView[]): Card | null {
        // Get all non-leader cards (we don't want to exclude originalTarget since it's not in opponent hand)
        const opponents = opponentCardViews.map(view => view.card);
        const provoker = this.getActiveProvoker(attacker, opponents);
        const availableTargets = opponents.filter(card =>
            card.unitType !== UnitType.Leader && card.health > 0 && !this.blocksInvisibleTarget(attacker, card, opponents)
            && !this.blocksRangedTarget(attacker, card, opponents)
            && (!provoker || card === provoker));

        if (availableTargets.length === 0) return null;

        // Return random target
        const randomIndex = Math.floor(this.random() * availableTargets.length);
        return availableTargets[randomIndex];
    }

    private attackCritChance(card: Card): number {
        if (card.classType !== ClassType.Rogue || card.isZombified) return 0;
        return 0.25 * (card.passiveEffect(EffectType.CritBoost)?.value ?? 1);
    }

    private handleTankAbility(damage: number, defender: CardView): number {
        // Iron Wall: Take 50% less damage from ranged attacks
        //console.log(`${defender.card.Name}'s Iron Wall reduces ranged damage!`);

        if (defender.element.isConnected) {
            this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                targetView: defender,
                message: "Iron Wall!",
                color: 0x00ccff
            });
        }

        return Math.floor(damage * 0.5);
    }

    // Skill trigger metodları
    private triggerAttackSkill(attacker: CardView, defender: CardView, context: CombatContext, timing: SkillTiming, color: string): void {
        const copy = attacker.card.readyCopiedSkill;
        const skill = copy ?? attacker.card.skill;
        if (skill?.triggerTiming !== timing) return;

        const result = copy
            ? attacker.card.useCopiedSkill(defender.card, context)
            : attacker.card.useSkill(defender.card, context);
        if (result?.success && result.message) {
            this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                targetView: attacker, abilityName: skill.name, message: result.message, color
            });
        }
    }

    private triggerDamageReceivedSkills(context: CombatContext, targetView: CardView): void {
        if (context.defender && context.defender.skill?.triggerTiming === SkillTiming.OnDamageReceived) {
            const result = context.defender.useSkill?.(context.attacker, context);
            if (result?.success && result.message) {
                this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                    targetView,
                    abilityName: context.defender.skill.name,
                    message: result.message,
                    color: "#9932cc"
                });
            }
        }
    }

    public set player(player: Player) {
        this._player = player;
    }

    public set opponent(opponent: Player) {
        this._opponent = opponent;
    }
}
