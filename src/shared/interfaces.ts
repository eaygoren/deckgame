import { Card, Color, Faction, Rarity } from "../game/Card";
import { Game } from "../game/Game";
import { Player } from "../game/Player";

export interface Ability {
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
  ability?: Ability;
  crown?: string;
}