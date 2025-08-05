import { Card } from "../game/Card";
import { CharacterList } from "../shared/constants/characters";
import { BroadcastEvents } from "../shared/constants/events";
import { AttackType, ClassType, UnitType } from "../shared/enums";
import { CombatOption } from "../shared/interfaces";
import { CombatContext, EffectType, SkillTiming } from "../shared/interfaces/skillInterfaces";
import { CardView } from "../ui/CardView";
import { Broadcast } from "../utils/Broadcast";

export class CombatManager {
    private static instance: CombatManager;
    private _broadcast: Broadcast;

    private constructor() {
        this._broadcast = Broadcast.getInstance();
        this.eventListeners();
    }

    public static getInstance(): CombatManager {
        if (!CombatManager.instance) {
            CombatManager.instance = new CombatManager();
        }
        return CombatManager.instance;
    }

    private eventListeners() {
        this._broadcast.on(BroadcastEvents.CHECK_ARCANE_BLAST, this.handleMageAbility.bind(this));
    }

    public async resolveCombat(attacker: CardView, defender: CardView): Promise<CombatOption> {
        // 1. İlk damage hesaplama
        const initialAttackDamage = this.calculateAttackDamage(attacker, defender);
        const initialCounterDamage = this.calculateCounterDamage(defender.card);

        const combatData: CombatOption = {
            attacker,
            defender,
            attackDamage: initialAttackDamage,
            counterDamage: initialCounterDamage
        };

        // 2. Context oluştur
        const context: CombatContext = {
            attacker: attacker.card,
            defender: defender.card,
            damage: initialAttackDamage,
            isCounterAttack: false,
            allPlayerCards: [],
            allBotCards: []
        };

        // 3. BeforeAttack Skills (Joker, Illusionist)
        if (context.attacker.skill?.triggerTiming === SkillTiming.BeforeAttack) {
            this.triggerBeforeAttackSkills(context);

            // 4. Skill sonrası damage yeniden hesapla
            const newAttackDamage = this.calculateAttackDamage(attacker, defender);
            const newCounterDamage = this.calculateCounterDamage(defender.card);

            combatData.attackDamage = newAttackDamage;
            combatData.counterDamage = newCounterDamage;
            context.damage = newAttackDamage;

            // 5. Stats'ları hemen güncelle
            attacker.updateStats();
        }

        // 6. Hasarları uygula (health'ler değişsin ama animation öncesi)
        this.applyDamageToCards(combatData);

        // 7. AfterAttack skills
        this.triggerAfterAttackSkills(context);
        this.triggerDamageReceivedSkills(context);

        return combatData;
    }

    private applyDamageToCards(combatData: CombatOption): void {
        const { attacker, defender, attackDamage, counterDamage } = combatData;

        // Ana hasar
        defender.card.health = Math.max(0, defender.card.health - attackDamage);

        // Counter hasar
        if (attacker.card.attackType === AttackType.Melee &&
            !attacker.card.hasEffect?.(EffectType.Invisible)) {
            attacker.card.health = Math.max(0, attacker.card.health - counterDamage);
        }
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
        switch (attacker?.card.classType) {
            case ClassType.Rogue:
                if (attacker) {
                    return this.handleRogueAbility(attacker);
                }
        }

        switch (defender?.card.classType) {
            case ClassType.Tank:
                if (attacker && attacker.card.attackType === AttackType.Ranged) {
                    return this.handleTankAbility(attacker, defender);
                }
        }

        return attacker.card.attack; // Default to attack value if no special ability applies
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
                        duration: 999, // Permanent
                        value: attackBonus // Bonus miktarını sakla
                    });

                    if (cardView && !cardView.destroyed && cardView.parent) {
                        const abilityMessage = {
                            x: cardView.x,
                            y: cardView.y,
                            message: "Berserker Rage!",
                            color: 0xff4444,
                        };
                        this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, abilityMessage);
                        cardView.updateStats();
                    }
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

        if (randomTarget) {
            const mageDamage = Math.floor(attacker.card.attack * 0.5);

            randomTarget.health = Math.max(0, randomTarget.health - mageDamage);
            //console.log(`${attacker.Name}'s Arcane Blast hits ${randomTarget.Name} for ${mageDamage} damage!`); // Find the target's view and show ability message and damage

            const targetView = opponentCardViews.find(view => view.card.id === randomTarget.id);

            if (targetView && !targetView.destroyed && targetView.parent) {
                this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                    x: targetView.x,
                    y: targetView.y,
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

            if (attacker && !attacker.destroyed && attacker.parent) {
                this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                    x: attacker.x,
                    y: attacker.y,
                    message: "Critical Strike!",
                    color: 0xff0000
                });
            }

            return critDamage;
        }

        return attacker.card.attack;
    }

    private handleTankAbility(attacker: CardView, defender: CardView): number {
        // Iron Wall: Take 50% less damage from ranged attacks
        //console.log(`${defender.card.Name}'s Iron Wall reduces ranged damage!`);

        if (defender && !defender.destroyed && defender.parent) {
            this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                x: defender.x,
                y: defender.y,
                message: "Iron Wall!",
                color: 0x00ccff
            });
        }

        return Math.floor(attacker.card.attack * 0.5);
    }

    // Skill trigger metodları
    private triggerBeforeAttackSkills(context: CombatContext): void {
        if (context.defender && context.attacker.skill?.triggerTiming === SkillTiming.BeforeAttack) {
            const result = context.attacker.useSkill?.(context.defender, context);
            if (result?.success && result.message) {
                this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                    message: result.message,
                    color: "#9932cc"
                });
            }
        }
    }

    private triggerAfterAttackSkills(context: CombatContext): void {
        if (context.defender && context.attacker.skill?.triggerTiming === SkillTiming.AfterAttack) {
            const result = context.attacker.useSkill?.(context.defender, context);
            if (result?.success) {
                if (result.message) {
                    this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                        message: result.message,
                        color: "#ff6600"
                    });
                }
            }
        }
    }

    private triggerDamageReceivedSkills(context: CombatContext): void {
        if (context.defender && context.defender.skill?.triggerTiming === SkillTiming.OnDamageReceived) {
            const result = context.defender.useSkill?.(context.attacker, context);
            if (result?.success && result.message) {
                this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
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
}