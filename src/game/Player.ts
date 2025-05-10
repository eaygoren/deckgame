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

    const exclude = this.hand;
    const card = this.deck.drawRandomCard(exclude);
    
    if (card) this.hand.push(card);
  }

  playTurn(game: Game, _opponent: Player) {
    // Basit örnek: ilk kartı oynar
    const card = this.hand[0];
    // Kartın yeteneği varsa aktive et
    if (card.Ability) card.Ability.activate(card, this, game);
    // Oynanan kartı elden çıkar
    this.hand.splice(0, 1);
  }
}
