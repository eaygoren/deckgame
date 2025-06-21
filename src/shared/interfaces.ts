import { Card, Color, Faction, Rarity, AttackType } from "../game/Card";
import { Game } from "../game/Game";
import { Player } from "../game/Player";
import { CardView } from "../ui/CardView";
import { ClassType } from "./enums";

export interface IAbility {
  name: string;
  description: string;
  activate(card: Card, owner: Player, game?: Game): void;
  // Combat abilities
  modifyAttackDamage?(attacker: Card, defender: Card, baseDamage: number, gameInstance?: any): number;
  modifyDefenseDamage?(attacker: Card, defender: Card, baseDamage: number, gameInstance?: any): number;
  onPostAttack?(attacker: Card, defender: Card, game: any): void;
}

export interface ICard {
  name: string;
  cover: string;
  attack: number;
  health: number;
  faction: Faction;
  rarity: Rarity;
  color: Color;
  attackType: AttackType;
  classType: ClassType;
  ability?: IAbility;
  crown?: string;
}

export interface ISelectedCard {
  view: CardView;
  owner: Player;
}

export interface MoveOption {
  attacker: Card;
  defender: Card;
  score: number;
}