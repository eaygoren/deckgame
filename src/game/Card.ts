import { Environment } from "../shared/constants";
import { Color, Faction, Rarity } from "../shared/enums";
import { Ability, ICard } from "../shared/interfaces";

export class Card {
  protected _name: string;
  protected _attack: number;
  protected _health: number;
  protected _faction: Faction;
  protected _rarity: Rarity;
  protected _color: Color;
  protected _cover: string;
  private _ability?: Ability;

  constructor(options: ICard) {
    this._name = options.name;
    this._cover = options.cover;
    this._attack = options.attack;
    this._health = options.health;
    this._faction = options.faction;
    this._rarity = options.rarity;
    this._color = options.color;
    this._ability = options.ability;
  }

  public get Name(): string {
    return this._name;
  }
  public get Cover(): string {
    return this._cover;
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
  public get Ability(): Ability | undefined {
    return this._ability;
  }
}

export class LeaderCard extends Card {
  private _leaderAbility: Ability;
  private _crown: string;

  constructor(
    name: string,
    cover: string,
    attack: number,
    health: number,
    faction: Faction,
    rarity: Rarity,
    color: Color,
    leaderAbility: Ability,
    crown: string = Environment.crown
  ) {
    super({ name, cover, attack, health, faction, rarity, color });
    this._leaderAbility = leaderAbility;
    this._crown = crown;
  }

  public get LeaderAbility(): Ability {
    return this._leaderAbility;
  }

  public get Crown(): string {
    return this._crown;
  }
}

export { Rarity, Faction, Color };
export type { Ability };
