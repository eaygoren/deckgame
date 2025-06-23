import { AttackType, Card, LeaderCard } from "../game/Card";
import { BroadcastEvents, getInitialHealth } from "../shared/constants";
import { ClassType } from "../shared/enums";
import { CombatOption } from "../shared/interfaces";
import { CardView } from "../ui/CardView";
import { Broadcast } from "../utils/Broadcast";
import { gsap } from "gsap";

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
        this._broadcast.on(BroadcastEvents.COMPLETE_PLAYER_COMBAT, this.completePlayerCombat.bind(this));
        this._broadcast.on(BroadcastEvents.COMPLETE_BOT_COMBAT, this.completeBotCombat.bind(this));
        this._broadcast.on(BroadcastEvents.CHECK_WARRIOR_RAGE, this.handleWarriorAbility.bind(this));
        this._broadcast.on(BroadcastEvents.CHECK_ARCANE_BLAST, this.handleMageAbility.bind(this));
    }

    public calculateAttackDamage(attacker: CardView, defender: CardView): number {
        let baseDamage = this.handleBaseDamage(attacker, defender);

        return baseDamage;
    }

    public calculateCounterDamage(defender: Card | null): number {
        if (!defender || defender.Health <= 0) {
            //console.log("Defender is null or dead, no counter damage.");
            return 0;
        }

        let counterDamage = defender.Attack;

        return counterDamage;
    }

    private handleBaseDamage(attacker: CardView, defender: CardView): number {
        switch (attacker?.card.ClassType) {
            case ClassType.Rogue:
                if (attacker) {
                    return this.handleRogueAbility(attacker);
                }
        }

        switch (defender?.card.ClassType) {
            case ClassType.Tank:
                if (attacker && attacker.card.AttackType === AttackType.Ranged) {
                    return this.handleTankAbility(attacker, defender);
                }
        }

        return attacker.card.Attack; // Default to attack value if no special ability applies
    }

    private handleWarriorAbility(data: { playerCardViews: CardView[], botCardViews: CardView[] }): void {
        // Null/undefined kontrolü
        if (!data || !data.playerCardViews || !data.botCardViews) {
            //console.warn("handleWarriorAbility: Invalid data received", data);
            return;
        }

        const allCardViews = [...data.playerCardViews, ...data.botCardViews];
        for (const cardView of allCardViews) {
            const card = cardView?.card;
            if (!card) continue;

            if (card.ClassType === ClassType.Warrior && card.Health > 0 && !card.WarriorRageActivated) {
                const initialHealth = getInitialHealth(card);
                const currentHealthPercentage = (card.Health / initialHealth) * 100;

                if (currentHealthPercentage <= 50) {
                    const attackBonus = Math.floor(card.Attack * 0.5);
                    card.Attack += attackBonus;
                    card.WarriorRageActivated = true;

                    //console.log(`${card.Name} enters berserker rage! Attack increased by ${attackBonus}!`);

                    if (cardView && !cardView.destroyed && cardView.parent) {
                        const abilityMessage = {
                            x: cardView.x,
                            y: cardView.y,
                            message: "Berserker Rage!",
                            color: 0xff4444,
                        };
                        this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, abilityMessage);
                        cardView.update();
                    }
                }
            }
        }
    }

    private handleMageAbility(data: { attacker: CardView, opponentCardViews: CardView[] }): void {
        const { attacker, opponentCardViews } = data;

        // IMPORTANT: Only apply if the attacker is actually a Mage
        if (attacker.card.ClassType !== ClassType.Mage) {
            //console.log(`ERROR: MageAbility called for non-Mage card: ${attacker.Name} (ClassType: ${attacker.ClassType})`);
            return;
        }

        // Arcane Blast: After attacking, deal 50% base damage to one random opponent (except leader)
        const randomTarget = this.getRandomOpponentTarget(opponentCardViews);

        if (randomTarget) {
            const mageDamage = Math.floor(attacker.card.Attack * 0.5);

            randomTarget.Health = Math.max(0, randomTarget.Health - mageDamage);
            //console.log(`${attacker.Name}'s Arcane Blast hits ${randomTarget.Name} for ${mageDamage} damage!`); // Find the target's view and show ability message and damage

            const targetView = opponentCardViews.find(view => view.card.Id === randomTarget.Id);
            
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
        const availableTargets = opponentCardViews.map(view => view.card).filter(card => !(card instanceof LeaderCard) && card.Health > 0);

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

            if (attacker && !attacker.destroyed && attacker.parent) {
                this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
                    x: attacker.x,
                    y: attacker.y,
                    message: "Critical Strike!",
                    color: 0xff0000
                });
            } else {
                //console.log("Cannot show the message!");
            }

            return Math.floor(attacker.card.Attack * 2);
        }
        return attacker.card.Attack;
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

        return Math.floor(attacker.card.Attack * 0.5);
    }

    public completePlayerCombat(data: CombatOption) {
        const { attacker, defender, attackDamage, counterDamage } = data;

        // Hasar uygula
        defender.card.Health = Math.max(0, defender.card.Health - attackDamage);

        if (attacker.card.AttackType === AttackType.Melee) {
            attacker.card.Health = Math.max(0, attacker.card.Health - counterDamage);
        }

        if (attacker && !attacker.destroyed) {
            attacker.update();
            // Scale'i sıfırla
            gsap.to(attacker.scale, { x: 1, y: 1, duration: 0.2 });
        }

        if (defender && !defender.destroyed) {
            defender.update();
            // Scale'i sıfırla
            gsap.to(defender.scale, { x: 1, y: 1, duration: 0.2 });
        }

        // Ölü kartları kaldır (animasyonla)
        this._broadcast.emit(BroadcastEvents.PLAYER_COMBAT_COMPLETED, data);
    }

    public completeBotCombat(data: CombatOption) {
        const { attacker, defender, attackDamage, counterDamage } = data;

        // Hasar uygula
        defender.card.Health = Math.max(0, defender.card.Health - attackDamage);

        if (attacker.card.AttackType === AttackType.Melee) {
            attacker.card.Health = Math.max(0, attacker.card.Health - counterDamage);
        }

        // Stats güncelle - null check
        if (attacker && !attacker.destroyed) {
            attacker.update();
            // Scale'i sıfırla
            gsap.to(attacker.scale, { x: 1, y: 1, duration: 0.2 });
        }

        if (defender && !defender.destroyed) {
            defender.update();
            // Scale'i sıfırla
            gsap.to(defender.scale, { x: 1, y: 1, duration: 0.2 });
        }

        this._broadcast.emit(BroadcastEvents.BOT_COMBAT_COMPLETED, data);
    }
}