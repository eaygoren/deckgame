import { AttackType, Card, LeaderCard } from "../game/Card";
import { Player } from "../game/Player";
import { getInitialHealth } from "../shared/constants";
import { ClassType } from "../shared/enums";
import { ISelectedCard } from "../shared/interfaces";
import { CardView } from "../ui/CardView";
import { AnimationManager } from "./AnimationManager";

export class CombatManager {
    private static instance: CombatManager;
    private _animationManager: AnimationManager;

    private constructor() {
        this._animationManager = AnimationManager.getInstance();
    }

    public static getInstance(): CombatManager {
        if (!CombatManager.instance) {
            CombatManager.instance = new CombatManager();
        }
        return CombatManager.instance;
    }

    public calculateAttackDamage(attacker: Card, defender: Card, triggerAbilities: boolean = true): number {
        console.log(`calculateAttackDamage called - Attacker: ${attacker.Name} (ID: ${attacker.Id}, ClassType: ${attacker.ClassType}), Defender: ${defender.Name} (ID: ${defender.Id})`);
        console.log(`Attacker ability: ${attacker.Ability?.name || 'None'}, has modifyAttackDamage: ${!!attacker.Ability?.modifyAttackDamage}, triggerAbilities: ${triggerAbilities}`);
        let baseDamage = attacker.Attack;

        // Apply attacker's abilities using the new ability system (only if triggerAbilities is true)
        if (triggerAbilities && attacker.Ability?.modifyAttackDamage) {
            console.log(`Calling modifyAttackDamage for ${attacker.Name} with ability: ${attacker.Ability.name}`);
            baseDamage = attacker.Ability.modifyAttackDamage(attacker, defender, baseDamage, this);
        }

        // Apply defender's defensive abilities using the new ability system (only if triggerAbilities is true)
        if (triggerAbilities && defender.Ability?.modifyDefenseDamage) {
            baseDamage = defender.Ability.modifyDefenseDamage(attacker, defender, baseDamage, this);
        }

        return baseDamage;
    }

    public calculateCounterDamage(_attacker: Card, defender: Card): number {
        let counterDamage = defender.Attack;

        // No special counter-damage modifications for Tank here
        // Tank's defensive ability is handled in calculateAttackDamage

        return counterDamage;
    }

    private handlePostDamageAbilities(attacker: Card, defender: Card): void {
        // Use the new ability system for post-damage abilities
        if (attacker.Ability?.onPostAttack) {
            attacker.Ability.onPostAttack(attacker, defender, this);
        }

        // Check for Warrior berserker rage activation (for both attacker and defender)
        this.checkWarriorRage(attacker);
        this.checkWarriorRage(defender);
    }

    private checkWarriorRage(card: Card, player: Player, playerCardViews: CardView[], botCardViews: CardView[]): void {
        if (card.ClassType === ClassType.Warrior && card.Health > 0 && !card.WarriorRageActivated) {
            const initialHealth = getInitialHealth(card);
            const currentHealthPercentage = (card.Health / initialHealth) * 100;

            // Check if warrior health is below 50% and rage hasn't been activated yet
            if (currentHealthPercentage <= 50) {
                const attackBonus = Math.floor(card.Attack * 0.5);
                card.Attack += attackBonus;
                card.WarriorRageActivated = true; // Mark as activated permanently
                console.log(`${card.Name} enters berserker rage! Attack increased by ${attackBonus}!`);
                // Show berserker rage message
                const cardView = player.hand.includes(card)
                    ? playerCardViews.find(view => view.card === card)
                    : botCardViews.find(view => view.card === card);

                if (cardView && !cardView.destroyed && cardView.parent) {
                    this._animationManager.showAbilityMessage(cardView.x, cardView.y, "Berserker Rage!", 0xff4444);
                    // Update the card view to show new stats
                    cardView.update();
                }
            }
        }
    }

    public hasWarriorRageActivated(card: Card): boolean {
        return card.WarriorRageActivated;
    }

    public getRandomOpponentTarget(originalTarget: Card, player: Player, bot: Player, ): Card | null {
        // Determine which player's hand to check (opponent of the original target)
        // If originalTarget is in player hand, we want to target bot hand (and vice versa)
        const opponentHand = player.hand.includes(originalTarget) ? bot.hand : player.hand;

        // Get all non-leader cards (we don't want to exclude originalTarget since it's not in opponent hand)
        const availableTargets = opponentHand.filter((card: Card) =>
            !(card instanceof LeaderCard)
        );

        if (availableTargets.length === 0) return null;

        // Return random target
        const randomIndex = Math.floor(Math.random() * availableTargets.length);
        return availableTargets[randomIndex];
    }

    public completeCombat(attacker: Card, defender: Card, selectedAttacker: ISelectedCard | null, selectedDefender: ISelectedCard | null, attackDamage: number, counterDamage: number) {
        // Hasar uygula
        defender.Health = Math.max(0, defender.Health - attackDamage);

        if (attacker.AttackType === AttackType.Melee) {
            attacker.Health = Math.max(0, attacker.Health - counterDamage);
        }

        // Post-damage abilities
        this.handlePostDamageAbilities(attacker, defender);    // Stats güncelle - null check
        if (selectedAttacker?.view && !selectedAttacker.view.destroyed) {
            selectedAttacker.view.update();
            // Scale'i sıfırla
            gsap.to(selectedAttacker.view.scale, { x: 1, y: 1, duration: 0.2 });
        }

        if (selectedDefender?.view && !selectedDefender.view.destroyed) {
            selectedDefender.view.update();
            // Scale'i sıfırla
            gsap.to(selectedDefender.view.scale, { x: 1, y: 1, duration: 0.2 });
        }

        // Ölü kartları kaldır (animasyonla)
        this._animationManager.removeDeadCardsWithAnimation();

        selectedAttacker = null;
        selectedDefender = null;
        this._turn = "bot";
        setTimeout(() => this.botTurn(), 1000); // Biraz daha fazla bekleme süresi
    }

    public completeBotCombat(attacker: Card, defender: Card, attackDamage: number, counterDamage: number, attackerView: CardView, defenderView: CardView) {
        // Hasar uygula
        defender.Health = Math.max(0, defender.Health - attackDamage);

        if (attacker.AttackType === AttackType.Melee) {
            attacker.Health = Math.max(0, attacker.Health - counterDamage);
        }

        // Post-damage abilities
        this.handlePostDamageAbilities(attacker, defender);

        // Stats güncelle - null check
        if (attackerView && !attackerView.destroyed) {
            attackerView.update();
            // Scale'i sıfırla
            gsap.to(attackerView.scale, { x: 1, y: 1, duration: 0.2 });
        }

        if (defenderView && !defenderView.destroyed) {
            defenderView.update();
            // Scale'i sıfırla
            gsap.to(defenderView.scale, { x: 1, y: 1, duration: 0.2 });
        }

        // Ölü kartları kaldır (animasyonla)
        this._animationManager.removeDeadCardsWithAnimation();

        // Bot turn'ü bitir
        this._turn = "player";
    }
}