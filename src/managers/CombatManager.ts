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

    constructor(private readonly _broadcast: Broadcast) {
        this.eventListeners();
    }

    private eventListeners() {
        this._broadcast.on(BroadcastEvents.CHECK_ARCANE_BLAST, this.handleMageAbility.bind(this));
    }

    public async resolveCombat(attacker: CardView, defender: CardView): Promise<CombatOption | null> {
        if (attacker.card.hasEffect(EffectType.Freeze)) return null;

        const context: CombatContext = {
            attacker: attacker.card,
            defender: defender.card,
            isCounterAttack: false,
            allPlayerCards: this._player.hand,
            allOpponentCards: this._opponent.hand,
            player: this._player,
            opponent: this._opponent
        };

        if (context.attacker?.skill?.triggerTiming === SkillTiming.BeforeAttack) {
            this.triggerBeforeAttackSkills(context, attacker);
            attacker.updateStats();
        }

        const combatData: CombatOption = {
            attacker,
            defender,
            attackDamage: this.calculateAttackDamage(attacker, defender),
            counterDamage: this.calculateCounterDamage(defender.card)
        };

        // 6. Hasarları uygula (health'ler değişsin ama animation öncesi)
        const defenderWasAlive = defender.card.health > 0;
        this.applyDamageToCards(combatData);
        context.damage = combatData.attackDamage;
        const killedDefender = defenderWasAlive && defender.card.health <= 0;

        // 7. AfterAttack skills
        this.triggerAfterAttackSkills(context, attacker);
        this.triggerDamageReceivedSkills(context, defender);

        if (killedDefender && attacker.card.skill?.triggerTiming === SkillTiming.OnKill) {
            const result = attacker.card.useSkill(defender.card, context);
            if (result?.success && result.message) {
                this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                    targetView: attacker,
                    abilityName: attacker.card.skill.name,
                    message: result.message,
                    color: "#00ff00"
                });
            }
        }

        return combatData;
    }

    private applyDamageToCards(combatData: CombatOption): void {
        const { attacker, defender, attackDamage, counterDamage } = combatData;

        // Ana hasar
        combatData.attackDamage = this.applyCombatDamage(attacker, defender, attackDamage, "Saldırı");

        // Counter hasar
        if (attacker.card.attackType === AttackType.Melee &&
            !attacker.card.hasEffect?.(EffectType.Invisible)) {
            combatData.counterDamage = this.applyCombatDamage(defender, attacker, counterDamage, "Karşı saldırı");
        } else {
            combatData.counterDamage = 0;
        }
    }

    private applyCombatDamage(source: CardView, targetView: CardView, damage: number, action: string): number {
        const target = targetView.card;
        const protector = this.livingProtector(target);
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
            source, target: targetView, action, shared, damage: previousHealth - target.health
        });
        return damage;
    }

    private livingProtector(target: Card): Card | undefined {
        const protector = target.activeEffects.find(effect => effect.type === EffectType.Protection)?.protector;
        return protector && protector.health > 0 ? protector : undefined;
    }

    private damageAfterProtection(target: Card, damage: number): number {
        return this.livingProtector(target) ? Math.ceil(damage / 2) : damage;
    }

    private tankBlocks(attacker: Card, defender: Card): boolean {
        return defender.classType === ClassType.Tank && attacker.attackType === AttackType.Ranged;
    }

    public previewCombat(attacker: Card, defender: Card) {
        const reduction = this.tankBlocks(attacker, defender) ? 0.5 : 1;
        const normal = this.damageAfterProtection(defender, Math.floor(attacker.attack * reduction));
        const critical = attacker.classType === ClassType.Rogue
            ? this.damageAfterProtection(defender, Math.floor(attacker.attack * 2 * reduction))
            : null;
        const counter = attacker.attackType === AttackType.Melee && !attacker.hasEffect(EffectType.Invisible)
            ? this.damageAfterProtection(attacker, this.calculateCounterDamage(defender))
            : 0;
        return { normal, critical, counter };
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

    public calculateAttackDamage(attacker: CardView, defender: CardView): number {
        let baseDamage = this.handleBaseDamage(attacker, defender);

        return baseDamage;
    }

    public calculateCounterDamage(defender: Card | null): number {
        if (!defender || defender.health <= 0) {
            //console.log("Defender is null or dead, no counter damage.");
            return 0;
        }

        let counterDamage = defender.attack;

        return counterDamage;
    }

    private handleBaseDamage(attacker: CardView, defender: CardView): number {
        const damage = attacker.card.classType === ClassType.Rogue
            ? this.handleRogueAbility(attacker)
            : attacker.card.attack;

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

            if (card.classType === ClassType.Warrior && card.health > 0 && !card.hasEffect?.(EffectType.WarriorRage)) {
                const initialHealth = this.getInitialHealth(card);
                const currentHealthPercentage = (card.health / initialHealth) * 100;

                if (currentHealthPercentage <= 50) {
                    const attackBonus = Math.floor(card.attack * 0.5);
                    card.attack += attackBonus;

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
        if (attacker.card.classType !== ClassType.Mage) {
            //console.log(`ERROR: MageAbility called for non-Mage card: ${attacker.Name} (ClassType: ${attacker.ClassType})`);
            return;
        }

        // Arcane Blast: After attacking, deal 50% base damage to one random opponent (except leader)
        const randomTarget = this.getRandomOpponentTarget(opponentCardViews);

        const targetView = opponentCardViews.find(view => view.card === randomTarget);
        if (targetView) {
            const mageDamage = this.applyCombatDamage(attacker, targetView, Math.floor(attacker.card.attack * 0.5), "Arcane Blast");

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

    private getRandomOpponentTarget(opponentCardViews: CardView[]): Card | null {
        // Get all non-leader cards (we don't want to exclude originalTarget since it's not in opponent hand)
        const availableTargets = opponentCardViews.map(view => view.card).filter(card => !(card.unitType === UnitType.Leader) && card.health > 0);

        if (availableTargets.length === 0) return null;

        // Return random target
        const randomIndex = Math.floor(Math.random() * availableTargets.length);
        return availableTargets[randomIndex];
    }

    private handleRogueAbility(attacker: CardView): number {
        const critChance = Math.random();

        // Critical Strike: 25% chance to deal double damage
        if (critChance <= 0.25) {
            //console.log(`${attacker.card.Name} landed a critical strike!`);
            const critDamage = Math.floor(attacker.card.attack * 2);

            if (attacker.element.isConnected) {
                this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                    targetView: attacker,
                    message: "Critical Strike!",
                    color: 0xff0000
                });
            }

            return critDamage;
        }

        return attacker.card.attack;
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
    private triggerBeforeAttackSkills(context: CombatContext, targetView: CardView): void {
        if (context.defender && context.attacker?.skill?.triggerTiming === SkillTiming.BeforeAttack) {
            const result = context.attacker.useSkill?.(context.defender, context);
            if (result?.success && result.message) {
                this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                    targetView,
                    abilityName: context.attacker.skill.name,
                    message: result.message,
                    color: "#9932cc"
                });
            }
        }
    }

    private triggerAfterAttackSkills(context: CombatContext, targetView: CardView): void {
        if (context.defender && context.attacker?.skill?.triggerTiming === SkillTiming.AfterAttack) {
            const result = context.attacker.useSkill?.(context.defender, context);
            if (result?.success) {
                if (result.message) {
                    this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                        targetView,
                        abilityName: context.attacker.skill.name,
                        message: result.message,
                        color: "#ff6600"
                    });
                }
            }
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

    // private checkDodge(defender: Card): boolean {
    //     if (defender.hasEffect?.(EffectType.Dodge)) {
    //         return Math.random() < 0.25; // %25 şans
    //     }
    //     return false;
    // }

    public set player(player: Player) {
        this._player = player;
    }

    public set opponent(opponent: Player) {
        this._opponent = opponent;
    }
}
