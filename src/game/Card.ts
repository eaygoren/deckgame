import { Environment } from "../shared/constants";
import { Color, Faction, Rarity, Class } from "../shared/enums";
import { IAbility, ICard } from "../shared/interfaces";

export class Card {
  protected _name: string;
  protected _attack: number;
  protected _health: number;
  protected _faction: Faction;
  protected _rarity: Rarity;
  protected _color: Color;
  protected _cover: string;
  protected _class: Class;
  private _ability?: IAbility; constructor(options: ICard) {
    this._name = options.name;
    this._cover = options.cover;
    this._attack = options.attack;
    this._health = options.health;
    this._faction = options.faction;
    this._rarity = options.rarity;
    this._color = options.color;
    this._class = options.class;
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
  public get Class(): Class {
    return this._class;
  }
  public get Ability(): IAbility | undefined {
    return this._ability;
  }
}

export class LeaderCard extends Card {
  private _leaderAbility: IAbility;
  private _crown: string; constructor(
    name: string,
    cover: string,
    attack: number,
    health: number,
    faction: Faction,
    rarity: Rarity,
    color: Color,
    cardClass: Class,
    leaderAbility: IAbility,
    crown: string = Environment.crown
  ) {
    super({ name, cover, attack, health, faction, rarity, color, class: cardClass });
    this._leaderAbility = leaderAbility;
    this._crown = crown;
  }

  public get LeaderAbility(): IAbility {
    return this._leaderAbility;
  }

  public get Crown(): string {
    return this._crown;
  }
}

export { Rarity, Faction, Color, Class };
export type { IAbility as Ability };
