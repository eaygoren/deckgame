import { Card } from "../game/Card";
import { CardView } from "../ui/CardView";
import { AttackType, ClassType, Color, Rarity } from "./enums";

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

export interface ILeaderCard{
  card: ICard;
  crown: string;
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
  ability: IAbility;
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