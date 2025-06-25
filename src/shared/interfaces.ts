import { Card, Color, Rarity, AttackType } from "../game/Card";
import { Player } from "../game/Player";
import { CardView } from "../ui/CardView";
import { ClassType } from "./enums";

export interface IAbility {
  name: string;
  description: string;
}

export interface SkillOptions {
  attacker?: Card;
  defender?: Card;
  dealtDamage?: number;
  ignoreDefense?: boolean;
  isDefeated?: boolean;
  isSkillDisabled?: boolean;
  [key: string]: any;
}

export interface ISkill {
  name: string;
  description: string;
  useSkill(options: SkillOptions): any;
}

export interface ICard {
  name: string;
  cover: string;
  attack: number;
  health: number;
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

export interface CombatOption {
  attacker: CardView;
  defender: CardView;
  attackDamage: number;
  counterDamage: number;
}