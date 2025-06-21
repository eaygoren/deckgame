import { Environment } from "../shared/constants";
import { Color, Faction, Rarity, AttackType, ClassType } from "../shared/enums";
import { IAbility, ICard } from "../shared/interfaces";

export class Card {
  private static nextId = 0;
  private _id: number;
  protected _name: string;
  protected _attack: number;
  protected _health: number;
  protected _faction: Faction;
  protected _rarity: Rarity;
  protected _color: Color;
  protected _cover: string;
  protected _attackType: AttackType;
  protected _classType: ClassType;
  private _ability?: IAbility;
  private _warriorRageActivated: boolean = false;
  
  constructor(options: ICard) {
    this._id = Card.nextId++;
    this._name = options.name;
    this._cover = options.cover;
    this._attack = options.attack;
    this._health = options.health;
    this._faction = options.faction;
    this._rarity = options.rarity;
    this._color = options.color;
    this._attackType = options.attackType;
    this._classType = options.classType;
    this._ability = options.ability;
  }

  public get Id(): number {
    return this._id;
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
  public get AttackType(): AttackType {
    return this._attackType;
  }
  public get ClassType(): ClassType {
    return this._classType;
  }
  public get Ability(): IAbility | undefined {
    return this._ability;
  }

  public set Ability(ability: IAbility | undefined) {
    this._ability = ability;
  }
  public get WarriorRageActivated(): boolean {
    return this._warriorRageActivated;
  }

  public set WarriorRageActivated(value: boolean) {
    this._warriorRageActivated = value;
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
    attackType: AttackType,
    classType: ClassType,
    leaderAbility: IAbility,
    crown: string = Environment.crown
  ) {
    super({ name, cover, attack, health, faction, rarity, color, attackType, classType });
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

export { Rarity, Faction, Color, AttackType };
export type { IAbility as Ability };
