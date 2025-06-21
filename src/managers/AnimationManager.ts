import { gsap } from 'gsap';
import { Text } from 'pixi.js';
import { CardView } from '../ui/CardView';
import { BattleField } from '../ui/BattleField';
import { CombatManager } from './CombatManager';
import { AttackType } from '../shared/enums';
import { Card, LeaderCard } from '../game/Card';
import { ISelectedCard } from '../shared/interfaces';
import { Player } from '../game/Player';

export class AnimationManager {
    private static instance: AnimationManager;
    private _battlefield: BattleField;
    private _combatManager: CombatManager;

    private constructor() {
        this._battlefield = BattleField.getInstance();
        this._combatManager = CombatManager.getInstance();
    }

    public static getInstance(): AnimationManager {
        if (!AnimationManager.instance) {
            AnimationManager.instance = new AnimationManager();
        }
        return AnimationManager.instance;
    }

    private showDamageAnimation(targetView: CardView, damage: number, onComplete: () => void) {
        // Null check ekle
        if (!targetView || targetView.destroyed || !targetView.parent) {
            onComplete();
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
        gsap.timeline()
            .to(damageText, { y: damageText.y - 50, duration: 0.5 })
            .to(damageText, { alpha: 0, duration: 0.5 }, "-=0.5")
            .call(() => {
                this._battlefield.removeChild(damageText);
                onComplete();
            });
    }

    public showAbilityMessage(x: number, y: number, message: string, color: number = 0xffffff) {
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

    public resolveAttackWithAnimation(selectedAttacker: ISelectedCard | null, selectedDefender: ISelectedCard | null) {
        if (!selectedAttacker || !selectedDefender) return;

        const attackerView = selectedAttacker.view;
        const defenderView = selectedDefender.view;
        const attacker = attackerView.card;
        const defender = defenderView.card;

        // Calculate damage
        const attackDamage = this._combatManager.calculateAttackDamage(attacker, defender);
        const counterDamage = this._combatManager.calculateCounterDamage(attacker, defender);

        // 1. Saldırı animasyonu: Saldırgan hedefe doğru hareket eder
        const originalX = attackerView.x;
        const originalY = attackerView.y;
        const targetX = defenderView.x;
        const targetY = defenderView.y;

        // Saldırganı hedefe doğru hareket ettir
        gsap.to(attackerView, {
            x: targetX,
            y: targetY,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
                // 2. Saldırgan hedefe ulaştığında hasar animasyonu göster
                this.showDamageAnimation(defenderView, attackDamage, () => {
                    // 3. Saldırganı geri gönder
                    gsap.to(attackerView, {
                        x: originalX,
                        y: originalY,
                        duration: 0.3,
                        ease: "power2.out",
                        onComplete: () => {
                            // 4. Counter damage (sadece melee için)
                            if (attacker.AttackType === AttackType.Melee && counterDamage > 0) {
                                this.showDamageAnimation(attackerView, counterDamage, () => {
                                    this._combatManager.completeCombat(attacker, defender, selectedAttacker, selectedDefender, attackDamage, counterDamage);
                                });
                            } else {
                                this._combatManager.completeCombat(attacker, defender, selectedAttacker, selectedDefender, attackDamage, counterDamage);
                            }
                        }
                    });
                });
            }
        });
    }

    public resolveBotAttackWithAnimation(bestMove: { attacker: Card; defender: Card }, attackerView: CardView, defenderView: CardView) {
        const attacker = bestMove.attacker;
        const defender = bestMove.defender;

        // Calculate damage
        const attackDamage = this._combatManager.calculateAttackDamage(attacker, defender);
        const counterDamage = this._combatManager.calculateCounterDamage(attacker, defender);

        // Bot saldırı animasyonu
        const originalX = attackerView.x;
        const originalY = attackerView.y;
        const targetX = defenderView.x;
        const targetY = defenderView.y;

        gsap.to(attackerView, {
            x: targetX,
            y: targetY,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
                this.showDamageAnimation(defenderView, attackDamage, () => {
                    gsap.to(attackerView, {
                        x: originalX,
                        y: originalY,
                        duration: 0.3,
                        ease: "power2.out",
                        onComplete: () => {
                            if (attacker.AttackType === AttackType.Melee && counterDamage > 0) {
                                this.showDamageAnimation(attackerView, counterDamage, () => {
                                    this._combatManager.completeBotCombat(attacker, defender, attackDamage, counterDamage, attackerView, defenderView);
                                });
                            } else {
                                this._combatManager.completeBotCombat(attacker, defender, attackDamage, counterDamage, attackerView, defenderView);
                            }
                        }
                    });
                });
            }
        });
    }

