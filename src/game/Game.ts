import { Application } from "pixi.js";
import { Card, LeaderCard } from "./Card";
import { Deck } from "./Deck";
import { Player } from "./Player";
import { BattleField } from "../ui/BattleField";
import { CardView } from "../ui/CardView";
import { CharacterList } from "../shared/constants";
import gsap from "gsap";

export class Game {
  private app: Application;
  private battlefield: BattleField;
  private player: Player;
  private bot: Player;
  private playerCardViews: CardView[] = [];
  private botCardViews: CardView[] = [];
  private selectedAttacker: { view: CardView; owner: Player } | null = null;
  private selectedDefender: { view: CardView; owner: Player } | null = null;
  private turn: "player" | "bot" = "player";

  constructor(app: Application) {
    this.app = app;
    this.battlefield = BattleField.getInstance();
    this.app.stage.addChild(this.battlefield);
    // create players
    this.player = this.createPlayer("Player");
    this.bot = this.createPlayer("Bot");
  }

  start() {
    this.renderHands();
    this.setupInteraction();
  }

  private createPlayer(name: string): Player {
    // 1 leader and 9 random cards
    const keys = Object.keys(CharacterList) as Array<keyof typeof CharacterList>;
    const leaderKey = keys[Math.floor(Math.random() * keys.length)];
    const leaderData = CharacterList[leaderKey];
    const leader = new LeaderCard(
      leaderData.name,
      leaderData.cover,
      leaderData.attack + 2, // Make leader stronger
      leaderData.health + 5,
      leaderData.faction,
      leaderData.rarity,
      leaderData.color,
      { name: "Leader", description: "Leader ability", activate: () => {} }
    );
    const deck = new Deck();
    deck.setLeader(leader);
    // 9 random cards
    const otherCards: Card[] = [];
    for (let i = 0; i < 9; i++) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      const data = CharacterList[key];
      otherCards.push(new Card({
        name: data.name,
        cover: data.cover,
        attack: data.attack,
        health: data.health,
        faction: data.faction,
        rarity: data.rarity,
        color: data.color,
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
    this.battlefield.removeChildren();
    this.playerCardViews = [];
    this.botCardViews = [];
    // Player hand layout
    this.renderHand(this.player, 750, this.playerCardViews);
    // Bot hand layout
    this.renderHand(this.bot, 200, this.botCardViews);
    // Show deck counts through BattleField
    this.battlefield.showDeckCounts(this.player.deck.cards.length, this.bot.deck.cards.length);
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
    
    console.log(order);
    const startX = 850 - (order.length - 1) * 150;
    order.forEach((card, i) => {
      const cardView = new CardView(card);
      cardView.x = startX + i * 350;
      cardView.y = y;
      this.battlefield.addChild(cardView);
      viewArr.push(cardView);
    });
  }

  private setupInteraction() {
    this.playerCardViews.forEach(view => {
      view.on("pointertap", () => this.handlePlayerCardClick(view));
    });
    this.botCardViews.forEach(view => {
      view.on("pointertap", () => this.handleBotCardClick(view));
    });
  }

  private handlePlayerCardClick(view: CardView) {
    if (this.turn !== "player") return;
    if (this.selectedAttacker && this.selectedAttacker.view === view) {
      // Cancel selection
      gsap.to(view.scale, { x: 1, y: 1, duration: 0.2 });
      this.selectedAttacker = null;
      return;
    }
    if (!this.selectedAttacker) {
      this.selectedAttacker = { view, owner: this.player };
      gsap.to(view.scale, { x: 1.2, y: 1.2, duration: 0.2 });
    }
  }

  private handleBotCardClick(view: CardView) {
    if (this.turn !== "player" || !this.selectedAttacker) return;
    if (this.selectedDefender && this.selectedDefender.view === view) return;
    this.selectedDefender = { view, owner: this.bot };
    gsap.to(view.scale, { x: 1.2, y: 1.2, duration: 0.2 });
    setTimeout(() => this.resolveAttack(), 400);
  }

  private resolveAttack() {
    if (!this.selectedAttacker || !this.selectedDefender) return;
    const attacker = this.selectedAttacker.view.card;
    const defender = this.selectedDefender.view.card;
    defender.Health = Math.max(0, defender.Health - attacker.Attack);
    attacker.Health = Math.max(0, attacker.Health - defender.Attack);
    // Update stats
    this.selectedAttacker.view.update();
    this.selectedDefender.view.update();
    // Reset animations
    gsap.to(this.selectedAttacker.view.scale, { x: 1, y: 1, duration: 0.2 });
    gsap.to(this.selectedDefender.view.scale, { x: 1, y: 1, duration: 0.2 });
    // Remove cards
    this.removeDeadCards();
    this.selectedAttacker = null;
    this.selectedDefender = null;
    this.turn = "bot";
    setTimeout(() => this.botTurn(), 800);
  }

  private removeDeadCards() {
    // First, update stats for all CardViews
    this.playerCardViews.forEach(view => view.update());
    this.botCardViews.forEach(view => view.update());
    // Player
    const prevPlayerHand = [...this.player.hand];
    const prevBotHand = [...this.bot.hand];
    // Remove cards from hand
    this.player.hand = this.player.hand.filter(c => Math.max(0, c.Health) > 0);
    this.bot.hand = this.bot.hand.filter(c => Math.max(0, c.Health) > 0);
    // Find indices of removed cards
    const playerDeadIndexes = prevPlayerHand.map((c, i) => this.player.hand.includes(c) ? -1 : i).filter(i => i !== -1);
    const botDeadIndexes = prevBotHand.map((c, i) => this.bot.hand.includes(c) ? -1 : i).filter(i => i !== -1);
    // If less than 5 cards in hand, draw a card and add it in place of removed card
    playerDeadIndexes.forEach(idx => {
      if (this.player.hand.length < 5) {
        const newCard = this.player.deck.drawRandomCard();
        if (newCard) this.player.hand.splice(idx, 0, newCard);
      }
    });
    botDeadIndexes.forEach(idx => {
      if (this.bot.hand.length < 5) {
        const newCard = this.bot.deck.drawRandomCard();
        if (newCard) this.bot.hand.splice(idx, 0, newCard);
      }
    });
    // Destroy player card views for dead cards
    this.playerCardViews.forEach(view => {
      if (!this.player.hand.includes(view.card)) {
        view.destroy({ children: true });
      }
    });
    // Destroy bot card views for dead cards
    this.botCardViews.forEach(view => {
      if (!this.bot.hand.includes(view.card)) {
        view.destroy({ children: true });
      }
    });
    // If there is no leader, the player loses
    if (!this.player.hand.some(c => c instanceof LeaderCard)) {
      alert("Bot Kazandı!");
      return;
    }
    if (!this.bot.hand.some(c => c instanceof LeaderCard)) {
      alert("Oyuncu Kazandı!");
      return;
    }
    // Update screen and indicators
    this.renderHands();
    this.setupInteraction();
    // Update deck counts
    this.battlefield.showDeckCounts(this.player.deck.cards.length, this.bot.deck.cards.length);
  }

  private botTurn() {
    // Bot hand has cards other than leader, make a random attack
    const botCards = this.bot.hand.filter(c => !(c instanceof LeaderCard));
    const playerCards = this.player.hand;
    if (botCards.length === 0) return;
    const attackerIdx = Math.floor(Math.random() * botCards.length);
    let defenderIdx = Math.floor(Math.random() * playerCards.length);
    // If only leader is left, attack it
    if (playerCards.length === 1) defenderIdx = 0;
    const attackerView = this.botCardViews.find(v => v.card === botCards[attackerIdx]);
    const defenderView = this.playerCardViews.find(v => v.card === playerCards[defenderIdx]);
    if (!attackerView || !defenderView) return;
    gsap.to(attackerView.scale, { x: 1.2, y: 1.2, duration: 0.2 });
    gsap.to(defenderView.scale, { x: 1.2, y: 1.2, duration: 0.2 });
    setTimeout(() => {
      playerCards[defenderIdx].Health = Math.max(0, playerCards[defenderIdx].Health - botCards[attackerIdx].Attack);
      botCards[attackerIdx].Health = Math.max(0, botCards[attackerIdx].Health - playerCards[defenderIdx].Attack);
      // Update stats
      defenderView?.update();
      attackerView?.update();
      gsap.to(attackerView.scale, { x: 1, y: 1, duration: 0.2 });
      gsap.to(defenderView.scale, { x: 1, y: 1, duration: 0.2 });
      this.removeDeadCards();
      this.turn = "player";
    }, 400);
  }
}
