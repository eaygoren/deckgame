import { Environment } from "../shared/constants";
import { Color, Rarity, AttackType, ClassType } from "../shared/enums";
import { IAbility, ICard } from "../shared/interfaces";

export class Card implements ICard {
  private static nextId = 0;
  private _id: number;
  protected _name: string;
  protected _attack: number;
  protected _health: number;
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
    this._rarity = options.rarity;
    this._color = options.color;
    this._attackType = options.attackType;
    this._classType = options.classType;
    this._ability = options.ability;
  }

  public get Id(): number {
    return this._id;
  }
  public get name(): string {
    return this._name;
  }
  public get cover(): string {
    return this._cover;
  }
  public get attack(): number {
    return this._attack;
  }
  public set attack(value: number) {
    this._attack = value;
  }
  public get health(): number {
    return this._health;
  }
  public set health(value: number) {
    this._health = value;
  }
  public get rarity(): Rarity {
    return this._rarity;
  }
  public get color(): Color {
    return this._color;
  }
  public get attackType(): AttackType {
    return this._attackType;
  }
  public get classType(): ClassType {
    return this._classType;
  }
  public get ability(): IAbility | undefined {
    return this._ability;
  }

  public set ability(ability: IAbility | undefined) {
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
    rarity: Rarity,
    color: Color,
    attackType: AttackType,
    classType: ClassType,
    leaderAbility: IAbility,
    crown: string = Environment.crown
  ) {
    super({ name, cover, attack, health, rarity, color, attackType, classType });
    this._leaderAbility = leaderAbility;
    this._crown = crown;
  }

  public get leaderAbility(): IAbility {
    return this._leaderAbility;
  }

  public get crown(): string {
    return this._crown;
  }
}

export { Rarity, Color, AttackType };
export type { IAbility as Ability };
