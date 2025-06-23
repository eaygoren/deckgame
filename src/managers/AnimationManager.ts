import { gsap } from 'gsap';
import { Text } from 'pixi.js';
import { CardView } from '../ui/CardView';
import { BattleField } from '../ui/BattleField';
import { AttackType } from '../shared/enums';
import { Card, LeaderCard } from '../game/Card';
import { CombatOption } from '../shared/interfaces';
import { Broadcast } from '../utils/Broadcast';
import { BroadcastEvents, CARD_POSITIONS } from '../shared/constants';

export class AnimationManager {
    private static instance: AnimationManager;
    private _broadcast: Broadcast;
    private _battlefield: BattleField;
    private _activeAnimations: (gsap.core.Tween | gsap.core.Timeline)[] = []; // Active animasyonları takip et

    private constructor() {
        this._broadcast = Broadcast.getInstance();
        this._battlefield = BattleField.getInstance();

        this.eventListeners();
    }

    public static getInstance(): AnimationManager {
        if (!AnimationManager.instance) {
            AnimationManager.instance = new AnimationManager();
        }
        return AnimationManager.instance;
    }

    // Tüm aktif animasyonları durdur
    public stopAllAnimations() {
        //console.log("Stopping all GSAP animations to prevent null reference errors");
        this._activeAnimations.forEach(animation => {
            if (animation && animation.isActive()) {
                animation.kill();
            }
        });
        this._activeAnimations = [];
        gsap.killTweensOf("*"); // Tüm GSAP animasyonlarını durdur
    }

    // Animasyon tracker helper metodu
    private trackAnimation(animation: gsap.core.Tween | gsap.core.Timeline): gsap.core.Tween | gsap.core.Timeline {
        this._activeAnimations.push(animation);
        return animation;
    }

    private eventListeners() {
        this._broadcast.on(BroadcastEvents.SHOW_ABILITY_MESSAGE, this.showAbilityMessage.bind(this));
        this._broadcast.on(BroadcastEvents.SHOW_DAMAGE_ANIMATION, this.showDamageAnimation.bind(this));
    }

    public async showDamageAnimation(data: { targetView: CardView, damage: number }): Promise<void> {
        const { targetView, damage } = data;

        // Null check ekle
        if (!targetView || targetView.destroyed || !targetView.parent) {
            return;
        }

        // Hasar metnini oluştur
        const damageText = new Text({
            text: `-${damage}`,
            style: {
                fontFamily: 'Arial',
                fontSize: 32,
                fill: 0xff0000,
                fontWeight: 'bold',
                stroke: { color: 0xffffff, width: 2 }
            }
        });

        damageText.x = targetView.x;
        damageText.y = targetView.y - 50;
        damageText.anchor.set(0.5);
        this._battlefield.addChild(damageText);

        // Hasar animasyonu: Yukarı çık ve fade out
        return new Promise<void>((resolve) => {
            const timeline = gsap.timeline();
            this.trackAnimation(timeline);

            timeline
                .to(damageText, { y: damageText.y - 50, duration: 0.5 })
                .to(damageText, { alpha: 0, duration: 0.5 }, "-=0.5")
                .call(() => {
                    if (damageText && damageText.parent) {
                        this._battlefield.removeChild(damageText);
                    }
                    if (targetView && !targetView.destroyed) {
                        targetView.update();
                    }
                    resolve();
                });
        });
    }

    public showAbilityMessage(data: { x: number, y: number, message: string, color: number }) {
        const { x, y, message, color } = data;
        
        const abilityText = new Text({
            text: message,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: color,
                fontWeight: 'bold',
                stroke: { color: 0x000000, width: 2 }
            }
        });

        abilityText.x = x;
        abilityText.y = y - 100;
        abilityText.anchor.set(0.5);
        this._battlefield.addChild(abilityText);

