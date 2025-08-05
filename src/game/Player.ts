import { Card, LeaderCard } from "./Card";
import { Deck } from "./Deck";

export class Player {
  public name: string;
  public deck: Deck;
  public hand: Card[] = [];
  public leader: LeaderCard;

  constructor(name: string, deck: Deck) {
    this.name = name;
    this.deck = deck;

    if (!deck.leader) throw new Error("Deck must have a leader");

    this.leader = deck.leader;
    this.hand = deck.getPlayableHand();
  }

  public drawCard() {
    if (this.hand.length >= 5) return;
    // Draw a random card from the deck
    const card = this.deck.drawRandomCard();
    if (card) this.hand.push(card);
  }

  public playTurn() {
    // Remove the played card from hand
    this.hand.splice(0, 1);
  }

  public addCardToHand(card: Card): void {
    if (this.hand.length < 5) {
      this.hand.push(card);
    }
  }

  public removeCardFromHand(card: Card): void {
    const index = this.hand.indexOf(card);
    if (index > -1) {
      this.hand.splice(index, 1);
    }
  }
}