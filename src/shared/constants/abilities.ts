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
    description: "A warrior fights fiercest when death draws near. Once per match, permanently gains 50% attack at turn end if HP is at or below half starting HP."
};

export const ClassAbilities = {
    [ClassType.Mage]: () => ({ ...MageAbility }),
    [ClassType.Rogue]: () => ({ ...RogueAbility }),
    [ClassType.Tank]: () => ({ ...TankAbility }),
    [ClassType.Warrior]: () => ({ ...WarriorAbility }),
};
