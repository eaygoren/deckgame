import { Card, LeaderCard } from "./Card";

export class Deck {
  cards: Card[] = [];
  leader: LeaderCard | null = null;
  maxCards: number = 10;

  addCard(card: Card) {
    if (this.cards.length < this.maxCards) {
      this.cards.push(card);
    } else {
      throw new Error("Deck is full");
    }
  }

  setLeader(leader: LeaderCard) {
    this.leader = leader;
    
    if (!this.cards.includes(leader)) {
      this.addCard(leader);
    }
  }

  getPlayableHand(): Card[] {
    if (!this.leader) throw new Error("Leader not set");

    let hand: Card[] = [this.leader];
    const otherCards = this.cards.filter((c) => c !== this.leader);

    if (this.cards.length >= 5) {
      // Draw 4 random cards from the deck, excluding the leader
      const shuffled = otherCards.sort(() => Math.random() - 0.5);
      hand = hand.concat(shuffled.slice(0, 4));
    } else {
      hand = this.cards;
    }

    return hand;
  }

  drawRandomCard(): Card | null {
    // Draw a random card from the deck, excluding the leader
    const available = this.cards.filter((c) => c !== this.leader);
    if (available.length === 0) return null;
    const idx = Math.floor(Math.random() * available.length);
    const card = available[idx];
    // Remove the card from the deck
    this.cards = this.cards.filter((c) => c !== card);
    return card;
  }
}
