import { Card, LeaderCard } from "./Card";
import { Deck } from "./Deck";

export class Player {
  private _name: string;
  private _deck: Deck;
  private _team: Card[] = [];
  private _hand: Card[] = [];
  private _leader: LeaderCard;

  constructor(name: string, deck: Deck) {
    this._name = name;
    this._deck = deck;

    if (!deck.leader) throw new Error("Deck must have a leader");

    this._leader = deck.leader;
    this._hand = deck.getPlayableHand();
    this._team = [];
  }

  public get name(): string {
    return this._name;
  }

  public get deck(): Deck {
    return this._deck;
  }

  public set deck(deck: Deck) {
    this._deck = deck;
  }

  public get team(): Card[] {
    return this._team;
  }

  public set team(cards: Card[]) {
    this._team = cards;
  }

  public addToTeam(card: Card) {
    this._team.push(card);
  }

  public get hand(): Card[] {
    return this._hand;
  }

  public set hand(cards: Card[]) {
    this._hand = cards;
  }

  public get leader(): LeaderCard {
    return this._leader;
  }
}