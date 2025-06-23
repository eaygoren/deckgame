import { Card, Color, Faction, Rarity, AttackType } from "../game/Card";
import { Player } from "../game/Player";
import { CardView } from "../ui/CardView";
import { ClassType } from "./enums";

export interface IAbility {
  name: string;
  description: string;
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

export interface CombatOption2{
  player: Player;
  bot: Player;
  attacker: Card;
  defender: Card;
  selectedAttacker: ISelectedCard | null;
  selectedDefender: ISelectedCard | null;
  playerCardViews: CardView[];
  botCardViews: CardView[];
  attackerView: CardView;
  defenderView: CardView;
  attackDamage: number;
  counterDamage: number;
}

export interface CombatOption {
  attacker: CardView;
  defender: CardView;
  attackDamage: number;
  counterDamage: number;
}