import { Card, Color, Faction, Rarity } from "../game/Card";
import { Player } from "../game/Player";
import { Ability } from "./interfaces";

export const CharacterNames = {
    Assassin: "Assassin",
    Cerberus: "Cerberus",
    Dragon: "Dragon",
    Elf: "Elf",
    Knight: "Knight",
    Mage: "Mage",
    Ra: "Ra",
    Siren: "Siren",
    Werewolf: "Werewolf",
    Vampire: "Vampire",
    Zombie: "Zombie",
}

export const CharacterSource = {
    Assassin: "assassin",
    Cerberus: "cerberus",
    Dragon: "dragon",
    Elf: "elf",
    Knight: "knight",
    Mage: "mage",
    Ra: "ra",
    Siren: "siren",
    Werewolf: "werewolf",
    Vampire: "vampire",
    Zombie: "zombie",
}

export const CharacterList = {
    Assassin: {
        name: CharacterNames.Assassin,
        cover: CharacterSource.Assassin,
        attack: 8,
        health: 5,
        faction: Faction.Empire,
        rarity: Rarity.Common,
        color: Color.Common,
    },
    Cerberus: {
        name: CharacterNames.Cerberus,
        cover: CharacterSource.Cerberus,
        attack: 6,
        health: 7,
        faction: Faction.Forest,
        rarity: Rarity.Rare,
        color: Color.Rare,
    },
    Dragon: {
        name: CharacterNames.Dragon,
        cover: CharacterSource.Dragon,
        attack: 9,
        health: 6,
        faction: Faction.Forest,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
    },
    Elf: {
        name: CharacterNames.Elf,
        cover: CharacterSource.Elf,
        attack: 4,
        health: 9,
        faction: Faction.Empire,
        rarity: Rarity.Common,
        color: Color.Common,
    },
    Knight: {
        name: CharacterNames.Knight,
        cover: CharacterSource.Knight,
        attack: 5,
        health: 10,
        faction: Faction.Empire,
        rarity: Rarity.Common,
        color: Color.Common,
    },
    Mage: {
        name: CharacterNames.Mage,
        cover: CharacterSource.Mage,
        attack: 7,
        health: 8,
        faction: Faction.Forest,
        rarity: Rarity.Rare,
        color: Color.Rare,
    },
    Ra: {
        name: CharacterNames.Ra,
        cover: CharacterSource.Ra,
        attack: 10,
        health: 5,
        faction: Faction.Empire,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
    },
    Siren: {
        name: CharacterNames.Siren,
        cover: CharacterSource.Siren,
        attack: 6,
        health: 8,
        faction: Faction.Forest,
        rarity: Rarity.Rare,
        color: Color.Rare,
    },
    Werewolf: {
        name: CharacterNames.Werewolf,
        cover: CharacterSource.Werewolf,
        attack: 7,
        health: 6,
        faction: Faction.Empire,
        rarity: Rarity.Common,
        color: Color.Common,
    },
    Vampire: {
        name: CharacterNames.Vampire,
        cover: CharacterSource.Vampire,
        attack: 8,
        health: 7,
        faction: Faction.Empire,
        rarity: Rarity.Common,
        color: Color.Common,
    },
    Zombie: {
        name: CharacterNames.Zombie,
        cover: CharacterSource.Zombie,
        attack: 5,
        health: 9,
        faction: Faction.Forest,
        rarity: Rarity.Rare,
        color: Color.Rare,
    },
}

export const CommonDeathAbility: Ability = {
    name: "Death Transfer",
    description: "When this card death, transfer 20% of its attack to a random card in your hand.",
    activate(card: Card, owner: Player) {
        if (owner.hand.length > 0) {
            const randomCard = owner.hand[Math.floor(Math.random() * owner.hand.length)];
            randomCard.Attack += Math.floor(card.Attack * 0.2);
        }
    },
};

export const LegendaryEntryAbility: Ability = {
    name: "Legendary Entry",
    description: "When this card enters the game, increase all cards' health in your hand by 50% of this card's health.",
    activate(card: Card, owner: Player) {
        owner.hand.forEach((c: Card) => {
            c.Health += Math.floor(card.Health * 0.5);
        });
    },
};

export const LeaderBoostAbility: Ability = {
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
}