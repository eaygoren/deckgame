import { Card, Color, Faction, Rarity, AttackType } from "../game/Card";
import { ClassType } from "./enums";
import { IAbility } from "./interfaces";

export const CharacterNames = {
    Aerwyn: "Aerwyn",
    Assassin: "Assassin",
    Cerberus: "Cerberus",
    Dragon: "Dragon",
    Elf: "Elf",
    Ent: "Ent",
    Ixelis: "Ixelis",
    Knight: "Knight",
    Arcmage: "Arcmage",
    Ra: "Ra",
    Samurai: "Samurai",
    Siren: "Siren",
    Vampire: "Vampire",
    Werewolf: "Werewolf",
    Zeus: "Zeus",
    Zombie: "Zombie",
}

export const CharacterSource = {
    Aerwyn: "aerwyn",
    Assassin: "assassin",
    Cerberus: "cerberus",
    Dragon: "dragon",
    Elf: "elf",
    Ent: "ent",
    Ixelis: "ixelis",
    Knight: "knight",
    Arcmage: "arcmage",
    Ra: "ra",
    Siren: "siren",
    Samurai: "samurai",
    Vampire: "vampire",
    Werewolf: "werewolf",
    Zeus: "zeus",
    Zombie: "zombie",
}

export const CharacterList = {
    Arcmage: {
        name: CharacterNames.Arcmage,
        cover: CharacterSource.Arcmage,
        attack: 5, // Reduced from 7 (ranged penalty)
        health: 6, // Reduced from 8 (ranged penalty)
        faction: Faction.Forest,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage
    },
    Aerwyn: {
        name: CharacterNames.Aerwyn,
        cover: CharacterSource.Aerwyn,
        attack: 6,
        health: 8,
        faction: Faction.Forest,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue
    },
    Assassin: {
        name: CharacterNames.Assassin,
        cover: CharacterSource.Assassin,
        attack: 8,
        health: 5,
        faction: Faction.Empire,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Rogue
    },
    Cerberus: {
        name: CharacterNames.Cerberus,
        cover: CharacterSource.Cerberus,
        attack: 6,
        health: 7,
        faction: Faction.Forest,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Mage
    },
    Dragon: {
        name: CharacterNames.Dragon,
        cover: CharacterSource.Dragon,
        attack: 7, // Reduced from 9 (ranged penalty)
        health: 4, // Reduced from 6 (ranged penalty)
        faction: Faction.Forest,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage
    },
    Elf: {
        name: CharacterNames.Elf,
        cover: CharacterSource.Elf,
        attack: 3, // Reduced from 4 (ranged penalty)
        health: 7, // Reduced from 9 (ranged penalty)
        faction: Faction.Empire,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue
    },
    Ent: {
        name: CharacterNames.Ent,
        cover: CharacterSource.Ent,
        attack: 4,
        health: 10,
        faction: Faction.Forest,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank
    },
    Ixelis: {
        name: CharacterNames.Ixelis,
        cover: CharacterSource.Ixelis,
        attack: 8,
        health: 6,
        faction: Faction.Forest,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue
    },
    Knight: {
        name: CharacterNames.Knight,
        cover: CharacterSource.Knight,
        attack: 5,
        health: 10,
        faction: Faction.Empire,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank
    },
    Ra: {
        name: CharacterNames.Ra,
        cover: CharacterSource.Ra,
        attack: 10,
        health: 5,
        faction: Faction.Empire,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior
    },
    Samurai: {
        name: CharacterNames.Samurai,
        cover: CharacterSource.Samurai,
        attack: 8,
        health: 9,
        faction: Faction.Empire,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior
    },
    Siren: {
        name: CharacterNames.Siren,
        cover: CharacterSource.Siren,
        attack: 4, // Reduced from 6 (ranged penalty)
        health: 6, // Reduced from 8 (ranged penalty)
        faction: Faction.Forest,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage
    },
    Vampire: {
        name: CharacterNames.Vampire,
        cover: CharacterSource.Vampire,
        attack: 8,
        health: 7,
        faction: Faction.Empire,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank
    },
    Werewolf: {
        name: CharacterNames.Werewolf,
        cover: CharacterSource.Werewolf,
        attack: 7,
        health: 6,
        faction: Faction.Empire,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior
    },
    Zeus: {
        name: CharacterNames.Zeus,
        cover: CharacterSource.Zeus,
        attack: 9,
        health: 8,
        faction: Faction.Empire,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage
    },
    Zombie: {
        name: CharacterNames.Zombie,
        cover: CharacterSource.Zombie,
        attack: 5,
        health: 9,
        faction: Faction.Forest,
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

// Helper function to get initial health from character data
export const getInitialHealth = (card: Card): number => {
    const characterData = Object.values(CharacterList).find(char =>
        char.name === card.Name.replace(/^Leader /, "") // Remove "Leader " prefix if present
    );
    if (characterData) {
        // If it's a leader card, add the leader bonus
        return card.Name.includes("Leader") ? characterData.health + 5 : characterData.health;
    }
    // Fallback: assume current health is initial health
    return card.Health;
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