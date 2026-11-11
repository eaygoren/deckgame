import { Card, LeaderCard } from "./Card";

export class Deck {
  private _cards: Card[] = [];
  private _leader!: LeaderCard;
  private _maxCards: number = 10;

  public addCard(card: Card) {
    this._cards.push(card);
  }

  public setLeader(leader: LeaderCard) {
    this._leader = leader;

    if (!this._cards.includes(leader)) {
      this.addCard(leader);
    }
  }

  public getPlayableHand(): Card[] {
    if (!this._leader) throw new Error("Leader not set");

    let hand: Card[] = [this._leader];
    const otherCards = this._cards.filter((c) => c !== this._leader);

    if (this._cards.length >= 5) {
      // Draw 4 random cards from the deck, excluding the leader
      const shuffled = otherCards.sort(() => Math.random() - 0.5);
      hand = hand.concat(shuffled.slice(0, 4));
    } else {
      hand = this._cards;
    }

    return hand;
  }

  public drawRandomCard(random: () => number = Math.random): Card | null {
    // Draw a random card from the deck, excluding the leader
    const available = this._cards.filter((c) => c !== this._leader);
    if (available.length === 0) return null;
    const idx = Math.floor(random() * available.length);
    const card = available[idx];
    // Remove the card from the deck
    this._cards = this._cards.filter((c) => c !== card);
    return card;
  }

  public get cards(): Card[] {
    return this._cards;
  }

  public set cards(value: Card[]) {
    if (value.length > this._maxCards) {
      throw new Error("Deck cannot have more than " + this._maxCards + " cards");
    }
    this._cards = value;
  }

  public get leader(): LeaderCard {
    return this._leader;
  }
}
