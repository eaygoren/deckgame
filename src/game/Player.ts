import { Card, LeaderCard } from "./Card";
import { Deck } from "./Deck";
import type { Game } from "./Game";

export class Player {
  name: string;
  deck: Deck;
  hand: Card[] = [];
  leader: LeaderCard;

  constructor(name: string, deck: Deck) {
    this.name = name;
    this.deck = deck;

    if (!deck.leader) throw new Error("Deck must have a leader");

    this.leader = deck.leader;
    this.hand = deck.getPlayableHand();
  }

  drawCard() {
    if (this.hand.length >= 5) return;
    // Draw a random card from the deck
    const card = this.deck.drawRandomCard();
    if (card) this.hand.push(card);
  }

  playTurn(game: Game, _opponent: Player) {
    // Simple example: play the first card
    const card = this.hand[0];
    // Activate the card's ability if it exists
    if (card.Ability) card.Ability.activate(card, this, game);
    // Remove the played card from hand
    this.hand.splice(0, 1);
  }
}
