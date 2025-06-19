import { Application } from "pixi.js";
import { Card, Class, LeaderCard } from "./Card";
import { Deck } from "./Deck";
import { Player } from "./Player";
import { BattleField } from "../ui/BattleField";
import { CardView } from "../ui/CardView";
import { CharacterList } from "../shared/constants";
import { MoveOption } from "../shared/interfaces";
import gsap from "gsap";

export class Game {
  private _app: Application;
  private _battlefield: BattleField;
  private _player: Player;
  private _bot: Player;
  private _playerCardViews: CardView[] = [];
  private _botCardViews: CardView[] = [];
  private _selectedAttacker: { view: CardView; owner: Player } | null = null;
  private _selectedDefender: { view: CardView; owner: Player } | null = null;
  private _turn: "player" | "bot" = "player";

  constructor(app: Application) {
    this._app = app;
    this._battlefield = BattleField.getInstance();
    this._app.stage.addChild(this._battlefield);
    // create players
    this._player = this.createPlayer("Player");
    this._bot = this.createPlayer("Bot");
  }

  start() {
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
      leaderData.class,
      { name: "Leader", description: "Leader ability", activate: () => { } }
    );
    const deck = new Deck();
    deck.setLeader(leader);
    // 9 random cards
    const otherCards: Card[] = [];
    for (let i = 0; i < 9; i++) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      const data = CharacterList[key]; otherCards.push(new Card({
        name: data.name,
        cover: data.cover,
        attack: data.attack,
        health: data.health,
        faction: data.faction,
        rarity: data.rarity,
        color: data.color,
        class: data.class
      }));
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
      view.on("pointertap", () => this.handlePlayerCardClick(view));
    });
    this._botCardViews.forEach(view => {
      view.on("pointertap", () => this.handleBotCardClick(view));
    });
  }

  private resetInteraction() {
    this._playerCardViews.forEach(view => {
      view.off("pointertap", () => this.handlePlayerCardClick(view));
    });
    this._botCardViews.forEach(view => {
      view.off("pointertap", () => this.handleBotCardClick(view));
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
    }

    this._selectedDefender = { view, owner: this._bot };
    gsap.to(view.scale, { x: 1.2, y: 1.2, duration: 0.2 });
    setTimeout(() => this.resolveAttack(), 400);
  }
  private resolveAttack() {
    if (!this._selectedAttacker || !this._selectedDefender) return;
    const attacker = this._selectedAttacker.view.card;
    const defender = this._selectedDefender.view.card;

    // Defender always takes damage from attacker
    defender.Health = Math.max(0, defender.Health - attacker.Attack);
    // Attacker takes counter-damage only if attacker is Melee
    // Ranged attackers don't take counter-damage
    if (attacker.Class === Class.Melee) {
      attacker.Health = Math.max(0, attacker.Health - defender.Attack);
    }

    // Update stats
    this._selectedAttacker.view.update(attacker.Attack > 0 ? attacker.Attack : 0, attacker.Health > 0 ? attacker.Health : 0);
    this._selectedDefender.view.update(defender.Attack > 0 ? defender.Attack : 0, defender.Health > 0 ? defender.Health : 0);
    // Reset animations
    gsap.to(this._selectedAttacker.view.scale, { x: 1, y: 1, duration: 0.2 });
    gsap.to(this._selectedDefender.view.scale, { x: 1, y: 1, duration: 0.2 });
    // Remove cards
    this.removeDeadCards();
    this._selectedAttacker = null;
    this._selectedDefender = null;
    this._turn = "bot";
    setTimeout(() => this.botTurn(), 800);
  }

  private removeDeadCards() {
    // First, update stats for all CardViews
    this._playerCardViews.forEach(view => view.update());
    this._botCardViews.forEach(view => view.update());
    // Player
    const prevPlayerHand = [...this._player.hand];
    const prevBotHand = [...this._bot.hand];
    // Remove cards from hand
    this._player.hand = this._player.hand.filter(c => Math.max(0, c.Health) > 0);
    this._bot.hand = this._bot.hand.filter(c => Math.max(0, c.Health) > 0);
    // Find indices of removed cards
    const playerDeadIndexes = prevPlayerHand.map((c, i) => this._player.hand.includes(c) ? -1 : i).filter(i => i !== -1);
    const botDeadIndexes = prevBotHand.map((c, i) => this._bot.hand.includes(c) ? -1 : i).filter(i => i !== -1);
    // If less than 5 cards in hand, draw a card and add it in place of removed card
    playerDeadIndexes.forEach(idx => {
      if (this._player.hand.length < 5) {
        const newCard = this._player.deck.drawRandomCard();
        if (newCard) this._player.hand.splice(idx, 0, newCard);
      }
    });
    botDeadIndexes.forEach(idx => {
      if (this._bot.hand.length < 5) {
        const newCard = this._bot.deck.drawRandomCard();
        if (newCard) this._bot.hand.splice(idx, 0, newCard);
      }
    });
    // Destroy player card views for dead cards
    this._playerCardViews.forEach(view => {
      if (!this._player.hand.includes(view.card)) {
        view.destroy({ children: true });
      }
    });
    // Destroy bot card views for dead cards
    this._botCardViews.forEach(view => {
      if (!this._bot.hand.includes(view.card)) {
        view.destroy({ children: true });
      }
    });    // If there is no leader, the player loses
    if (!this._player.hand.some(c => c instanceof LeaderCard)) {
      const restart = confirm("Bot Kazandı! Yeni oyun başlatmak ister misiniz?");
      if (restart) {
        this.restartGame();
      }
      return;
    }
    if (!this._bot.hand.some(c => c instanceof LeaderCard)) {
      const restart = confirm("Oyuncu Kazandı! Yeni oyun başlatmak ister misiniz?");
      if (restart) {
        this.restartGame();
      }
      return;
    }
    
    // Reset turn to player after any game state change
    this._turn = "player";
    
    // Update screen and indicators
    this.renderHands();
    this.resetInteraction();
    this.setupInteraction();// Update deck counts (exclude leader from count)
    const playerDeckCount = this._player.deck.cards.filter(c => !(c instanceof LeaderCard)).length;
    const botDeckCount = this._bot.deck.cards.filter(c => !(c instanceof LeaderCard)).length;
    this._battlefield.updateDeckCounts(playerDeckCount, botDeckCount);
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
    gsap.to(defenderView.scale, { x: 1.2, y: 1.2, duration: 0.2 });

    setTimeout(() => {
      // Defender always takes damage from attacker
      bestMove.defender.Health = Math.max(0, bestMove.defender.Health - bestMove.attacker.Attack);
      // Attacker takes counter-damage only if attacker is Melee
      // Ranged attackers don't take counter-damage
      if (bestMove.attacker.Class === Class.Melee) {
        bestMove.attacker.Health = Math.max(0, bestMove.attacker.Health - bestMove.defender.Attack);
      }

      // Update stats
      defenderView?.update();
      attackerView?.update();
      gsap.to(attackerView.scale, { x: 1, y: 1, duration: 0.2 });
      gsap.to(defenderView.scale, { x: 1, y: 1, duration: 0.2 });
      this.removeDeadCards();
      this._turn = "player";
    }, 400);
  }
  
  private calculateMoveScore(attacker: Card, defender: Card): number {
    // Check if attacker takes counter-damage (only Melee attackers do)
    const attackerTakesCounterDamage = attacker.Class === Class.Melee;

    const attackerSurvives = attackerTakesCounterDamage ?
      attacker.Health > defender.Attack : true; // Ranged always survives counter-damage
    const defenderDies = defender.Health <= attacker.Attack;
    const damageDealt = Math.min(attacker.Attack, defender.Health);

    let score = 0;

    // En yüksek öncelik: Kartını kaybetmeden rakip kartını öldürmek
    if (attackerSurvives && defenderDies) {
      score = 1000 + defender.Attack;
      // Ranged karakterler için bonus puan (geri dönüş hasarı yok)
      if (!attackerTakesCounterDamage) {
        score += 200;
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

    // Her zaman oyuncu ile başla
    this._turn = "player";

    // Yeni oyuncular oluştur (yeni kartlarla)
    this._player = this.createPlayer("Player");
    this._bot = this.createPlayer("Bot");

    // Oyunu yeniden başlat
    this.renderHands();
    this.setupInteraction();
  }
}