        // Ability mesaj animasyonu
        gsap.timeline()
            .to(abilityText, { y: abilityText.y - 30, alpha: 0.8, duration: 0.3 })
            .to(abilityText, { alpha: 0, duration: 0.7 }, "-=0.3")
            .call(() => {
                this._battlefield.removeChild(abilityText);
            });
    }

    public resolvePlayerAttackWithAnimation(data: CombatOption) {
        const { attacker, defender, attackDamage, counterDamage } = data;

        if (!attacker || !defender) return;

        // 1. Saldırı animasyonu: Saldırgan hedefe doğru hareket eder
        const originalX = attacker.x;
        const originalY = attacker.y;
        const targetX = defender.x;
        const targetY = defender.y;

        // Null check için animasyon öncesi kontrol
        if (attacker.destroyed || defender.destroyed || !attacker.parent || !defender.parent) {
            this._broadcast.emit(BroadcastEvents.COMPLETE_PLAYER_COMBAT, data);
            return;
        }

        // Saldırganı hedefe doğru hareket ettir
        const attackTween = gsap.to(attacker, {
            x: targetX,
            y: targetY,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
                // 2. Saldırgan hedefe ulaştığında hasar animasyonu göster
                this.showDamageAnimation({ targetView: defender, damage: attackDamage }).then(() => {
                    // Animasyon sırasında obje silinmiş olabilir
                    if (!attacker || attacker.destroyed || !attacker.parent) {
                        this._broadcast.emit(BroadcastEvents.COMPLETE_PLAYER_COMBAT, data);
                        return;
                    }

                    // 3. Saldırganı geri gönder
                    const returnTween = gsap.to(attacker, {
                        x: originalX,
                        y: originalY,
                        duration: 0.3,
                        ease: "power2.out",
                        onComplete: () => {
                            // 4. Counter damage (sadece melee için)
                            if (attacker.card.AttackType === AttackType.Melee && counterDamage > 0) {
                                this.showDamageAnimation({ targetView: attacker, damage: counterDamage }).then(() => {
                                    this._broadcast.emit(BroadcastEvents.COMPLETE_PLAYER_COMBAT, data);
                                });
                            } else {
                                this._broadcast.emit(BroadcastEvents.COMPLETE_PLAYER_COMBAT, data);
                            }
                        }
                    });

                    this.trackAnimation(returnTween);
                });
            }
        });

        this.trackAnimation(attackTween);
    }

    public resolveBotAttackWithAnimation(data: CombatOption) {
        const { attacker, defender, attackDamage, counterDamage } = data;

        if (!attacker || !defender) return;

        // Bot saldırı animasyonu
        const originalX = attacker.x;
        const originalY = attacker.y;
        const targetX = defender.x;
        const targetY = defender.y;

        // Null check için animasyon öncesi kontrol
        if (attacker.destroyed || defender.destroyed || !attacker.parent || !defender.parent) {
            this._broadcast.emit(BroadcastEvents.COMPLETE_BOT_COMBAT, data);
            return;
        }

        const attackTween = gsap.to(attacker, {
            x: targetX,
            y: targetY,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
                this.showDamageAnimation({ targetView: defender, damage: attackDamage }).then(() => {
                    // Animasyon sırasında obje silinmiş olabilir
                    if (!attacker || attacker.destroyed || !attacker.parent) {
                        this._broadcast.emit(BroadcastEvents.COMPLETE_BOT_COMBAT, data);
                        return;
                    }

                    const returnTween = gsap.to(attacker, {
                        x: originalX,
                        y: originalY,
                        duration: 0.3,
                        ease: "power2.out",
                        onComplete: () => {
                            if (attacker.card.AttackType === AttackType.Melee && counterDamage > 0) {
                                this.showDamageAnimation({ targetView: attacker, damage: counterDamage }).then(() => {
                                    this._broadcast.emit(BroadcastEvents.COMPLETE_BOT_COMBAT, data);
                                });
                            } else {
                                this._broadcast.emit(BroadcastEvents.COMPLETE_BOT_COMBAT, data);
                            }
                        }
                    });
                    this.trackAnimation(returnTween);
                });
            }
        });

        this.trackAnimation(attackTween);
    }

    public removeDeadCardsWithAnimation(playerCardViews: CardView[], botCardViews: CardView[]) {
        // Ölü kartları tespit et
        const playerDeadViews = playerCardViews.filter(view => view.card.Health <= 0);
        const botDeadViews = botCardViews.filter(view => view.card.Health <= 0);

        // Hayatta kalan kartları tespit et
        const playerAliveViews = playerCardViews.filter(view => view.card.Health > 0);
        const botAliveViews = botCardViews.filter(view => view.card.Health > 0);

        //console.log("Player dead cards:", playerDeadViews.map(v => v.card.Name));
        //console.log("Bot dead cards:", botDeadViews.map(v => v.card.Name));

        // Hayatta kalan kartların view'larını güncelle
        playerAliveViews.forEach(view => view.update());
        botAliveViews.forEach(view => view.update());

        // Animasyonla ölü kartları kaldır
        const deadAnimations: Promise<void>[] = [];
        // Player dead cards animation
        playerDeadViews.forEach(view => {
            const promise = new Promise<void>((resolve) => {
                // View'ın hala geçerli olduğunu kontrol et
                if (!view || view.destroyed) {
                    resolve();
                    return;
                }

                const deathTween = gsap.to(view, {
                    alpha: 0,
                    duration: 0.5,
                    onComplete: () => {
                        //console.log(`Destroying dead player card: ${view.card.Name}`);
                        if (view && !view.destroyed) {
                            view.destroy({ children: true });
                        }
                        resolve();
                    }
                });
                this.trackAnimation(deathTween);
            });
            deadAnimations.push(promise);
        });

        // Bot dead cards animation
        botDeadViews.forEach(view => {
            const promise = new Promise<void>((resolve) => {
                // View'ın hala geçerli olduğunu kontrol et
                if (!view || view.destroyed) {
                    resolve();
                    return;
                }

                const deathTween = gsap.to(view, {
                    alpha: 0,
                    duration: 0.5,
                    onComplete: () => {
                        //console.log(`Destroying dead bot card: ${view.card.Name}`);
                        if (view && !view.destroyed) {
                            view.destroy({ children: true });
                        }
                        resolve();
                    }
                });
                this.trackAnimation(deathTween);
            });
            deadAnimations.push(promise);
        });

        // Tüm ölüm animasyonları bitince hayatta kalan kartları güncelle
        Promise.all(deadAnimations).then(() => {
            this._broadcast.emit(BroadcastEvents.CARDS_REMOVED, {
                playerAliveViews,
                botAliveViews,
                playerDeadViews,
                botDeadViews
            });
        });
    }

    public renderHandsWithOptimizedAnimation(newPlayerCards: CardView[], newBotCards: CardView[]) {
        // Update existing card views to their new positions
        this.repositionExistingCards(newPlayerCards, newBotCards);

        // Add only the new cards with animation
        this.addNewCardViewsWithAnimation(newPlayerCards, newBotCards);

        // RESET_INTERACTION event'ini emit et
        this._broadcast.emit(BroadcastEvents.RESET_INTERACTION);
    }

    private repositionExistingCards(newPlayerCardViews: CardView[], newBotCardViews: CardView[]) {
        // Player cards repositioning
        const playerHand = newPlayerCardViews.map(view => view.card);
        const playerLeaderIdx = playerHand.findIndex(c => c instanceof LeaderCard);

        let playerOrder: Card[] = [];

        if (playerLeaderIdx !== -1) {
            const leader = playerHand[playerLeaderIdx];
            const otherCards = playerHand.filter(c => !(c instanceof LeaderCard));

            if (otherCards.length >= 4) {
                playerOrder = [otherCards[0], otherCards[1], leader, otherCards[2], otherCards[3]];
            } else {
                const midIndex = Math.floor(playerHand.length / 2);
                playerOrder = [...otherCards.slice(0, midIndex), leader, ...otherCards.slice(midIndex)];
            }
        } else {
            playerOrder = playerHand;
        }

        const playerStartX = 850 - (playerOrder.length - 1) * 150;
        playerOrder.forEach((card, i) => {
            const existingView = newPlayerCardViews.find(view => view.card === card);
            if (existingView) {
                const finalX = playerStartX + i * 350;
                // Update the view stats before repositioning
                existingView.update();
                gsap.to(existingView, {
                    x: finalX,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });

        // Bot cards repositioning
        const botHand = newBotCardViews.map(view => view.card);
        const botLeaderIdx = botHand.findIndex(c => c instanceof LeaderCard);
        let botOrder: Card[] = [];

        if (botLeaderIdx !== -1) {
            const leader = botHand[botLeaderIdx];
            const otherCards = botHand.filter(c => !(c instanceof LeaderCard));

            if (otherCards.length >= 4) {
                botOrder = [otherCards[0], otherCards[1], leader, otherCards[2], otherCards[3]];
            } else {
                const midIndex = Math.floor(botHand.length / 2);
                botOrder = [...otherCards.slice(0, midIndex), leader, ...otherCards.slice(midIndex)];
            }
        } else {
            botOrder = botHand;
        }

        const botStartX = 850 - (botOrder.length - 1) * 150;
        botOrder.forEach((card, i) => {
            const existingView = newBotCardViews.find(view => view.card === card);
            if (existingView) {
                const finalX = botStartX + i * 350;
                // Update the view stats before repositioning
                existingView.update();
                gsap.to(existingView, {
                    x: finalX,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });
    }

    private addNewCardViewsWithAnimation(newPlayerCards: CardView[], newBotCards: CardView[]) {
        // Add new player cards with animation
        newPlayerCards.forEach(cardView => {
            const playerOrder = this.getCardOrder(newPlayerCards.map(c => c.card));
            const cardIndex = playerOrder.indexOf(cardView.card);
            const playerStartX = 850 - (playerOrder.length - 1) * 150;
            const finalX = playerStartX + cardIndex * 350;
            const finalY = 750;

            // Start from right side
            cardView.x = finalX + 300;
            cardView.y = finalY;
            cardView.alpha = 0;

            this._battlefield.addChild(cardView);
            newPlayerCards.push(cardView);

            // Animate to final position
            gsap.to(cardView, {
                x: finalX,
                alpha: 1,
                duration: 0.5,
                ease: "power2.out"
            });
        });

        // Add new bot cards with animation
        newBotCards.forEach(cardView => {
            const botOrder = this.getCardOrder(newBotCards.map(c => c.card));
            const cardIndex = botOrder.indexOf(cardView.card);
            const botStartX = 850 - (botOrder.length - 1) * 150;
            const finalX = botStartX + cardIndex * 350;
            const finalY = 200;

            // Start from right side
            cardView.x = finalX + 300;
            cardView.y = finalY;
            cardView.alpha = 0;

            this._battlefield.addChild(cardView);
            newBotCards.push(cardView);

            // Animate to final position
            gsap.to(cardView, {
                x: finalX,
                alpha: 1,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    }

    private getCardOrder(hand: Card[]): Card[] {
        const leaderIdx = hand.findIndex(c => c instanceof LeaderCard);
        let order: Card[] = [];

        if (leaderIdx !== -1) {
            const leader = hand[leaderIdx];
            const otherCards = hand.filter(c => !(c instanceof LeaderCard));

            if (otherCards.length >= 4) {
                order = [otherCards[0], otherCards[1], leader, otherCards[2], otherCards[3]];
            } else {
                const midIndex = Math.floor(hand.length / 2);
                order = [...otherCards.slice(0, midIndex), leader, ...otherCards.slice(midIndex)];
            }
        } else {
            order = hand;
        }

        return order;
    }

    public addNewCardsWithSmartPositioning(newPlayerCards: CardView[], newBotCards: CardView[], allPlayerCards: CardView[], allBotCards: CardView[]) {
        // Player kartları için fixed positioning
        if (newPlayerCards.length > 0) {
            this.addNewPlayerCardsWithFixedPositioning(newPlayerCards, allPlayerCards);
        }

        // Bot kartları için fixed positioning
        if (newBotCards.length > 0) {
            this.addNewBotCardsWithFixedPositioning(newBotCards, allBotCards);
        }

        // RESET_INTERACTION event'ini emit et
        this._broadcast.emit(BroadcastEvents.RESET_INTERACTION);
    }

    private addNewPlayerCardsWithFixedPositioning(newCards: CardView[], allCards: CardView[]) {
        // Mevcut kartların hangi slot'larda olduğunu tespit et
        const occupiedSlots = new Set<number>();
        //console.log("=== Player Card Slot Detection ===");
        allCards.forEach(cardView => {
            if (!newCards.includes(cardView)) {
                // Mevcut kartın hangi slot'ta olduğunu bul (75 piksel tolerans)
                const currentSlot = CARD_POSITIONS.findIndex(pos => Math.abs(cardView.x - pos.x) < 75);
                //console.log(`Card ${cardView.card.Name} at x:${cardView.x} -> slot:${currentSlot}`);
                if (currentSlot !== -1) {
                    occupiedSlots.add(currentSlot);
                }
            }
        });
        //console.log("Occupied slots:", Array.from(occupiedSlots));

        // Yeni kartları boş slot'lara yerleştir
        newCards.forEach(newCard => {
            const isLeader = newCard.card instanceof LeaderCard;
            let targetSlot = -1;

            if (isLeader) {
                targetSlot = 2; // Leader her zaman slot 2'ye (orta)
                occupiedSlots.add(2);
            } else {
                // Leader değilse boş slot bul
                for (let i = 0; i < CARD_POSITIONS.length; i++) {
                    if (!occupiedSlots.has(i)) {
                        targetSlot = i;
                        occupiedSlots.add(i);
                        break;
                    }
                }
            }

            //console.log(`New card ${newCard.card.Name} (Leader: ${isLeader}) -> target slot: ${targetSlot}`);

            if (targetSlot !== -1) {
                const targetPos = CARD_POSITIONS[targetSlot];

                // Yeni kart animasyonla gelir
                newCard.x = targetPos.x + 400; // Sağdan başla
                newCard.y = 750;
                newCard.alpha = 0;
                this._battlefield.addChild(newCard);

                const newCardTween = gsap.to(newCard, {
                    x: targetPos.x,
                    alpha: 1,
                    duration: 0.6,
                    ease: "power2.out"
                });
                this.trackAnimation(newCardTween);
            }
        });
    }

    private addNewBotCardsWithFixedPositioning(newCards: CardView[], allCards: CardView[]) {
        // Mevcut kartların hangi slot'larda olduğunu tespit et
        const occupiedSlots = new Set<number>();
        //console.log("=== Bot Card Slot Detection ===");
        allCards.forEach(cardView => {
            if (!newCards.includes(cardView)) {
                // Mevcut kartın hangi slot'ta olduğunu bul (75 piksel tolerans)
                const currentSlot = CARD_POSITIONS.findIndex(pos => Math.abs(cardView.x - pos.x) < 75);
                //console.log(`Bot Card ${cardView.card.Name} at x:${cardView.x} -> slot:${currentSlot}`);
                if (currentSlot !== -1) {
                    occupiedSlots.add(currentSlot);
                }
            }
        });
        //console.log("Bot Occupied slots:", Array.from(occupiedSlots));

        // Yeni kartları boş slot'lara yerleştir
        newCards.forEach(newCard => {
            const isLeader = newCard.card instanceof LeaderCard;
            let targetSlot = -1;

            if (isLeader) {
                targetSlot = 2; // Leader her zaman slot 2'ye (orta)
                occupiedSlots.add(2);
            } else {
                // Leader değilse boş slot bul
                for (let i = 0; i < CARD_POSITIONS.length; i++) {
                    if (!occupiedSlots.has(i)) {
                        targetSlot = i;
                        occupiedSlots.add(i);
                        break;
                    }
                }
            }

            //console.log(`New bot card ${newCard.card.Name} -> target slot: ${targetSlot}`);

            if (targetSlot !== -1) {
                const targetPos = CARD_POSITIONS[targetSlot];

                // Yeni kart animasyonla gelir
                newCard.x = targetPos.x + 400; // Sağdan başla
                newCard.y = 200;
                newCard.alpha = 0;
                this._battlefield.addChild(newCard);

                const newCardTween = gsap.to(newCard, {
                    x: targetPos.x,
                    alpha: 1,
                    duration: 0.6,
                    ease: "power2.out"
                });
                this.trackAnimation(newCardTween);
            }
        });
    }
}