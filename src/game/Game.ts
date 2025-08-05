import { Application } from "pixi.js";
import { Card, LeaderCard } from "./Card";
import { Deck } from "./Deck";
import { Player } from "./Player";
import { BattleField } from "../ui/BattleField";
import { CardView } from "../ui/CardView";
import { ClassType, Rarity, Turn, UnitType } from "../shared/enums";
import { CombatManager } from "../managers/CombatManager";
import { AnimationManager } from "../managers/AnimationManager";
import { Broadcast } from "../utils/Broadcast";
import gsap from "gsap";
import { BroadcastEvents } from "../shared/constants/events";
import { CharacterList } from "../shared/constants/characters";
import { CARD_POSITIONS, Environment } from "../shared/constants/gameConfig";
import { CombatContext, EffectType, SkillTiming } from "../shared/interfaces/skillInterfaces";
import { BotAI } from "./BotAI";

export class Game {
  private _app: Application;
  private _broadcast: Broadcast;
  private _battlefield: BattleField;
  private _combatManager: CombatManager;
  private _animationManager: AnimationManager;
  private _botAI: BotAI;
  private _player: Player;
  private _bot: Player;
  private _playerCardViews: CardView[] = [];
  private _botCardViews: CardView[] = [];
  private _attacker: CardView | null = null;
  private _defender: CardView | null = null;
  private _turn: Turn = Turn.Player;

  constructor(app: Application, playerDeck: Deck) {
    this._app = app;
    this._broadcast = Broadcast.getInstance();
    this._battlefield = BattleField.getInstance();
    this._app.stage.addChild(this._battlefield);
    this._combatManager = CombatManager.getInstance();
    this._animationManager = AnimationManager.getInstance();
    this._botAI = BotAI.getInstance();
    // create players
    this._player = this.createPlayer(playerDeck);
    this._bot = this.createBot();

    this.eventListeners();
  }

  private eventListeners() {
    this._broadcast.on(BroadcastEvents.TURN_COMPLETED, this.onTurnCompleted.bind(this));
    this._broadcast.on(BroadcastEvents.CHECK_FOR_WINNER, this.checkForWinner.bind(this));
    this._broadcast.on(BroadcastEvents.RESET_INTERACTION, this.handleInteraction.bind(this));
    this._broadcast.on(BroadcastEvents.ADD_NEW_CARDS, this.addNewCards.bind(this));
    this._broadcast.on(BroadcastEvents.CARDS_REMOVED, this.onCardsRemoved.bind(this));
  }

  public start() {
    this.renderHands();
    this.setupInteraction();
  }

  private createPlayer(deck: Deck): Player {
    const leader = deck.leader;
    console.log("Player leader card:", leader);

    const nonLeaderCards = deck.cards.filter(c => c.unitType !== UnitType.Leader);
    const randomSelectedCards = this.getRandomUniqueItems(nonLeaderCards, 4);

    const handCards: Card[] = [leader!, ...randomSelectedCards];
    console.log("Player hand cards:", handCards);

    const remainingCards = nonLeaderCards.filter(card => !randomSelectedCards.includes(card));
    const deckCards: Card[] = remainingCards;
    console.log("Player deck cards after hand:", deckCards);

    if (leader) {
      deck.cards = [leader, ...deckCards];
    }

    const player = new Player("Player", deck);
    player.hand = handCards;

    return player;
  }

  private createBot(): Player {
    // Select a random leader card
    const keys = Object.keys(CharacterList) as Array<keyof typeof CharacterList>;
    const leaderKeys = keys.filter(key => CharacterList[key].unitType === UnitType.Leader);
    const randomLeaderKey = leaderKeys[Math.floor(Math.random() * leaderKeys.length)];
    const leaderData = CharacterList[randomLeaderKey];
    const leader = new LeaderCard({ ...leaderData }, Environment.crown);

    const deck = new Deck();
    deck.setLeader(leader);

    // Set remaining card limits
    let remainingLegendary = 2;
    let remainingRare = 4;
    let remainingCommon = 4; // 10 total - 1 leader = 9, flexible

    // Set limits based on leader's rarity
    switch (leader.rarity) {
      case Rarity.Legendary:
        remainingLegendary = Math.max(0, remainingLegendary - 1);
        break;
      case Rarity.Rare:
        remainingRare = Math.max(0, remainingRare - 1);
        break;
      case Rarity.Common:
        remainingCommon = Math.max(0, remainingCommon - 1);
        break;
    }

    // Select the remaining 9 cards in a balanced way
    const otherCards = this.getFlexibleBalancedCards(
      remainingLegendary,
      remainingRare,
      remainingCommon
    );

    // Hand and deck separation
    const handCards = [leader, ...otherCards.slice(0, 4)];
    const deckCards = otherCards.slice(4);
    deck.cards = [leader, ...deckCards];
    const player = new Player("Bot", deck);
    player.hand = handCards;

    return player;
  }

