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
      // Rastgele 4 kart seç, liderle birlikte 5 olsun
      const shuffled = otherCards.sort(() => Math.random() - 0.5);
      hand = hand.concat(shuffled.slice(0, 4));
    } else {
      hand = this.cards;
    }

    return hand;
  }

  drawRandomCard(exclude: Card[] = []): Card | null {
    const available = this.cards.filter((c) => !exclude.includes(c));

    if (available.length === 0) return null;

    return available[Math.floor(Math.random() * available.length)];
  }
}
