import { Color, Faction, Rarity } from "../shared/enums";
import { Ability } from "../shared/interfaces";

export class Card {
  private _name: string;
  private _attack: number;
  private _health: number;
  private _faction: Faction;
  private _rarity: Rarity;
  private _color: Color;
  private _imagePath: string;
  private _ability?: Ability;

  constructor(name: string, attack: number, health: number, faction: Faction, rarity: Rarity, color: Color, imagePath: string, ability?: Ability) {
    this._name = name;
    this._attack = attack;
    this._health = health;
    this._faction = faction;
    this._rarity = rarity;
    this._color = color;
    this._imagePath = imagePath;
    this._ability = ability;
  }

  public get Name(): string {
    return this._name;
  }
  public get Attack(): number {
    return this._attack;
  }
  public set Attack(value: number) {
    this._attack = value;
  }
  public get Health(): number {
    return this._health;
  }
  public set Health(value: number) {
    this._health = value;
  }
  public get Faction(): Faction {
    return this._faction;
  }
  public get Rarity(): Rarity {
    return this._rarity;
  }
  public get Color(): Color {
    return this._color;
  }
  public get ImagePath(): string {
    return this._imagePath;
  }
  public get Ability(): Ability | undefined {
    return this._ability;
  }
}

export class LeaderCard extends Card {
  private _leaderAbility: Ability;

  constructor(
    name: string,
    attack: number,
    health: number,
    faction: Faction,
    rarity: Rarity,
    color: Color,
    leaderAbility: Ability,
    imagePath: string
  ) {
    super(name, attack, health, faction, rarity, color, imagePath, leaderAbility);
    this._leaderAbility = leaderAbility;
  }

  public get LeaderAbility(): Ability {
    return this._leaderAbility;
  }
}

export { Rarity, Faction, Color };
export type { Ability };
