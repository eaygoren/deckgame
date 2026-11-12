import { Card } from "../game/Card";
import { CardView } from "../ui/CardView";
import { AttackType, ClassType, Color, Rarity, UnitType } from "./enums";
import { ISkill, SkillEffect } from "./interfaces/skillInterfaces";

export interface IAbility {
  name: string;
  description: string;
}

export interface ILeaderCard {
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
  unitType: UnitType;
  skill?: ISkill | null;
  activeEffects?: SkillEffect[];
  skillUsedThisTurn?: boolean;
  maxHealth?: number;
}

export interface MoveOption {
  attacker: Card;
  defender: Card;
  score: number;
}

export type PlayStrike = (
  attacker: CardView,
  defender: CardView,
  impact: () => number,
) => void | Promise<void>;

export enum AvailabilityType {
  Playable = "playable",
  SummonOnly = "summon_only",
  All = "all"
}

export interface ICharacter {
  name: string;
  cover: string;
  attack: number;
  health: number;
  rarity: Rarity;
  color: Color;
  attackType: AttackType;
  classType: ClassType;
  unitType: UnitType;
  availabilityType: AvailabilityType;
}

export interface CharacterListType {
  [key: string]: ICharacter;
}