  private getFlexibleBalancedCards(maxLegendary: number, maxRare: number, maxCommon: number): Card[] {
    const keys = Object.keys(CharacterList) as Array<keyof typeof CharacterList>;
    const nonLeaderKeys = keys.filter(key => CharacterList[key].unitType !== UnitType.Leader);

    // Separate cards by rarity
    const legendaryKeys = nonLeaderKeys.filter(key => CharacterList[key].rarity === Rarity.Legendary);
    const rareKeys = nonLeaderKeys.filter(key => CharacterList[key].rarity === Rarity.Rare);
    const commonKeys = nonLeaderKeys.filter(key => CharacterList[key].rarity === Rarity.Common);

    const selectedKeys: (keyof typeof CharacterList)[] = [];

    // First, select legendary cards (up to maxLegendary)
    const legendarySelected = this.getRandomUniqueItems(legendaryKeys, maxLegendary);
    selectedKeys.push(...legendarySelected);

    // Next, select rare cards (up to maxRare)
    const rareSelected = this.getRandomUniqueItems(rareKeys, maxRare);
    selectedKeys.push(...rareSelected);

    // Then, fill the rest with common cards
    const remainingSlots = 9 - selectedKeys.length;
    const commonSelected = this.getRandomUniqueItems(commonKeys, Math.min(remainingSlots, maxCommon));
    selectedKeys.push(...commonSelected);

    // If we still have slots left, fill with more rare cards
    const stillRemaining = 9 - selectedKeys.length;
    if (stillRemaining > 0) {
      const extraRare = this.getRandomUniqueItems(
        rareKeys.filter(key => !selectedKeys.includes(key)),
        stillRemaining
      );
      selectedKeys.push(...extraRare);
    }

    return selectedKeys.map(key => {
      const data = CharacterList[key];
      return new Card({
        name: data.name,
        cover: data.cover,
        attack: data.attack,
        health: data.health,
        rarity: data.rarity,
        color: data.color,
        attackType: data.attackType,
        classType: data.classType,
        unitType: data.unitType,
      });
    });
  }

  private getRandomUniqueItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  private renderHands() {
    this._battlefield.removeChildren();
    this._playerCardViews = [];
    this._botCardViews = [];
    // Show deck counts through BattleField (exclude leader from count)
    const playerDeckCount = this._player.deck.cards.filter(c => c.unitType !== UnitType.Leader).length;
    const botDeckCount = this._bot.deck.cards.filter(c => c.unitType !== UnitType.Leader).length;
    this._battlefield.showDeckCounts(playerDeckCount, botDeckCount);
    // Player hand layout
    this.renderHand(this._player, 750, this._playerCardViews);
    // Bot hand layout
    this.renderHand(this._bot, 200, this._botCardViews);
  }

