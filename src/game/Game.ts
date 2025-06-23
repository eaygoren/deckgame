import { Application } from "pixi.js";
import { Card, AttackType, LeaderCard } from "./Card";
import { Deck } from "./Deck";
import { Player } from "./Player";
import { BattleField } from "../ui/BattleField";
import { CardView } from "../ui/CardView";
import { BroadcastEvents, CARD_POSITIONS, CharacterList, ClassAbilities } from "../shared/constants";
import { MoveOption, CombatOption } from "../shared/interfaces";
import { ClassType, Turn } from "../shared/enums";
import { CombatManager } from "../managers/CombatManager";
import { AnimationManager } from "../managers/AnimationManager";
import { Broadcast } from "../utils/Broadcast";
import gsap from "gsap";

export class Game {
  private _app: Application;
  private _broadcast: Broadcast;
  private _battlefield: BattleField;
  private _combatManager: CombatManager;
  private _animationManager: AnimationManager;
  private _player: Player;
  private _bot: Player;
  private _playerCardViews: CardView[] = [];
  private _botCardViews: CardView[] = [];
  private _attacker: CardView | null = null;
  private _defender: CardView | null = null;
  private _turn: Turn = Turn.Player;

  constructor(app: Application) {
    this._app = app;
    this._broadcast = Broadcast.getInstance();
    this._battlefield = BattleField.getInstance();
    this._app.stage.addChild(this._battlefield);
    this._combatManager = CombatManager.getInstance();
    this._animationManager = AnimationManager.getInstance();
    // create players
    this._player = this.createPlayer("Player");
    this._bot = this.createPlayer("Bot");

    this.eventListeners();
  }

  private eventListeners() {
    this._broadcast.on(BroadcastEvents.PLAYER_COMBAT_COMPLETED, this.onPlayerCombatCompleted.bind(this));
    this._broadcast.on(BroadcastEvents.BOT_COMBAT_COMPLETED, this.onBotCombatCompleted.bind(this));
    this._broadcast.on(BroadcastEvents.CHECK_FOR_WINNER, this.checkForWinner.bind(this));
    this._broadcast.on(BroadcastEvents.RESET_INTERACTION, this.handleInteraction.bind(this));
    this._broadcast.on(BroadcastEvents.ADD_NEW_CARDS, this.addNewCards.bind(this));
    this._broadcast.on(BroadcastEvents.CARDS_REMOVED, this.onCardsRemoved.bind(this));
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
      { name: "Leader", description: "Leader ability" }
    );
    // Set leader's class ability as well
    leader.Ability = ClassAbilities[leaderData.classType]();