    public removeDeadCardsWithAnimation(player: Player, bot: Player, playerCardViews: CardView[], botCardViews: CardView[]) {
        const prevPlayerHand = [...player.hand];
        const prevBotHand = [...bot.hand];

        // Ölü kartları bul
        player.hand = player.hand.filter(c => Math.max(0, c.Health) > 0);
        bot.hand = bot.hand.filter(c => Math.max(0, c.Health) > 0);

        // Hayatta kalan kartların view'larını güncelle
        playerCardViews.forEach(view => {
            if (player.hand.includes(view.card)) {
                view.update();
            }
        });
        botCardViews.forEach(view => {
            if (bot.hand.includes(view.card)) {
                view.update();
            }
        });

        const playerDeadIndexes = prevPlayerHand.map((c, i) => player.hand.includes(c) ? -1 : i).filter(i => i !== -1);
        const botDeadIndexes = prevBotHand.map((c, i) => bot.hand.includes(c) ? -1 : i).filter(i => i !== -1);
        // Animasyonla ölü kartları kaldır
        const deadAnimations: Promise<void>[] = [];

        // Player dead cards
        const playerDeadViews: CardView[] = [];
        playerCardViews.forEach(view => {
            if (!player.hand.includes(view.card)) {
                playerDeadViews.push(view);
                const promise = new Promise<void>((resolve) => {
                    gsap.to(view, {
                        alpha: 0,
                        duration: 0.5,
                        onComplete: () => {
                            view.destroy({ children: true });
                            resolve();
                        }
                    });
                });
                deadAnimations.push(promise);
            }
        });

        // Bot dead cards
        const botDeadViews: CardView[] = [];
        botCardViews.forEach(view => {
            if (!bot.hand.includes(view.card)) {
                botDeadViews.push(view);
                const promise = new Promise<void>((resolve) => {
                    gsap.to(view, {
                        alpha: 0,
                        duration: 0.5,
                        onComplete: () => {
                            view.destroy({ children: true });
                            resolve();
                        }
                    });
                });
                deadAnimations.push(promise);
            }
        });

        // Ölü view'ları array'lerden kaldır
        playerCardViews = playerCardViews.filter(view => !playerDeadViews.includes(view));
        botCardViews = botCardViews.filter(view => !botDeadViews.includes(view));

        // Tüm ölüm animasyonları bitince yeni kartları ekle
        Promise.all(deadAnimations).then(() => {
            this.addNewCardsWithAnimation(playerCardViews, botCardViews, playerDeadIndexes, botDeadIndexes, player, bot);
        });
    }