  private renderHand(player: Player, y: number, viewArr: CardView[]) {
    const hand = [...player.hand];
    console.log(`Rendering hand for ${player.name}:`, hand);
    const occupiedSlots = new Set<number>();

    //console.log(`=== Rendering ${player === this._player ? 'Player' : 'Bot'} Hand ===`);

    // İlk önce leader'ı slot 2'ye yerleştir
    const leaderCard = hand.find(c => c.unitType === UnitType.Leader);
    console.log(`Leader card for ${player.name}:`, leaderCard);
    if (leaderCard) {
      const cardView = new CardView(leaderCard);
      cardView.x = CARD_POSITIONS[2].x; // Leader her zaman slot 2
      cardView.y = y;
      player === this._player ? this._battlefield.addChildToPlayerField(cardView) : this._battlefield.addChildToBotField(cardView);
      viewArr.push(cardView);
      occupiedSlots.add(2);
      //console.log(`Leader ${leaderCard.Name} placed at slot 2, position x: ${CARD_POSITIONS[2].x}`);
    }

    // Sonra diğer kartları boş slot'lara yerleştir
    const otherCards = hand.filter(c => c.unitType !== UnitType.Leader);
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
        player === this._player ? this._battlefield.addChildToPlayerField(cardView) : this._battlefield.addChildToBotField(cardView);
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
    if (this._defender || this._attacker) {
      this._defender = null;

      if (this._attacker === view) {
        // Cancel selection
        gsap.to(view.scale, { x: 1, y: 1, duration: 0.2 });

        gsap.to(view.descriptionContainer, {
          alpha: 0, duration: 0.2, onComplete: () => {
            view.descriptionContainer.visible = false;
          }
        });

        this._attacker = null;
        return;
      }

      this._playerCardViews.forEach(v => {
        if (v !== view) {
          gsap.to(v.scale, { x: 1, y: 1, duration: 0.2 });
          gsap.to(v.descriptionContainer, {
            alpha: 0, duration: 0.2, onComplete: () => {
              v.descriptionContainer.visible = false;
            }
          });
        }
      });

      this._botCardViews.forEach(v => {
        gsap.to(v.scale, { x: 1, y: 1, duration: 0.2 });
        gsap.to(v.descriptionContainer, {
          alpha: 0, duration: 0.2, onComplete: () => {
            v.descriptionContainer.visible = false;
          }
        });
      });

      gsap.to(view.scale, { x: 1.2, y: 1.2, duration: 0.2 });

      gsap.to(view.descriptionContainer, {
        alpha: 1, duration: 0.2, onStart: () => {
          view.descriptionContainer.visible = true;
        }
      });

      this._attacker = view;

      return;
    }

    if (this._turn !== Turn.Player) return;
    if (this._attacker && this._attacker === view) {
      // Cancel selection
      gsap.to(view.scale, { x: 1, y: 1, duration: 0.2 });

      gsap.to(view.descriptionContainer, {
        alpha: 0, duration: 0.2, onComplete: () => {
          view.descriptionContainer.visible = false;
        }
      });

      this._attacker = null;
      return;
    }
    if (!this._attacker) {
      this._attacker = view;
      gsap.to(view.scale, { x: 1.2, y: 1.2, duration: 0.2 });

      gsap.to(view.descriptionContainer, {
        alpha: 1, duration: 0.2, onStart: () => {
          view.descriptionContainer.visible = true;
        }
      });
    }
  }

  private handleBotCardClick(view: CardView) {
    if (!this._attacker) {
      if (this._defender === view) {
        // Cancel selection
        gsap.to(view.scale, { x: 1, y: 1, duration: 0.2 });

        gsap.to(view.descriptionContainer, {
          alpha: 0, duration: 0.2, onComplete: () => {
            view.descriptionContainer.visible = false;
          }
        });

        this._defender = null;

        return;
      }

      this._defender = view;

      this._botCardViews.forEach(v => {
        if (v !== view) {
          gsap.to(v.scale, { x: 1, y: 1, duration: 0.2 });
          gsap.to(v.descriptionContainer, {
            alpha: 0, duration: 0.2, onComplete: () => {
              v.descriptionContainer.visible = false;
            }
          });
        }
      });

      gsap.to(view.scale, { x: 1.2, y: 1.2, duration: 0.2 });

      gsap.to(view.descriptionContainer, {
        alpha: 1, duration: 0.2, onStart: () => {
          view.descriptionContainer.visible = true;
        }
      });

      return;
    }

    if (this._turn !== Turn.Player) return;
    if (this._defender && this._defender === view) return;

    // TURN BAŞINDA SKILL KONTROLÜ - Player turn'ünün ilk saldırısında
    if (!this._defender) {
      this.triggerStartOfTurnSkills();
    }

    // Lider kartına sadece karşı tarafın sadece lideri kaldığında saldırılabilir
    if (view.card.unitType === UnitType.Leader) {
      const nonLeaderCards = this._bot.hand.filter(c => c.unitType !== UnitType.Leader);
      if (nonLeaderCards.length > 0) {
        // Henüz lider olmayan kartlar var, lidere saldıramazsın
        return;
      }
    }

    this._defender = view;

    gsap.to(this._defender.scale, {
      x: 1.2, y: 1.2, duration: 0.2, onStart: () => {
        gsap.to([this._attacker!.descriptionContainer, this._defender?.descriptionContainer], {
          alpha: 0, duration: 0.2, onComplete: () => {
            this._attacker!.descriptionContainer.visible = false;
            this._defender!.descriptionContainer.visible = false;
          }
        });
      }
    });

    this.resolveZIndex(this._player);

    this.resolvePlayerAttack(this._attacker, this._defender);
  }

