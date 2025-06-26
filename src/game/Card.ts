import { Environment } from "../shared/constants/gameConfig";
import { Color, Rarity, AttackType, ClassType } from "../shared/enums";
import { IAbility, ICard, ILeaderCard } from "../shared/interfaces";

export class Card implements ICard {
  private static nextId = 0;
  protected _id: number;
  protected _name: string;
  protected _attack: number;
  protected _health: number;
  protected _rarity: Rarity;
  protected _color: Color;
  protected _cover: string;
  protected _attackType: AttackType;
  protected _classType: ClassType;
  protected _ability: IAbility;
  protected _warriorRageActivated: boolean = false;
  
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
  public get ability(): IAbility {
    return this._ability;
  }

  public set ability(ability: IAbility) {
    this._ability = ability;
  }

  public get WarriorRageActivated(): boolean {
    return this._warriorRageActivated;
  }

  public set WarriorRageActivated(value: boolean) {
    this._warriorRageActivated = value;
  }
}

export class LeaderCard extends Card implements ILeaderCard {
  protected _crown: string;

  constructor(
    card: ICard,
    crown: string = Environment.crown
  ) {
    super({
      name: card.name,
      cover: card.cover,
      attack: card.attack,
      health: card.health,
      rarity: card.rarity,
      color: card.color,
      attackType: card.attackType,
      classType: card.classType,
      ability: card.ability
    });

    this._crown = crown;
  }

  public get card(): ICard {
    return {
      name: this._name,
      cover: this._cover,
      attack: this._attack,
      health: this._health,
      rarity: this._rarity,
      color: this._color,
      attackType: this._attackType,
      classType: this._classType,
      ability: this._ability
    };
  }

  public get ability(): IAbility {
    return this._ability;
  }

  public set ability(ability: IAbility) {
    this._ability = ability;
  }

  public get crown(): string {
    return this._crown;
  }
}
