import { Application, Text } from "pixi.js";
import { Card, AttackType, LeaderCard } from "./Card";
import { Deck } from "./Deck";
import { Player } from "./Player";
import { BattleField } from "../ui/BattleField";
import { CardView } from "../ui/CardView";
import { CharacterList, ClassAbilities, getInitialHealth } from "../shared/constants";
import { ISelectedCard, MoveOption } from "../shared/interfaces";
import { ClassType } from "../shared/enums";
import gsap from "gsap";

export class Game {
  private _app: Application;
  private _battlefield: BattleField;
  private _player: Player;
  private _bot: Player;
  private _playerCardViews: CardView[] = [];
  private _botCardViews: CardView[] = [];
  private _selectedAttacker: ISelectedCard | null = null;
  private _selectedDefender: ISelectedCard | null = null;
  private _turn: "player" | "bot" = "player";

  constructor(app: Application) {
    this._app = app;
    this._battlefield = BattleField.getInstance();
    this._app.stage.addChild(this._battlefield);
    // create players
    this._player = this.createPlayer("Player");
    this._bot = this.createPlayer("Bot");
  }

  public start() {
    this.renderHands();
    this.setupInteraction();
  }

  private createPlayer(name: string): Player {
    // 1 leader and 9 random cards
    const keys = Object.keys(CharacterList) as Array<keyof typeof CharacterList>;
    const leaderKey = keys[Math.floor(Math.random() * keys.length)];
    const leaderData = CharacterList[leaderKey]; const leader = new LeaderCard(
      leaderData.name,
      leaderData.cover,
      leaderData.attack + 2, // Make leader stronger
      leaderData.health + 5,
      leaderData.faction,
      leaderData.rarity,
      leaderData.color,
      leaderData.attackType,
      leaderData.classType,
      { name: "Leader", description: "Leader ability", activate: () => { } }
    );    // Set leader's class ability as well
    leader.Ability = ClassAbilities[leaderData.classType]();
    
    // Debug: Log leader creation and ability assignment
    console.log(`Created leader: ${leader.Name} (ID: ${leader.Id}) - ClassType: ${leader.ClassType}, Ability: ${leader.Ability?.name || 'None'}`);
    const deck = new Deck();
    deck.setLeader(leader);
    // 9 random cards
    const otherCards: Card[] = [];
    for (let i = 0; i < 9; i++) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      const data = CharacterList[key];      const card = new Card({
        name: data.name,
        cover: data.cover,
        attack: data.attack,
        health: data.health,
        faction: data.faction,
        rarity: data.rarity,
        color: data.color,
        attackType: data.attackType,
        classType: data.classType,
        ability: ClassAbilities[data.classType]()
      });
      
      // Debug: Log card creation and ability assignment
      console.log(`Created card: ${card.Name} (ID: ${card.Id}) - ClassType: ${card.ClassType}, Ability: ${card.Ability?.name || 'None'}`);
      otherCards.push(card);
    }
    // Hand and deck separation: 4 cards in hand, 5 cards in deck (leader is always in hand)
    const handCards = [leader, ...otherCards.slice(0, 4)];
    const deckCards = otherCards.slice(4);
    deck.cards = [leader, ...deckCards]; // leader must also be in deck.cards (for getPlayableHand)
    const player = new Player(name, deck);
    player.hand = handCards;
    return player;
  }

  private renderHands() {
    this._battlefield.removeChildren();
    this._playerCardViews = [];
    this._botCardViews = [];
    // Player hand layout
    this.renderHand(this._player, 750, this._playerCardViews);
    // Bot hand layout
    this.renderHand(this._bot, 200, this._botCardViews);    // Show deck counts through BattleField (exclude leader from count)
    const playerDeckCount = this._player.deck.cards.filter(c => !(c instanceof LeaderCard)).length;
    const botDeckCount = this._bot.deck.cards.filter(c => !(c instanceof LeaderCard)).length;
    this._battlefield.showDeckCounts(playerDeckCount, botDeckCount);
  }

  private renderHand(player: Player, y: number, viewArr: CardView[]) {
    // Leader in the center (index 2), others from left to right, 300px space in between
    const hand = [...player.hand];
    const leaderIdx = hand.findIndex(c => c instanceof LeaderCard);
    let order: Card[] = [];

    if (leaderIdx !== -1) {
      const leader = hand[leaderIdx];
      const otherCards = hand.filter(c => !(c instanceof LeaderCard));

      // Put leader in the center (index 2)
      if (otherCards.length >= 4) {
        order = [otherCards[0], otherCards[1], leader, otherCards[2], otherCards[3]];
      } else {
        // If there are few cards, place the leader as center as much as possible
        const midIndex = Math.floor(hand.length / 2);
        order = [...otherCards.slice(0, midIndex), leader, ...otherCards.slice(midIndex)];
      }
    } else {
      order = hand;
    }

    const startX = 850 - (order.length - 1) * 150;
    order.forEach((card, i) => {
      const cardView = new CardView(card);
      cardView.x = startX + i * 350;
      cardView.y = y;
      this._battlefield.addChild(cardView);
      viewArr.push(cardView);
    });
  }
  
  private setupInteraction() {
    this._playerCardViews.forEach(view => {
      view.removeAllListeners(); // Clear any existing listeners first
      view.on("pointertap", () => this.handlePlayerCardClick(view));
    });
    this._botCardViews.forEach(view => {
      view.removeAllListeners(); // Clear any existing listeners first
      view.on("pointertap", () => this.handleBotCardClick(view));
    });
  }

  private resetInteraction() {
    this._playerCardViews.forEach(view => {
      view.removeAllListeners(); // Remove all listeners
    });
    this._botCardViews.forEach(view => {
      view.removeAllListeners(); // Remove all listeners
    });
  }

  private handlePlayerCardClick(view: CardView) {
    if (this._turn !== "player") return;
    if (this._selectedAttacker && this._selectedAttacker.view === view) {
      // Cancel selection
      gsap.to(view.scale, { x: 1, y: 1, duration: 0.2 });
      this._selectedAttacker = null;
      return;
    }
    if (!this._selectedAttacker) {
      this._selectedAttacker = { view, owner: this._player };
      gsap.to(view.scale, { x: 1.2, y: 1.2, duration: 0.2 });
    }
  }

  private handleBotCardClick(view: CardView) {
    if (this._turn !== "player" || !this._selectedAttacker) return;
    if (this._selectedDefender && this._selectedDefender.view === view) return;

    // Lider kartına sadece karşı tarafın sadece lideri kaldığında saldırılabilir
    if (view.card instanceof LeaderCard) {
      const nonLeaderCards = this._bot.hand.filter(c => !(c instanceof LeaderCard));
      if (nonLeaderCards.length > 0) {
        // Henüz lider olmayan kartlar var, lidere saldıramazsın
        return;
      }
    } this._selectedDefender = { view, owner: this._bot };
    gsap.to(view.scale, { x: 1.2, y: 1.2, duration: 0.2 });
    setTimeout(() => this.resolveAttackWithAnimation(), 400);
  }

  private resolveAttackWithAnimation() {
    if (!this._selectedAttacker || !this._selectedDefender) return;

    const attackerView = this._selectedAttacker.view;
    const defenderView = this._selectedDefender.view;
    const attacker = attackerView.card;
    const defender = defenderView.card;

    // Calculate damage
    const attackDamage = this.calculateAttackDamage(attacker, defender);
    const counterDamage = this.calculateCounterDamage(attacker, defender);

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
                  this.completeCombat(attacker, defender, attackDamage, counterDamage);
                });
              } else {
                this.completeCombat(attacker, defender, attackDamage, counterDamage);
              }
            }
          });
        });
      }
    });
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

  private completeCombat(attacker: Card, defender: Card, attackDamage: number, counterDamage: number) {
    // Hasar uygula
    defender.Health = Math.max(0, defender.Health - attackDamage);

    if (attacker.AttackType === AttackType.Melee) {
      attacker.Health = Math.max(0, attacker.Health - counterDamage);
    }

    // Post-damage abilities
    this.handlePostDamageAbilities(attacker, defender);    // Stats güncelle - null check
    if (this._selectedAttacker?.view && !this._selectedAttacker.view.destroyed) {
      this._selectedAttacker.view.update();
      // Scale'i sıfırla
      gsap.to(this._selectedAttacker.view.scale, { x: 1, y: 1, duration: 0.2 });
    }

    if (this._selectedDefender?.view && !this._selectedDefender.view.destroyed) {
      this._selectedDefender.view.update();
      // Scale'i sıfırla
      gsap.to(this._selectedDefender.view.scale, { x: 1, y: 1, duration: 0.2 });
    }

    // Ölü kartları kaldır (animasyonla)
    this.removeDeadCardsWithAnimation();

    this._selectedAttacker = null;
    this._selectedDefender = null;
    this._turn = "bot";
    setTimeout(() => this.botTurn(), 1000); // Biraz daha fazla bekleme süresi
  }

  private botTurn() {
    // Bot'un lider olmayan kartları ile saldırı yap, yoksa lider ile saldır
    let botCards = this._bot.hand.filter(c => !(c instanceof LeaderCard));
    const playerCards = this._player.hand;

    // Bot için hedef seçimi: Lider kartına sadece oyuncunun sadece lideri kaldığında saldırabilir
    let availableTargets = playerCards;
    const playerNonLeaderCards = playerCards.filter(c => !(c instanceof LeaderCard));
    if (playerNonLeaderCards.length > 0) {
      // Oyuncuda lider olmayan kartlar varsa, sadece onlara saldırabilir
      availableTargets = playerNonLeaderCards;
    }
    // Eğer hedef yoksa çık
    if (availableTargets.length === 0) return;
    // Önce normal kartlarla en iyi hamleyi bul
    let bestMove = null;
    if (botCards.length > 0) {
      bestMove = this.findBestMove(botCards, availableTargets);
    }

    // Eğer normal kartlarla iyi bir hamle yoksa veya hiç normal kart yoksa
    const leaderCards = this._bot.hand.filter(c => c instanceof LeaderCard);
    if (leaderCards.length > 0) {
      // Normal kartlarla yapılabilecek en iyi hamleyi değerlendir
      const normalCardsBestScore = bestMove ? this.calculateMoveScore(bestMove.attacker, bestMove.defender) : 0;

      // Eğer normal kartlarla hiç iyi hamle yoksa (score < 500) lider kartını da değerlendir
      if (normalCardsBestScore < 500 || botCards.length === 0) {
        const leaderBestMove = this.findBestMove(leaderCards, availableTargets);
        if (leaderBestMove) {
          const leaderScore = this.calculateMoveScore(leaderBestMove.attacker, leaderBestMove.defender);
          const leaderSurvives = leaderBestMove.attacker.Health > leaderBestMove.defender.Attack;

          // Eğer sadece lider kartı varsa, ölecek olsa bile saldırmalı (tur pas geçmemeli)
          if (botCards.length === 0) {
            // Hiç normal kart yoksa, lider ile saldırı yapmak zorunda
            bestMove = leaderBestMove;
          } else if (leaderSurvives) {
            // Normal kartlar varsa, lider sadece ölmeyecekse saldırabilir
            if (!bestMove || leaderScore > normalCardsBestScore) {
              bestMove = leaderBestMove;
            }
          }
        }
      }
    }

    // Eğer hala hamle yoksa ve bot elinde kart varsa, zorla en iyi hamleyi seç
    if (!bestMove && this._bot.hand.length > 0) {
      bestMove = this.findBestMove(this._bot.hand, availableTargets);
    }

    if (!bestMove) return;

    const attackerView = this._botCardViews.find(v => v.card === bestMove.attacker);
    const defenderView = this._playerCardViews.find(v => v.card === bestMove.defender);
    if (!attackerView || !defenderView) return;

    gsap.to(attackerView.scale, { x: 1.2, y: 1.2, duration: 0.2 });
    gsap.to(defenderView.scale, { x: 1.2, y: 1.2, duration: 0.2 }); setTimeout(() => {
      this.resolveBotAttackWithAnimation(bestMove, attackerView, defenderView);
    }, 400);
  }  
  
  private calculateMoveScore(attacker: Card, defender: Card): number {
    // Calculate base damage without triggering abilities
    let attackDamage = attacker.Attack;
    
    // Manually simulate critical strike chance for Rogue (25% chance for double damage)
    if (attacker.ClassType === ClassType.Rogue) {
      // For AI calculation, use average damage (1.0 + 0.25 = 1.25x damage)
      attackDamage = Math.floor(attackDamage * 1.25);
    }
    
    // Manually simulate Tank defense (50% reduction against ranged)
    if (defender.ClassType === ClassType.Tank && attacker.AttackType === AttackType.Ranged) {
      attackDamage = Math.floor(attackDamage * 0.5);
    }
    
    const counterDamage = this.calculateCounterDamage(attacker, defender);

    // Check if attacker takes counter-damage (only Melee attackers do)
    const attackerTakesCounterDamage = attacker.AttackType === AttackType.Melee;

    const attackerSurvives = attackerTakesCounterDamage ?
      attacker.Health > counterDamage : true; // Ranged always survives counter-damage
    const defenderDies = defender.Health <= attackDamage;
    const damageDealt = Math.min(attackDamage, defender.Health);

    let score = 0;

    // En yüksek öncelik: Kartını kaybetmeden rakip kartını öldürmek
    if (attackerSurvives && defenderDies) {
      score = 1000 + defender.Attack;
      // Ranged karakterler için bonus puan (geri dönüş hasarı yok)
      if (!attackerTakesCounterDamage) {
        score += 200;
      }
      // Special class bonuses
      if (attacker.ClassType === ClassType.Mage) {
        score += 150; // Mage gets bonus for area damage
      }
      if (attacker.ClassType === ClassType.Rogue) {
        score += 100; // Rogue gets bonus for potential crits
      }
    }
    // İkinci öncelik: Her iki kart da ölecekse, en yüksek attack'lı kartı öldürmek
    else if (!attackerSurvives && defenderDies) {
      score = 500 + defender.Attack;
    }
    // Üçüncü öncelik: Hiçbir kart ölmeyecekse, en fazla hasar vermek
    else if (attackerSurvives && !defenderDies) {
      score = 100 + damageDealt;
      // Ranged karakterler için bonus puan
      if (!attackerTakesCounterDamage) {
        score += 50;
      }      // Warrior bonus when low on health (check if rage will activate)
      if (attacker.ClassType === ClassType.Warrior) {
        const initialHealth = getInitialHealth(attacker);
        const currentHealthPercentage = (attacker.Health / initialHealth) * 100;
        // If warrior is already raged or will be raged after taking counter-damage
        const hasRage = this.hasWarriorRageActivated(attacker);
        const willActivateRage = !hasRage && currentHealthPercentage <= 50;

        if (hasRage || willActivateRage) {
          score += 75; // Bonus for warrior's rage ability
        }
      }
    }
    // En düşük öncelik: Kartını kaybedip rakip kartını öldürememek
    else {
      score = damageDealt;
    }

    return score;
  }

  private findBestMove(attackers: Card[], defenders: Card[]): { attacker: Card; defender: Card } | null {
    const moves: MoveOption[] = [];

    // Tüm olası hamleleri değerlendir
    for (const attacker of attackers) {
      for (const defender of defenders) {
        const score = this.calculateMoveScore(attacker, defender);

        moves.push({
          attacker,
          defender,
          score
        });
      }
    }

    // En yüksek skora sahip hamleyi seç
    if (moves.length === 0) return null;

    moves.sort((a, b) => b.score - a.score);
    const bestMove = moves[0];

    return {
      attacker: bestMove.attacker,
      defender: bestMove.defender
    };
  }

  private restartGame() {
    // Tüm mevcut kart görsellerini temizle
    this._playerCardViews.forEach(view => view.destroy({ children: true }));
    this._botCardViews.forEach(view => view.destroy({ children: true }));
    this._playerCardViews = [];
    this._botCardViews = [];

    // Seçimleri sıfırla
    this._selectedAttacker = null;
    this._selectedDefender = null;

    // Her zaman oyuncu ile başla - Bu çok önemli!
    this._turn = "player";

    // Yeni oyuncular oluştur (yeni kartlarla)
    this._player = this.createPlayer("Player");
    this._bot = this.createPlayer("Bot");

    // Oyunu yeniden başlat
    this.renderHands();
    this.setupInteraction();

    // Ekstra güvenlik: Turn'ü tekrar kontrol et
    if (this._turn !== "player") {
      this._turn = "player";
    }
  } 
  
  private calculateAttackDamage(attacker: Card, defender: Card, triggerAbilities: boolean = true): number {
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

  private calculateCounterDamage(_attacker: Card, defender: Card): number {
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

  private checkWarriorRage(card: Card): void {
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
        const cardView = this._player.hand.includes(card)
          ? this._playerCardViews.find(view => view.card === card)
          : this._botCardViews.find(view => view.card === card);

        if (cardView && !cardView.destroyed && cardView.parent) {
          this.showAbilityMessage(cardView.x, cardView.y, "Berserker Rage!", 0xff4444);
          // Update the card view to show new stats
          cardView.update();
        }
      }
    }
  }

  private hasWarriorRageActivated(card: Card): boolean {
    return card.WarriorRageActivated;
  }
  
  public getRandomOpponentTarget(originalTarget: Card): Card | null {
    // Determine which player's hand to check (opponent of the original target)
    // If originalTarget is in player hand, we want to target bot hand (and vice versa)
    const opponentHand = this._player.hand.includes(originalTarget) ? this._bot.hand : this._player.hand;

    // Get all non-leader cards (we don't want to exclude originalTarget since it's not in opponent hand)
    const availableTargets = opponentHand.filter(card =>
      !(card instanceof LeaderCard)
    );

    if (availableTargets.length === 0) return null;

    // Return random target
    const randomIndex = Math.floor(Math.random() * availableTargets.length);
    return availableTargets[randomIndex];
  }

  private removeDeadCardsWithAnimation() {
    const prevPlayerHand = [...this._player.hand];
    const prevBotHand = [...this._bot.hand];

    // Ölü kartları bul
    this._player.hand = this._player.hand.filter(c => Math.max(0, c.Health) > 0);
    this._bot.hand = this._bot.hand.filter(c => Math.max(0, c.Health) > 0);

    // Hayatta kalan kartların view'larını güncelle
    this._playerCardViews.forEach(view => {
      if (this._player.hand.includes(view.card)) {
        view.update();
      }
    });
    this._botCardViews.forEach(view => {
      if (this._bot.hand.includes(view.card)) {
        view.update();
      }
    });

    const playerDeadIndexes = prevPlayerHand.map((c, i) => this._player.hand.includes(c) ? -1 : i).filter(i => i !== -1);
    const botDeadIndexes = prevBotHand.map((c, i) => this._bot.hand.includes(c) ? -1 : i).filter(i => i !== -1);
    // Animasyonla ölü kartları kaldır
    const deadAnimations: Promise<void>[] = [];

    // Player dead cards
    const playerDeadViews: CardView[] = [];
    this._playerCardViews.forEach(view => {
      if (!this._player.hand.includes(view.card)) {
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
    this._botCardViews.forEach(view => {
      if (!this._bot.hand.includes(view.card)) {
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
    this._playerCardViews = this._playerCardViews.filter(view => !playerDeadViews.includes(view));
    this._botCardViews = this._botCardViews.filter(view => !botDeadViews.includes(view));

    // Tüm ölüm animasyonları bitince yeni kartları ekle
    Promise.all(deadAnimations).then(() => {
      this.addNewCardsWithAnimation(playerDeadIndexes, botDeadIndexes);
    });
  }

  private addNewCardsWithAnimation(playerDeadIndexes: number[], botDeadIndexes: number[]) {
    // Store new cards separately to animate only them
    const newPlayerCards: Card[] = [];
    const newBotCards: Card[] = [];

    // Yeni kart çek ve ekle
    playerDeadIndexes.forEach(idx => {
      if (this._player.hand.length < 5) {
        const newCard = this._player.deck.drawRandomCard();
        if (newCard) {
          this._player.hand.splice(idx, 0, newCard);
          newPlayerCards.push(newCard);
        }
      }
    });

    botDeadIndexes.forEach(idx => {
      if (this._bot.hand.length < 5) {
        const newCard = this._bot.deck.drawRandomCard();
        if (newCard) {
          this._bot.hand.splice(idx, 0, newCard);
          newBotCards.push(newCard);
        }
      }
    });

    // Kazananı kontrol et
    if (!this._player.hand.some(c => c instanceof LeaderCard)) {
      this._turn = "player";
      const restart = confirm("Bot Kazandı! Yeni oyun başlatmak ister misiniz?");
      if (restart) {
        this.restartGame();
      }
      return;
    }
    if (!this._bot.hand.some(c => c instanceof LeaderCard)) {
      this._turn = "player";
      const restart = confirm("Oyuncu Kazandı! Yeni oyun başlatmak ister misiniz?");
      if (restart) {
        this.restartGame();
      }
      return;
    }

    // Optimize the rendering - only animate new cards, keep existing ones in place
    this.renderHandsWithOptimizedAnimation(newPlayerCards, newBotCards);
  }

  private renderHandsWithOptimizedAnimation(newPlayerCards: Card[], newBotCards: Card[]) {
    // Update existing card views to their new positions
    this.repositionExistingCards();

    // Add only the new cards with animation
    this.addNewCardViewsWithAnimation(newPlayerCards, newBotCards);

    // Deck sayılarını güncelle
    const playerDeckCount = this._player.deck.cards.filter(c => !(c instanceof LeaderCard)).length;
    const botDeckCount = this._bot.deck.cards.filter(c => !(c instanceof LeaderCard)).length;
    this._battlefield.showDeckCounts(playerDeckCount, botDeckCount);

    // Interaction'ı yeniden kur
    this.resetInteraction();
    this.setupInteraction();
  }

  private repositionExistingCards() {
    // Filter out dead card views first
    this._playerCardViews = this._playerCardViews.filter(view => this._player.hand.includes(view.card));
    this._botCardViews = this._botCardViews.filter(view => this._bot.hand.includes(view.card));

    // Player cards repositioning
    const playerHand = [...this._player.hand];
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
      const existingView = this._playerCardViews.find(view => view.card === card);
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
    const botHand = [...this._bot.hand];
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
      const existingView = this._botCardViews.find(view => view.card === card);
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

  private addNewCardViewsWithAnimation(newPlayerCards: Card[], newBotCards: Card[]) {
    // Add new player cards with animation
    newPlayerCards.forEach(card => {
      const cardView = new CardView(card);
      const playerOrder = this.getCardOrder(this._player.hand);
      const cardIndex = playerOrder.indexOf(card);
      const playerStartX = 850 - (playerOrder.length - 1) * 150;
      const finalX = playerStartX + cardIndex * 350;
      const finalY = 750;

      // Start from right side
      cardView.x = finalX + 300;
      cardView.y = finalY;
      cardView.alpha = 0;

      this._battlefield.addChild(cardView);
      this._playerCardViews.push(cardView);

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
      const botOrder = this.getCardOrder(this._bot.hand);
      const cardIndex = botOrder.indexOf(card);
      const botStartX = 850 - (botOrder.length - 1) * 150;
      const finalX = botStartX + cardIndex * 350;
      const finalY = 200;

      // Start from right side
      cardView.x = finalX + 300;
      cardView.y = finalY;
      cardView.alpha = 0;

      this._battlefield.addChild(cardView);
      this._botCardViews.push(cardView);

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
  
  private resolveBotAttackWithAnimation(bestMove: { attacker: Card; defender: Card }, attackerView: CardView, defenderView: CardView) {
    const attacker = bestMove.attacker;
    const defender = bestMove.defender;

    // Calculate damage
    const attackDamage = this.calculateAttackDamage(attacker, defender);
    const counterDamage = this.calculateCounterDamage(attacker, defender);

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
                  this.completeBotCombat(attacker, defender, attackDamage, counterDamage, attackerView, defenderView);
                });
              } else {
                this.completeBotCombat(attacker, defender, attackDamage, counterDamage, attackerView, defenderView);
              }
            }
          });
        });
      }
    });
  }

  private completeBotCombat(attacker: Card, defender: Card, attackDamage: number, counterDamage: number, attackerView: CardView, defenderView: CardView) {
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
    this.removeDeadCardsWithAnimation();

    // Bot turn'ü bitir
    this._turn = "player";
  }
}