  private async resolvePlayerAttack(attacker: CardView, defender: CardView) {
    if (!attacker || !defender) return;

    const combatResult = await this._combatManager.resolveCombat(attacker, defender);

    setTimeout(() => {
      if (combatResult) {
        this._animationManager.resolvePlayerAttackWithAnimation(combatResult);

        if (combatResult.attacker.card.classType === ClassType.Mage) {
          this._broadcast.emit(BroadcastEvents.CHECK_ARCANE_BLAST, { attacker: combatResult.attacker, opponentCardViews: this._botCardViews });
        }
      }
    }, 500);
  }

  private botTurn() {
    // BOT TURN BAŞLANGICI - Effect'leri güncelle ve start of turn skill'leri tetikle
    this.triggerStartOfTurnSkills();

    // Bot için hedef seçimi: Lider kartına sadece oyuncunun sadece lideri kaldığında saldırabilir
    const playerNonLeaderCards = this._player.hand.filter(c => c.unitType !== UnitType.Leader);
    let availableTargetViews = this._playerCardViews;

    if (playerNonLeaderCards.length > 0) {
      // Oyuncuda lider olmayan kartlar varsa, sadece onlara saldırabilir
      availableTargetViews = this._playerCardViews.filter(view => view.card.unitType !== UnitType.Leader);
    }

    // Eğer hedef yoksa çık (bu durumda zaten oyun biter)
    if (availableTargetViews.length === 0) return;

    // Bot her zaman bir hamle yapar - en iyi hamleyi bul
    const bestMove = this._botAI.findBestMove(this._botCardViews, availableTargetViews);

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

    this.resolveZIndex(this._bot);

    this.resolveBotAttack(attacker, defender);
  }

  private async resolveBotAttack(attacker: CardView, defender: CardView) {
    if (!attacker || !defender) return;

    const combatResult = await this._combatManager.resolveCombat(attacker, defender);

    if (combatResult) {
      setTimeout(() => {
        this._animationManager.resolvePlayerAttackWithAnimation(combatResult);

        if (combatResult.attacker.card.classType === ClassType.Mage) {
          this._broadcast.emit(BroadcastEvents.CHECK_ARCANE_BLAST, { attacker: combatResult.attacker, opponentCardViews: this._playerCardViews });
        }
      }, 500);
    }
  }

