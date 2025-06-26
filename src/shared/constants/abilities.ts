import { ClassType } from "../enums";
import { IAbility } from "../interfaces";

export const MageAbility: IAbility = {
    name: "Arcane Blast",
    description: "After attacking, deal 50% base damage to one random opponent (except leader)."
};

export const RogueAbility: IAbility = {
    name: "Critical Strike",
    description: "25% chance to deal double damage on attack."
};

export const TankAbility: IAbility = {
    name: "Iron Wall",
    description: "Take 50% less damage from ranged attacks."
};

export const WarriorAbility: IAbility = {
    name: "Berserker Rage",
    description: "Permanently gain 50% more attack when health drops below 50%."
};

export const ClassAbilities = {
    [ClassType.Mage]: () => ({ ...MageAbility }),
    [ClassType.Rogue]: () => ({ ...RogueAbility }),
    [ClassType.Tank]: () => ({ ...TankAbility }),
    [ClassType.Warrior]: () => ({ ...WarriorAbility }),
};