    private addNewCardsWithAnimation(playerCardViews: CardView[], botCardViews: CardView[], playerDeadIndexes: number[], botDeadIndexes: number[], player: Player, bot: Player) {
        // Store new cards separately to animate only them
        const newPlayerCards: Card[] = [];
        const newBotCards: Card[] = [];

        // Yeni kart çek ve ekle
        playerDeadIndexes.forEach(idx => {
            if (player.hand.length < 5) {
                const newCard = player.deck.drawRandomCard();
                if (newCard) {
                    player.hand.splice(idx, 0, newCard);
                    newPlayerCards.push(newCard);
                }
            }
        });

        botDeadIndexes.forEach(idx => {
            if (bot.hand.length < 5) {
                const newCard = bot.deck.drawRandomCard();
                if (newCard) {
                    bot.hand.splice(idx, 0, newCard);
                    newBotCards.push(newCard);
                }
            }
        });

        // Kazananı kontrol et
        if (!player.hand.some(c => c instanceof LeaderCard)) {
            this._turn = "player";
            const restart = confirm("Bot Kazandı! Yeni oyun başlatmak ister misiniz?");
            if (restart) {
                this.restartGame();
            }
            return;
        }
        if (!bot.hand.some(c => c instanceof LeaderCard)) {
            this._turn = "player";
            const restart = confirm("Oyuncu Kazandı! Yeni oyun başlatmak ister misiniz?");
            if (restart) {
                this.restartGame();
            }
            return;
        }

        // Optimize the rendering - only animate new cards, keep existing ones in place
        this.renderHandsWithOptimizedAnimation(playerCardViews, botCardViews, newPlayerCards, newBotCards, player, bot);
    }

    private renderHandsWithOptimizedAnimation(playerCardViews: CardView[], botCardViews: CardView[], newPlayerCards: Card[], newBotCards: Card[], player: Player, bot: Player) {
        // Update existing card views to their new positions
        this.repositionExistingCards(playerCardViews, botCardViews, player, bot);

        // Add only the new cards with animation
        this.addNewCardViewsWithAnimation(newPlayerCards, newBotCards, player, bot, playerCardViews, botCardViews);

        // Deck sayılarını güncelle
        const playerDeckCount = player.deck.cards.filter(c => !(c instanceof LeaderCard)).length;
        const botDeckCount = bot.deck.cards.filter(c => !(c instanceof LeaderCard)).length;
        this._battlefield.showDeckCounts(playerDeckCount, botDeckCount);

        // Interaction'ı yeniden kur
        this.resetInteraction();
        this.setupInteraction();
    } 
    
    private repositionExistingCards(playerCardViews: CardView[], botCardViews: CardView[], player: Player, bot: Player) {
        // Filter out dead card views first
        playerCardViews = playerCardViews.filter(view => player.hand.includes(view.card));
        botCardViews = botCardViews.filter(view => bot.hand.includes(view.card));

        // Player cards repositioning
        const playerHand = [...player.hand];
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
            const existingView = playerCardViews.find(view => view.card === card);
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
        const botHand = [...bot.hand];
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
            const existingView = botCardViews.find(view => view.card === card);
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

    private addNewCardViewsWithAnimation(newPlayerCards: Card[], newBotCards: Card[], player: Player, bot: Player, playerCardViews: CardView[], botCardViews: CardView[]) {
        // Add new player cards with animation
        newPlayerCards.forEach(card => {
            const cardView = new CardView(card);
            const playerOrder = this.getCardOrder(player.hand);
            const cardIndex = playerOrder.indexOf(card);
            const playerStartX = 850 - (playerOrder.length - 1) * 150;
            const finalX = playerStartX + cardIndex * 350;
            const finalY = 750;

            // Start from right side
            cardView.x = finalX + 300;
            cardView.y = finalY;
            cardView.alpha = 0;

            this._battlefield.addChild(cardView);
            playerCardViews.push(cardView);

            // Animate to final position
            gsap.to(cardView, {
                x: finalX,
                alpha: 1,
                duration: 0.5,
                ease: "power2.out"
            });
        });

        // Add new bot cards with animation
        newBotCards.forEach(card => {
            const cardView = new CardView(card);
            const botOrder = this.getCardOrder(bot.hand);
            const cardIndex = botOrder.indexOf(card);
            const botStartX = 850 - (botOrder.length - 1) * 150;
            const finalX = botStartX + cardIndex * 350;
            const finalY = 200;

            // Start from right side
            cardView.x = finalX + 300;
            cardView.y = finalY;
            cardView.alpha = 0;

            this._battlefield.addChild(cardView);
            botCardViews.push(cardView);

            // Animate to final position
            gsap.to(cardView, {
                x: finalX,
                alpha: 1,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    }
}