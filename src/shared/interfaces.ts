import { Card } from "../game/Card";
import { CardView } from "../ui/CardView";
import { AttackType, ClassType, Color, Rarity } from "./enums";
import { ISkill, SkillEffect } from "./interfaces/skillInterfaces";

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
  skill?: ISkill | null;
  activeEffects?: SkillEffect[];
  skillUsedThisTurn?: boolean; // Yeni özellik, bu kartın bu turda skill kullanılıp kullanılmadığını saklar
  maxHealth?: number; // Yeni özellik, başlangıç canını saklamak için
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