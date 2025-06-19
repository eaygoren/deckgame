import { Card, Color, Faction, Rarity, Class } from "../game/Card";
import { Player } from "../game/Player";
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
    Mage: "Mage",
    Ra: "Ra",
    Samurai: "Samurai",
    Siren: "Siren",
    Vampire: "Vampire",
    Werewolf: "Werewolf",
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
    Mage: "mage",
    Ra: "ra",
    Siren: "siren",
    Samurai: "samurai",
    Vampire: "vampire",
    Werewolf: "werewolf",
    Zombie: "zombie",
}

export const CharacterList = {
    Aerwyn: {
        name: CharacterNames.Aerwyn,
        cover: CharacterSource.Aerwyn,
        attack: 6,
        health: 8,
        faction: Faction.Forest,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        class: Class.Ranged,
    },
    Assassin: {
        name: CharacterNames.Assassin,
        cover: CharacterSource.Assassin,
        attack: 8,
        health: 5,
        faction: Faction.Empire,
        rarity: Rarity.Common,
        color: Color.Common,
        class: Class.Melee,
    },
    Cerberus: {
        name: CharacterNames.Cerberus,
        cover: CharacterSource.Cerberus,
        attack: 6,
        health: 7,
        faction: Faction.Forest,
        rarity: Rarity.Rare,
        color: Color.Rare,
        class: Class.Melee,
    },
    Dragon: {
        name: CharacterNames.Dragon,
        cover: CharacterSource.Dragon,
        attack: 7, // Reduced from 9 (ranged penalty)
        health: 4, // Reduced from 6 (ranged penalty)
        faction: Faction.Forest,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        class: Class.Ranged,
    },
    Elf: {
        name: CharacterNames.Elf,
        cover: CharacterSource.Elf,
        attack: 3, // Reduced from 4 (ranged penalty)
        health: 7, // Reduced from 9 (ranged penalty)
        faction: Faction.Empire,
        rarity: Rarity.Common,
        color: Color.Common,
        class: Class.Ranged,
    },
    Ent: {
        name: CharacterNames.Ent,
        cover: CharacterSource.Ent,
        attack: 4,
        health: 10,
        faction: Faction.Forest,
        rarity: Rarity.Common,
        color: Color.Common,
        class: Class.Melee,
    },
    Ixelis: {
        name: CharacterNames.Ixelis,
        cover: CharacterSource.Ixelis,
        attack: 8,
        health: 6,
        faction: Faction.Forest,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        class: Class.Ranged,
    },
    Knight: {
        name: CharacterNames.Knight,
        cover: CharacterSource.Knight,
        attack: 5,
        health: 10,
        faction: Faction.Empire,
        rarity: Rarity.Common,
        color: Color.Common,
        class: Class.Melee,
    },
    Mage: {
        name: CharacterNames.Mage,
        cover: CharacterSource.Mage,
        attack: 5, // Reduced from 7 (ranged penalty)
        health: 6, // Reduced from 8 (ranged penalty)
        faction: Faction.Forest,
        rarity: Rarity.Rare,
        color: Color.Rare,
        class: Class.Ranged,
    },
    Ra: {
        name: CharacterNames.Ra,
        cover: CharacterSource.Ra,
        attack: 10,
        health: 5,
        faction: Faction.Empire,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        class: Class.Melee,
    },
    Samurai: {
        name: CharacterNames.Samurai,
        cover: CharacterSource.Samurai,
        attack: 8,
        health: 9,
        faction: Faction.Empire,
        rarity: Rarity.Rare,
        color: Color.Rare,
        class: Class.Melee,
    },
    Siren: {
        name: CharacterNames.Siren,
        cover: CharacterSource.Siren,
        attack: 4, // Reduced from 6 (ranged penalty)
        health: 6, // Reduced from 8 (ranged penalty)
        faction: Faction.Forest,
        rarity: Rarity.Rare,
        color: Color.Rare,
        class: Class.Ranged,
    },
    Vampire: {
        name: CharacterNames.Vampire,
        cover: CharacterSource.Vampire,
        attack: 8,
        health: 7,
        faction: Faction.Empire,
        rarity: Rarity.Common,
        color: Color.Common,
        class: Class.Melee,
    },
    Werewolf: {
        name: CharacterNames.Werewolf,
        cover: CharacterSource.Werewolf,
        attack: 7,
        health: 6,
        faction: Faction.Empire,
        rarity: Rarity.Common,
        color: Color.Common,
        class: Class.Melee,
    },
    Zombie: {
        name: CharacterNames.Zombie,
        cover: CharacterSource.Zombie,
        attack: 5,
        health: 9,
        faction: Faction.Forest,
        rarity: Rarity.Rare,
        color: Color.Rare,
        class: Class.Melee,
    },
}

export const CommonDeathAbility: IAbility = {
    name: "Death Transfer",
    description: "When this card death, transfer 20% of its attack to a random card in your hand.",
    activate(card: Card, owner: Player) {
        if (owner.hand.length > 0) {
            const randomCard = owner.hand[Math.floor(Math.random() * owner.hand.length)];
            randomCard.Attack += Math.floor(card.Attack * 0.2);
        }
    },
};

export const LegendaryEntryAbility: IAbility = {
    name: "Legendary Entry",
    description: "When this card enters the game, increase all cards' health in your hand by 50% of this card's health.",
    activate(card: Card, owner: Player) {
        owner.hand.forEach((c: Card) => {
            c.Health += Math.floor(card.Health * 0.5);
        });
    },
};

export const LeaderBoostAbility: IAbility = {
    name: "Leader Boost",
    description: "Increase all your team members' stats by 1.",
    activate(card: Card, owner: Player) {
        owner.hand.forEach((c: Card) => {
            if (c !== card) {
                c.Attack += 1;
                c.Health += 1;
            }
        });
    },
};

export const Environment = {
    crown: "crown",
    melee: "melee",
    ranged: "ranged",
}