    const deck = new Deck();
    deck.setLeader(leader);
    // 9 random cards
    const otherCards: Card[] = [];
    for (let i = 0; i < 9; i++) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      const data = CharacterList[key]; const card = new Card({
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
    this.renderHand(this._bot, 200, this._botCardViews);
    // Show deck counts through BattleField (exclude leader from count)
    const playerDeckCount = this._player.deck.cards.filter(c => !(c instanceof LeaderCard)).length;
    const botDeckCount = this._bot.deck.cards.filter(c => !(c instanceof LeaderCard)).length;
    this._battlefield.showDeckCounts(playerDeckCount, botDeckCount);
  }

  private renderHand(player: Player, y: number, viewArr: CardView[]) {
    const hand = [...player.hand];
    const occupiedSlots = new Set<number>();

    //console.log(`=== Rendering ${player === this._player ? 'Player' : 'Bot'} Hand ===`);

    // İlk önce leader'ı slot 2'ye yerleştir
    const leaderCard = hand.find(c => c instanceof LeaderCard);
    if (leaderCard) {
      const cardView = new CardView(leaderCard);
      cardView.x = CARD_POSITIONS[2].x; // Leader her zaman slot 2
      cardView.y = y;
      this._battlefield.addChild(cardView);
      viewArr.push(cardView);
      occupiedSlots.add(2);
      //console.log(`Leader ${leaderCard.Name} placed at slot 2, position x: ${CARD_POSITIONS[2].x}`);
    }

    // Sonra diğer kartları boş slot'lara yerleştir
    const otherCards = hand.filter(c => !(c instanceof LeaderCard));
    otherCards.forEach(card => {
      let targetSlot = -1;

      // Boş slot bul
      for (let i = 0; i < CARD_POSITIONS.length; i++) {
        if (!occupiedSlots.has(i)) {
          targetSlot = i;
          occupiedSlots.add(i);
          break;
        }
      }

      if (targetSlot !== -1) {
        const cardView = new CardView(card);
        cardView.x = CARD_POSITIONS[targetSlot].x;
        cardView.y = y;
        this._battlefield.addChild(cardView);
        viewArr.push(cardView);
        //console.log(`Card ${card.Name} placed at slot ${targetSlot}, position x: ${CARD_POSITIONS[targetSlot].x}`);
      }
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
    if (this._turn !== Turn.Player) return;
    if (this._attacker && this._attacker === view) {
      // Cancel selection
      gsap.to(view.scale, { x: 1, y: 1, duration: 0.2 });
      this._attacker = null;
      return;
    }
    if (!this._attacker) {
      this._attacker = view;
      gsap.to(view.scale, { x: 1.2, y: 1.2, duration: 0.2 });
    }
  }

  private handleBotCardClick(view: CardView) {
    if (this._turn !== Turn.Player || !this._attacker) return;
    if (this._defender && this._defender === view) return;

    // Lider kartına sadece karşı tarafın sadece lideri kaldığında saldırılabilir
    if (view.card instanceof LeaderCard) {
      const nonLeaderCards = this._bot.hand.filter(c => !(c instanceof LeaderCard));
      if (nonLeaderCards.length > 0) {
        // Henüz lider olmayan kartlar var, lidere saldıramazsın
        return;
      }
    }

    this._defender = view; gsap.to(view.scale, { x: 1.2, y: 1.2, duration: 0.2 });

    const attackDamage = this._combatManager.calculateAttackDamage(this._attacker, this._defender);
    const counterDamage = this._combatManager.calculateCounterDamage(this._defender.card);

    const combatData: CombatOption = {
      attacker: this._attacker,
      defender: this._defender,
      attackDamage,
      counterDamage
    };

    setTimeout(() => {
      this._animationManager.resolvePlayerAttackWithAnimation(combatData);
      if (combatData.attacker.card.ClassType === ClassType.Mage) {
        this._broadcast.emit(BroadcastEvents.CHECK_ARCANE_BLAST, { attacker: combatData.attacker, opponentCardViews: this._botCardViews });
      }
    }, 500);
  }

  private botTurn() {
    // Bot için hedef seçimi: Lider kartına sadece oyuncunun sadece lideri kaldığında saldırabilir
    const playerNonLeaderCards = this._player.hand.filter(c => !(c instanceof LeaderCard));
    let availableTargetViews = this._playerCardViews;

    if (playerNonLeaderCards.length > 0) {
      // Oyuncuda lider olmayan kartlar varsa, sadece onlara saldırabilir
      availableTargetViews = this._playerCardViews.filter(view => !(view.card instanceof LeaderCard));
    }

    // Eğer hedef yoksa çık (bu durumda zaten oyun biter)
    if (availableTargetViews.length === 0) return;

    // Bot her zaman bir hamle yapar - en iyi hamleyi bul
    const bestMove = this.findBestMove(this._botCardViews, availableTargetViews);

    if (!bestMove) {
      //console.error("Bot could not find any move! This should not happen.");
      return;
    }

    //console.log(`Bot selected move: ${bestMove.attacker.Name}(${bestMove.attacker.Attack}/${bestMove.attacker.Health}) -> ${bestMove.defender.Name}(${bestMove.defender.Attack}/${bestMove.defender.Health})`);

    const attacker = this._botCardViews.find(v => v.card === bestMove.attacker);
    const defender = this._playerCardViews.find(v => v.card === bestMove.defender);

    if (!attacker || !defender) return;

    gsap.to(attacker.scale, { x: 1.2, y: 1.2, duration: 0.2 });
    gsap.to(defender.scale, { x: 1.2, y: 1.2, duration: 0.2 });

    const attackDamage = this._combatManager.calculateAttackDamage(attacker, defender);
    const counterDamage = this._combatManager.calculateCounterDamage(defender.card);

    const combatData: CombatOption = {
      attacker,
      defender,
      attackDamage,
      counterDamage
    };

    setTimeout(() => {
      this._animationManager.resolveBotAttackWithAnimation(combatData);
      if (attacker.card.ClassType === ClassType.Mage) {
        this._broadcast.emit(BroadcastEvents.CHECK_ARCANE_BLAST, { attacker: attacker, opponentCardViews: this._playerCardViews });
      }
    }, 500);
  }
  
  private calculateMoveScore(attacker: Card, defender: Card): number {
    // LİDER KORUMASI: Lider kartı ölecekse saldırıyı reddet
    const counterDamage = this._combatManager.calculateCounterDamage(defender);
    const attackerTakesCounterDamage = attacker.AttackType === AttackType.Melee;
    const attackerWillDie = attackerTakesCounterDamage ? attacker.Health <= counterDamage : false;
    
    if (attacker instanceof LeaderCard && attackerWillDie) {
      return -10000; // Çok düşük skor ver, asla seçilmesin
    }

    // Gerçek hasar hesaplaması (class abilities dahil)
    let attackDamage = attacker.Attack;

    // Rogue crit chance simulation (%25 şans 2x hasar)
    if (attacker.ClassType === ClassType.Rogue) {
      attackDamage = Math.floor(attackDamage * 1.25); // Ortalama hasar (25% şans için)
    }

    // Tank defense (ranged'a karşı %50 azaltma)
    if (defender.ClassType === ClassType.Tank && attacker.AttackType === AttackType.Ranged) {
      attackDamage = Math.floor(attackDamage * 0.5);
    }

    const attackerSurvives = attackerTakesCounterDamage ? attacker.Health > counterDamage : true;
    const defenderDies = defender.Health <= attackDamage;
    const damageDealt = Math.min(attackDamage, defender.Health);

    let score = 0;
    let moveType = "unknown";

    // 1. ÖNCELİK: Düşman kartını öldür, ölme (mükemmel)
    if (attackerSurvives && defenderDies) {
      score = 10000 + (defender.Attack * 200) + (defender.Health * 50);
      moveType = "kill_without_dying";

      // Ranged attack bonusu (counter damage yok)
      if (attacker.AttackType === AttackType.Ranged) {
        score += 3000; // Ranged'a büyük bonus
      }

      // En yüksek attack'lı hedefi öldürmek için bonus
      score += (defender.Attack * 100);

      // Class bonusları
      if (attacker.ClassType === ClassType.Rogue) {
        score += 800; // Crit şansı var
      }
      if (attacker.ClassType === ClassType.Mage) {
        score += 1200; // Area damage potansiyeli
      }
    }

    // 2. ÖNCELİK: Trading (düşman kartını öldür, ama sen de öl)
    else if (!attackerSurvives && defenderDies) {
      score = 5000 + (defender.Attack * 150) + (defender.Health * 30);
      moveType = "trading";

      // Düşük değerli saldırgan ile trading yapılırsa bonus
      if (attacker.Health <= 2) {
        score += 1500; // Düşük can kartı ile trade
      }
      if (attacker.Attack <= 3) {
        score += 1000; // Düşük attack kartı ile trade
      }

      // Melee mage bonus (ölecek ama area damage verecek)
      if (attacker.ClassType === ClassType.Mage && attacker.AttackType === AttackType.Melee) {
        score += 2000; // Mage area damage çok değerli
      }

      // Yüksek attack'lı hedefi trade etmek için ekstra bonus
      if (defender.Attack >= 6) {
        score += 1200;
      }
    }

    // 3. ÖNCELİK: Öleceksin ama öldüremeyeceksin - maksimum hasar ver veya en değersiz kartı kullan
    else if (!attackerSurvives && !defenderDies) {
      score = 1000 + (damageDealt * 50);
      moveType = "sacrifice_for_damage";

      // En değersiz kartı kullanma bonusu
      if (attacker.Health <= 2 && attacker.Attack <= 3) {
        score += 800; // En değersiz kart
      }

      // Melee mage bonusu (area damage verecek)
      if (attacker.ClassType === ClassType.Mage && attacker.AttackType === AttackType.Melee) {
        score += 1500; // Area damage değerli
      }

      // Maksimum hasar bonus
      score += (damageDealt * 20);
    }

    // 4. ÖNCELİK: Güvenli hasar (hiç kimse ölmüyor)
    else if (attackerSurvives && !defenderDies) {
      score = 100 + (damageDealt * 10);
      moveType = "safe_damage";

      // Ranged bonus (güvenli hasar)
      if (attacker.AttackType === AttackType.Ranged) {
        score += 300;
      }

      // Rogue bonus (crit şansı)
      if (attacker.ClassType === ClassType.Rogue) {
        score += 200;
      }
    }

    //console.log(`Move: ${attacker.Name}(${attacker.Attack}/${attacker.Health}) -> ${defender.Name}(${defender.Attack}/${defender.Health}) | Type: ${moveType} | Score: ${score} | Damage: ${attackDamage} | Counter: ${counterDamage}`);

    return score;
  }

  private findBestMove(attackers: CardView[], defenders: CardView[]): { attacker: Card; defender: Card } | null {
    const moves: MoveOption[] = [];

    // Tüm olası hamleleri değerlendir
    for (const attackerView of attackers) {
      for (const defenderView of defenders) {
        const score = this.calculateMoveScore(attackerView.card, defenderView.card);

        moves.push({
          attacker: attackerView.card,
          defender: defenderView.card,
          score
        });
      }
    }

    // Eğer hiç hamle yoksa null döndür
    if (moves.length === 0) return null;

    // En yüksek skora sahip hamleyi seç
    moves.sort((a, b) => b.score - a.score);
    const bestMove = moves[0];

    //console.log(`Best move selected: ${bestMove.attacker.Name} -> ${bestMove.defender.Name} (Score: ${bestMove.score})`);

    return {
      attacker: bestMove.attacker,
      defender: bestMove.defender
    };
  }

  private onPlayerCombatCompleted() {
    this._attacker = null;
    this._defender = null;

    this._broadcast.emit(BroadcastEvents.CHECK_WARRIOR_RAGE, { playerCardViews: this._playerCardViews, botCardViews: this._botCardViews });

    // Ölü kartları kaldır (animasyonla)
    this._animationManager.removeDeadCardsWithAnimation(this._playerCardViews, this._botCardViews);

    this._turn = Turn.Bot;

    setTimeout(() => this.botTurn(), 1000); // Biraz daha fazla bekleme süresi
  }

  private onBotCombatCompleted() {
    this._broadcast.emit(BroadcastEvents.CHECK_WARRIOR_RAGE, { playerCardViews: this._playerCardViews, botCardViews: this._botCardViews });

    // Ölü kartları kaldır (animasyonla)
    this._animationManager.removeDeadCardsWithAnimation(this._playerCardViews, this._botCardViews);

    // Bot turn'ü bitir
    this._turn = Turn.Player;
  }

  private addNewCards(data: { newPlayerCardViews: CardView[], newBotCardViews: CardView[], playerDeadIndexes: number[], botDeadIndexes: number[] }) {
    // Store new cards separately to animate only them
    const newPlayerCards: Card[] = [];
    const newBotCards: Card[] = [];

    // Yeni kart çek ve ekle
    data.playerDeadIndexes.forEach(idx => {
      if (data.newPlayerCardViews.map(view => view.card).length < 5) {
        const newCard = this._player.deck.drawRandomCard();
        if (newCard) {
          data.newPlayerCardViews.map(view => view.card).splice(idx, 0, newCard);
          newPlayerCards.push(newCard);
        }
      }
    });

    data.botDeadIndexes.forEach(idx => {
      if (data.newBotCardViews.map(view => view.card).length < 5) {
        const newCard = this._bot.deck.drawRandomCard();
        if (newCard) {
          data.newBotCardViews.map(view => view.card).splice(idx, 0, newCard);
          newBotCards.push(newCard);
        }
      }
    });

    // Optimize the rendering - only animate new cards, keep existing ones in place
    this._animationManager.renderHandsWithOptimizedAnimation(data.newPlayerCardViews, data.newBotCardViews);
  }

  private checkForWinner() {
    // Kazananı kontrol et
    if (!this._player.hand.some(c => c instanceof LeaderCard)) {
      this._turn = Turn.Player;
      // Oyun bittiğinde tüm animasyonları durdur
      this._animationManager.stopAllAnimations();
      const restart = confirm("Bot Kazandı! Yeni oyun başlatmak ister misiniz?");
      if (restart) {
        this.restartGame();
      }
      return;
    }
    if (!this._bot.hand.some(c => c instanceof LeaderCard)) {
      this._turn = Turn.Player;
      // Oyun bittiğinde tüm animasyonları durdur
      this._animationManager.stopAllAnimations();
      const restart = confirm("Oyuncu Kazandı! Yeni oyun başlatmak ister misiniz?");
      if (restart) {
        this.restartGame();
      }
      return;
    }
  }

  private handleInteraction() {
    // Interaction'ı yeniden kur
    this.resetInteraction();
    this.setupInteraction();
  }

  private restartGame() {
    // Oyun yeniden başlarken tüm animasyonları durdur
    this._animationManager.stopAllAnimations();

    // Tüm mevcut kart görsellerini temizle
    this._playerCardViews.forEach(view => view.destroy({ children: true }));
    this._botCardViews.forEach(view => view.destroy({ children: true }));
    this._playerCardViews = [];
    this._botCardViews = [];

    // Seçimleri sıfırla
    this._attacker = null;
    this._defender = null;

    // Her zaman oyuncu ile başla - Bu çok önemli!
    this._turn = Turn.Player;

    // Yeni oyuncular oluştur (yeni kartlarla)
    this._player = this.createPlayer("Player");
    this._bot = this.createPlayer("Bot");

    // Oyunu yeniden başlat
    this.renderHands();
    this.setupInteraction();

    // Ekstra güvenlik: Turn'ü tekrar kontrol et
    if (this._turn !== Turn.Player) {
      this._turn = Turn.Player;
    }
  }

  private onCardsRemoved(data: any) {
    if (!data) {
      //console.warn("onCardsRemoved: No data received");
      return;
    }

    const { playerAliveViews, botAliveViews, playerDeadViews, botDeadViews } = data;

    if (playerAliveViews) {
      //console.log(`Updating player cards from ${this._playerCardViews.length} to ${playerAliveViews.length}`);
      this._playerCardViews = playerAliveViews;

      // Player hand'den de ölü kartları kaldır
      if (playerDeadViews && playerDeadViews.length > 0) {
        playerDeadViews.forEach((deadView: any) => {
          const cardIndex = this._player.hand.findIndex(card => card.Id === deadView.card.Id);
          if (cardIndex !== -1) {
            //console.log(`Removing dead card ${deadView.card.Name} from player hand`);
            this._player.hand.splice(cardIndex, 1);
          }
        });
      }
    }

    if (botAliveViews) {
      //console.log(`Updating bot cards from ${this._botCardViews.length} to ${botAliveViews.length}`);
      this._botCardViews = botAliveViews;

      // Bot hand'den de ölü kartları kaldır
      if (botDeadViews && botDeadViews.length > 0) {
        botDeadViews.forEach((deadView: any) => {
          const cardIndex = this._bot.hand.findIndex(card => card.Id === deadView.card.Id);
          if (cardIndex !== -1) {
            //console.log(`Removing dead card ${deadView.card.Name} from bot hand`);
            this._bot.hand.splice(cardIndex, 1);
          }
        });
      }
    }

    // Yeni kartlar çek
    this.drawNewCardsToReplaceDeadOnes(playerDeadViews?.length || 0, botDeadViews?.length || 0);

    // Kazanan kontrolü yap
    this.checkForWinner();
  }

  private drawNewCardsToReplaceDeadOnes(playerDeadCount: number, botDeadCount: number) {
    //console.log(`Drawing new cards: ${playerDeadCount} for player, ${botDeadCount} for bot`);

    const newPlayerCardViews: CardView[] = [];
    const newBotCardViews: CardView[] = [];

    // Player için yeni kartlar çek
    for (let i = 0; i < playerDeadCount; i++) {
      if (this._player.hand.length < 5 && this._player.deck.cards.length > 0) {
        const newCard = this._player.deck.drawRandomCard();
        if (newCard) {
          this._player.hand.push(newCard);
          const newCardView = new CardView(newCard);
          this._playerCardViews.push(newCardView);
          newPlayerCardViews.push(newCardView);
          //console.log(`Drew new card for player: ${newCard.Name}`);
        }
      }
    }

    // Bot için yeni kartlar çek
    for (let i = 0; i < botDeadCount; i++) {
      if (this._bot.hand.length < 5 && this._bot.deck.cards.length > 0) {
        const newCard = this._bot.deck.drawRandomCard();
        if (newCard) {
          this._bot.hand.push(newCard);
          const newCardView = new CardView(newCard);
          this._botCardViews.push(newCardView);
          newBotCardViews.push(newCardView);
          //console.log(`Drew new card for bot: ${newCard.Name}`);
        }
      }
    }    // Sadece yeni kartları render et
    if (newPlayerCardViews.length > 0 || newBotCardViews.length > 0) {
      this._animationManager.addNewCardsWithSmartPositioning(
        newPlayerCardViews,
        newBotCardViews,
        this._playerCardViews,
        this._botCardViews
      );
      // Deck sayılarını güncelle
      const playerDeckCount = this._player.deck.cards.filter(c => !(c instanceof LeaderCard)).length;
      const botDeckCount = this._bot.deck.cards.filter(c => !(c instanceof LeaderCard)).length;
      this._battlefield.updateDeckCounts(playerDeckCount, botDeckCount);
    }
  }
}