  // Effect damage - sadece belirli owner'ın effect'leri çalışır
  private async applyEffectDamageIfOwner(card: Card): Promise<void> {
    if (!card.activeEffects) return;

    for (const effect of card.activeEffects) {
      switch (effect.type) {
        case EffectType.Bleed:
          const bleedDamage = effect.value || 1;
          card.health = Math.max(0, card.health - bleedDamage);

          const cardView = this.findCardView(card);
          if (cardView) {
            cardView.updateStats();
          }

          this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
            x: cardView?.x,
            y: cardView?.y,
            message: `${card.name} loses ${bleedDamage} health due to bleed!`,
            color: "#ff0000"
          });
          break;
        case EffectType.Burn:
          const burnDamage = effect.value || 1;
          card.health = Math.max(0, card.health - burnDamage);

          if (card.hasEffect(EffectType.WarriorRage)) {
            const warriorRage = card.activeEffects.filter(e => e.type === EffectType.WarriorRage);
            warriorRage.forEach(e => (e.duration = 0) && (e.value = undefined));
          }

          const burnCardView = this.findCardView(card);
          if (burnCardView) {
            burnCardView.updateStats();
          }

          this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
            x: burnCardView?.x,
            y: burnCardView?.y,
            message: `${card.name} loses ${burnDamage} health due to burn!`,
            color: "#ff4500"
          });
          break;
      }
    };
  }

  private findCardView(card: Card): CardView | null {
    // Player kartlarında ara
    const playerView = this._playerCardViews.find(view => view.card === card);
    if (playerView) return playerView;

    // Bot kartlarında ara
    const botView = this._botCardViews.find(view => view.card === card);
    if (botView) return botView;

    return null;
  }

  // Start of turn skill'leri
  private triggerStartOfTurnSkills(): void {
    const allCards = [...this._playerCardViews, ...this._botCardViews];

    allCards.forEach(view => {
      if (view.card.skill?.triggerTiming === SkillTiming.StartOfTurn) {
        const context: CombatContext = {
          attacker: view.card,
          defender: null,
          damage: 0,
          isCounterAttack: false,
          allPlayerCards: this._player.hand,
          allBotCards: this._bot.hand
        };

        const result = view.card.useSkill(undefined, context);
        if (result?.success && result.message) {
          this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
            x: view.x,
            y: view.y,
            message: result.message,
            color: "#9932cc"
          });
        }
      }
    });
  }

  private async onTurnCompleted(): Promise<void> {
    this._attacker = null;
    this._defender = null;

    this._playerCardViews.forEach(async view => {
      view.scale.x > 1 && gsap.to(view.scale, { x: 1, y: 1, duration: 0.2 });

      if (this._turn === Turn.Player && view.card.activeEffects) {
        await this.applyEffectDamageIfOwner(view.card).then(() => {
          view.card.updateEffects().then(() => {
            view.updateStats();
          });
        });
      }

      await view.updateCover();
      await view.updateStats();
    });

    this._botCardViews.forEach(async view => {
      view.scale.x > 1 && gsap.to(view.scale, { x: 1, y: 1, duration: 0.2 });

      if (this._turn === Turn.Bot && view.card.activeEffects) {
        await this.applyEffectDamageIfOwner(view.card).then(() => {
          view.card.updateEffects().then(() => {
            view.updateStats();
          });
        });
      }

      await view.updateCover();
      await view.updateStats();
    });

    await this._combatManager.handleWarriorAbility(this._playerCardViews, this._botCardViews);

    // Ölü kartları kaldır
    this._animationManager.removeDeadCardsWithAnimation(this._playerCardViews, this._botCardViews);

    // Turn değiştir
    this._turn = this._turn === Turn.Player ? Turn.Bot : Turn.Player;

    this._turn === Turn.Bot && setTimeout(() => this.botTurn(), 2000);
  }

  private resolveZIndex(attacker: Player) {
    // Z-index'i belirle
    if (attacker === this._player) {
      this._battlefield.playerField.zIndex = 1;
      this._battlefield.botField.zIndex = 0;
    } else {
      this._battlefield.playerField.zIndex = 0;
      this._battlefield.botField.zIndex = 1;
    }

    this._battlefield.battleLog.zIndex = 2; // Battle log'u en üste getir
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
    if (!this._player.hand.some(c => c.unitType === UnitType.Leader)) {
      this._turn = Turn.Player;
      // Oyun bittiğinde tüm animasyonları durdur
      this._animationManager.stopAllAnimations();
      const restart = confirm("Bot Kazandı! Yeni oyun başlatmak ister misiniz?");
      if (restart) {
        window.location.reload(); // Sayfayı yeniden yükle
      }
      return;
    }
    if (!this._bot.hand.some(c => c.unitType === UnitType.Leader)) {
      this._turn = Turn.Player;
      // Oyun bittiğinde tüm animasyonları durdur
      this._animationManager.stopAllAnimations();
      const restart = confirm("Oyuncu Kazandı! Yeni oyun başlatmak ister misiniz?");
      if (restart) {
        window.location.reload(); // Sayfayı yeniden yükle
      }
      return;
    }
  }

  private handleInteraction() {
    // Interaction'ı yeniden kur
    this.resetInteraction();
    this.setupInteraction();
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
          const cardIndex = this._player.hand.findIndex(card => card.id === deadView.card.id);
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
          const cardIndex = this._bot.hand.findIndex(card => card.id === deadView.card.id);
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
      const playerDeckCount = this._player.deck.cards.filter(c => c.unitType !== UnitType.Leader).length;
      const botDeckCount = this._bot.deck.cards.filter(c => c.unitType !== UnitType.Leader).length;
      this._battlefield.updateDeckCounts(playerDeckCount, botDeckCount);
    }
  }
}