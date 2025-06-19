import { Card, Color, Faction, Rarity, Class } from "../game/Card";
import { Game } from "../game/Game";
import { Player } from "../game/Player";

export interface IAbility {
  name: string;
  description: string;
  activate(card: Card, owner: Player, game?: Game): void;
}

export interface ICard {
  name: string;
  cover: string;
  attack: number;
  health: number;
  faction: Faction;
  rarity: Rarity;
  color: Color;
  class: Class;
  ability?: IAbility;
  crown?: string;
}

export interface MoveOption {
  attacker: Card;
  defender: Card;
  score: number;
}