import { Color, Rarity, AttackType } from "../game/Card";
import { ClassType } from "./enums";
import { IAbility } from "./interfaces";

export const Characters = {
    Aerwyn: "Aerwyn",
    Alien: "Alien",
    Arcangel: "Arcangel",
    Arcmage: "Arcmage",
    Assassin: "Assassin",
    Cerberus: "Cerberus",
    Cyclop: "Cyclop",
    Dragon: "Dragon",
    // Dwarf: "Dwarf",
    Elf: "Elf",
    Ent: "Ent",
    Gunslinger: "Gunslinger",
    Illusionist: "Illusionist",
    Joker: "Joker",
    Knight: "Knight",
    Lich: "Lich",
    // Medusa: "Medusa",
    // Minotaur: "Minotaur",
    Monk: "Monk",
    // Mummy: "Mummy",
    // Naga: "Naga",
    Ra: "Ra",
    // Phoenix: "Phoenix",
    // Pirate: "Pirate",
    Reaper: "Reaper",
    // Robot: "Robot",
    Samurai: "Samurai",
    Siren: "Siren",
    // Skeleton: "Skeleton",
    Vampire: "Vampire",
    Werewolf: "Werewolf",
    // Witch: "Witch",
    Wukong: "Wukong",
    Zeus: "Zeus",
    Zombie: "Zombie"
}

export const CharacterList = {
    Aerwyn: {
        name: Characters.Aerwyn,
        cover: Characters.Aerwyn.toLowerCase(),
        attack: 6,
        health: 8,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue
    },
    Alien: {
        name: Characters.Alien,
        cover: Characters.Alien.toLowerCase(),
        attack: 4,
        health: 5,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Rogue
    },
    Arcangel: {
        name: Characters.Arcangel,
        cover: Characters.Arcangel.toLowerCase(),
        attack: 9,
        health: 7,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Melee,
        classType: ClassType.Mage
    },
    Arcmage: {
        name: Characters.Arcmage,
        cover: Characters.Arcmage.toLowerCase(),
        attack: 5,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage
    },
    Assassin: {
        name: Characters.Assassin,
        cover: Characters.Assassin.toLowerCase(),
        attack: 8,
        health: 5,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Rogue
    },
    Cerberus: {
        name: Characters.Cerberus,
        cover: Characters.Cerberus.toLowerCase(),
        attack: 6,
        health: 7,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Mage
    },
    Cyclop: {
        name: Characters.Cyclop,
        cover: Characters.Cyclop.toLowerCase(),
        attack: 5,
        health: 6,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank
    },
    Dragon: {
        name: Characters.Dragon,
        cover: Characters.Dragon.toLowerCase(),
        attack: 7,
        health: 4,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage
    },
    Elf: {
        name: Characters.Elf,
        cover: Characters.Elf.toLowerCase(),
        attack: 3,
        health: 7,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue
    },
    Ent: {
        name: Characters.Ent,
        cover: Characters.Ent.toLowerCase(),
        attack: 4,
        health: 10,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank
    },
    Gunslinger: {
        name: Characters.Gunslinger,
        cover: Characters.Gunslinger.toLowerCase(),
        attack: 8,
        health: 6,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue
    },
    Illusionist: {
        name: Characters.Illusionist,
        cover: Characters.Illusionist.toLowerCase(),
        attack: 6,
        health: 7,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage
    },
    Joker: {
        name: Characters.Joker,
        cover: Characters.Joker.toLowerCase(),
        attack: 7,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Rogue
    },
    Knight: {
        name: Characters.Knight,
        cover: Characters.Knight.toLowerCase(),
        attack: 5,
        health: 10,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank
    },
    Lich: {
        name: Characters.Lich,
        cover: Characters.Lich.toLowerCase(),
        attack: 6,
        health: 8,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Melee,
        classType: ClassType.Tank
    },
    Monk: {
        name: Characters.Monk,
        cover: Characters.Monk.toLowerCase(),
        attack: 5,
        health: 10,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior
    },
    Ra: {
        name: Characters.Ra,
        cover: Characters.Ra.toLowerCase(),
        attack: 10,
        health: 5,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior
    },
    Reaper: {
        name: Characters.Reaper,
        cover: Characters.Reaper.toLowerCase(),
        attack: 9,
        health: 6,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior
    },
    Samurai: {
        name: Characters.Samurai,
        cover: Characters.Samurai.toLowerCase(),
        attack: 8,
        health: 9,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior
    },
    Siren: {
        name: Characters.Siren,
        cover: Characters.Siren.toLowerCase(),
        attack: 4,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage
    },
    Vampire: {
        name: Characters.Vampire,
        cover: Characters.Vampire.toLowerCase(),
        attack: 8,
        health: 7,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank
    },
    Werewolf: {
        name: Characters.Werewolf,
        cover: Characters.Werewolf.toLowerCase(),
        attack: 7,
        health: 6,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior
    },
    Wukong: {
        name: Characters.Wukong,
        cover: Characters.Wukong.toLowerCase(),
        attack: 8,
        health: 9,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior
    },
    Zeus: {
        name: Characters.Zeus,
        cover: Characters.Zeus.toLowerCase(),
        attack: 9,
        health: 8,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage
    },
    Zombie: {
        name: Characters.Zombie,
        cover: Characters.Zombie.toLowerCase(),
        attack: 5,
        health: 9,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Tank
    },
};

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

export const CARD_POSITIONS = [
    { x: 225, slot: 0 },  // Sol 1
    { x: 575, slot: 1 },  // Sol 2  
    { x: 925, slot: 2 }, // Orta (Leader)
    { x: 1275, slot: 3 }, // Sağ 1
    { x: 1625, slot: 4 }  // Sağ 2
];

export const Environment = {
    crown: "crown",
    deck: "deck",
    melee: "melee",
    ranged: "ranged",
    warrior: "warrior",
    mage: "mage",
    rogue: "rogue",
    tank: "tank",
}

export const BroadcastEvents = {
    COMPLETE_PLAYER_COMBAT: "completeplayercombat",
    PLAYER_COMBAT_COMPLETED: "playercombatcompleted",
    COMPLETE_BOT_COMBAT: "completebotcombat",
    BOT_COMBAT_COMPLETED: "botcombatcompleted",
    CHECK_FOR_WINNER: "checkforwinner",
    RESET_INTERACTION: "restartgame",
    SHOW_ABILITY_MESSAGE: "showabilitymessage",
    SHOW_DAMAGE_ANIMATION: "showdamageanimation",
    CHECK_WARRIOR_RAGE: "checkwarriorrage",
    CHECK_ARCANE_BLAST: "checkarcaneblast",
    ADD_NEW_CARDS: "addnewcards",
    NEW_CARDS_ADDED: "newcardsadded",
    CARDS_REMOVED: "cardsremoved",
}