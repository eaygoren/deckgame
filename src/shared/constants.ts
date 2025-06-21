import { Card, Color, Faction, Rarity, AttackType } from "../game/Card";
import { Player } from "../game/Player";
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
    description: "After attacking, deal 50% base damage to one random opponent (except leader).",
    activate(_card: Card, _owner: Player) {
        // General activate method - not used for combat
    },
    onPostAttack(attacker: Card, defender: Card, game: any) {
        // IMPORTANT: Only apply if the attacker is actually a Mage
        if (attacker.ClassType !== ClassType.Mage) {
            console.log(`ERROR: MageAbility called for non-Mage card: ${attacker.Name} (ClassType: ${attacker.ClassType})`);
            return;
        }

        // Arcane Blast: After attacking, deal 50% base damage to one random opponent (except leader)
        const randomTarget = game.getRandomOpponentTarget(attacker);
        if (randomTarget) {
            const mageDamage = Math.floor(attacker.Attack * 0.5);
            randomTarget.Health = Math.max(0, randomTarget.Health - mageDamage);
            console.log(`${attacker.Name}'s Arcane Blast hits ${randomTarget.Name} for ${mageDamage} damage!`); // Find the target's view and show ability message and damage
            const targetView = game._player.hand.includes(randomTarget)
                ? game._playerCardViews.find((view: any) => view.card.Id === randomTarget.Id)
                : game._botCardViews.find((view: any) => view.card.Id === randomTarget.Id);

            if (targetView && !targetView.destroyed && targetView.parent) {
                game.showAbilityMessage(targetView.x, targetView.y, "Arcane Blast!", 0x9966ff);
                setTimeout(() => {
                    game.showDamageAnimation(targetView, mageDamage, () => {
                        if (targetView && !targetView.destroyed) {
                            targetView.update();
                        }
                    });
                }, 500);
            }
        }
    }
};

export const RogueAbility: IAbility = {
    name: "Critical Strike",
    description: "25% chance to deal double damage on attack.",
    activate(_card: Card, _owner: Player) {
        // General activate method - not used for combat
    },
    modifyAttackDamage(attacker: Card, _defender: Card, baseDamage: number, gameInstance?: any): number {
        // Debug: Check if this ability is being called for the right card
        console.log(`RogueAbility.modifyAttackDamage called for: ${attacker.Name} (ID: ${attacker.Id}, ClassType: ${attacker.ClassType})`);

        // IMPORTANT: Only apply if the attacker is actually a Rogue
        if (attacker.ClassType !== ClassType.Rogue) {
            console.log(`ERROR: RogueAbility called for non-Rogue card: ${attacker.Name} (ClassType: ${attacker.ClassType})`);
            return baseDamage;
        }

        // Critical Strike: 25% chance to deal double damage
        const critChance = Math.random(); if (critChance <= 0.25) {
            console.log(`${attacker.Name} (ID: ${attacker.Id}) landed a critical strike!`); // Show critical strike message if game instance is available
            if (gameInstance) {
                // Find the exact attacker view by comparing card IDs (more reliable than card references)
                let attackerView = null;

                // Debug: List all available cards
                console.log("Player cards:", gameInstance._playerCardViews.map((v: any) => `${v.card.Name} (ID: ${v.card.Id})`));
                console.log("Bot cards:", gameInstance._botCardViews.map((v: any) => `${v.card.Name} (ID: ${v.card.Id})`));
                console.log("Looking for attacker:", attacker.Name, "with ID:", attacker.Id);

                // First check player cards
                const playerView = gameInstance._playerCardViews.find((view: any) => view.card.Id === attacker.Id);
                if (playerView) {
                    attackerView = playerView;
                    console.log("Found attacker in player cards:", playerView.card.Name);
                } else {
                    // Then check bot cards
                    const botView = gameInstance._botCardViews.find((view: any) => view.card.Id === attacker.Id);
                    if (botView) {
                        attackerView = botView;
                        console.log("Found attacker in bot cards:", botView.card.Name);
                    } else {
                        console.log("ERROR: Could not find attacker view!");
                    }
                }

                if (attackerView && !attackerView.destroyed && attackerView.parent) {
                    console.log("Showing critical strike message on:", attackerView.card.Name, "at position:", attackerView.x, attackerView.y);
                    gameInstance.showAbilityMessage(attackerView.x, attackerView.y, "Critical Strike!", 0xff0000);
                } else {
                    console.log("Cannot show message - view not available or destroyed");
                }
            }

            return Math.floor(baseDamage * 2);
        }
        return baseDamage;
    }
};

export const TankAbility: IAbility = {
    name: "Iron Wall",
    description: "Take 50% less damage from ranged attacks.",
    activate(_card: Card, _owner: Player) {
        // General activate method - not used for combat
    },
    modifyDefenseDamage(attacker: Card, defender: Card, baseDamage: number, gameInstance?: any): number {
        // IMPORTANT: Only apply if the defender is actually a Tank
        if (defender.ClassType !== ClassType.Tank) {
            console.log(`ERROR: TankAbility called for non-Tank card: ${defender.Name} (ClassType: ${defender.ClassType})`);
            return baseDamage;
        }

        // Iron Wall: Take 50% less damage from ranged attacks
        if (attacker.AttackType === AttackType.Ranged) {
            console.log(`${defender.Name}'s Iron Wall reduces ranged damage!`);// Show tank ability message if game instance is available
            if (gameInstance) {
                const defenderView = gameInstance._player.hand.includes(defender)
                    ? gameInstance._playerCardViews.find((view: any) => view.card.Id === defender.Id)
                    : gameInstance._botCardViews.find((view: any) => view.card.Id === defender.Id);

                if (defenderView && !defenderView.destroyed && defenderView.parent) {
                    gameInstance.showAbilityMessage(defenderView.x, defenderView.y, "Iron Wall!", 0x00ccff);
                }
            }

            return Math.floor(baseDamage * 0.5);
        }
        return baseDamage;
    }
};

export const WarriorAbility: IAbility = {
    name: "Berserker Rage",
    description: "Permanently gain 50% more attack when health drops below 50%.",
    activate(_card: Card, _owner: Player) {
        // General activate method - not used for combat
    },
    // Warrior ability is handled differently - it permanently modifies attack stat
    // when health drops below 50%, not during damage calculation
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

export const Environment = {
    crown: "crown",
    melee: "melee",
    ranged: "ranged",
}