import { CharacterList, Characters } from "@/shared/constants";
import { EffectType, SkillConfig, SkillTiming, TargetType } from "@/shared/interfaces/skillInterfaces";
import { BaseSkill } from "./BaseSkill";
import { GenericSkill } from "./GenericSkill";

export class SkillFactory {
    private static skillConfigs: Map<string, SkillConfig> = new Map([
        [Characters.Aerwyn, {
            name: "Evasion 🌪️",
            description: "Like a whisper in the wind, she dances away from danger. Has a 25% chance to dodge an attack, including Arcane Blast, and fire a ranged counterattack. Piercing Shot bypasses Evasion.",
            triggerTiming: SkillTiming.Passive,
            effects: [
                { type: EffectType.Dodge, target: TargetType.Self, chance: 0.25, counterOnDodge: true }
            ]
        }],

        [Characters.Alien, {
            name: "Stealth Mode 💨",
            description: "Advanced alien technology bends light around its form. After surviving damage, becomes untargetable through the end of the next enemy turn and takes no counter damage. Enemies can target Alien if he is the last non-leader or if only Alien and an active Luxen guard the leader against ranged attackers with no available melee ally.",
            triggerTiming: SkillTiming.OnDamageReceived,
            effects: [
                { type: EffectType.Invisible, target: TargetType.Self, duration: 1 }
            ]
        }],

        [Characters.Archangel, {
            name: "Divine Healing ✨",
            description: "Celestial light flows through wounded allies, mending their pain. After attacking, heals the other ally with the lowest current HP for half of Archangel’s current attack, even if Archangel dies to the counterattack.",
            triggerTiming: SkillTiming.AfterAttack,
            persistsAfterDeath: true,
            effects: [
                { type: EffectType.Heal, target: TargetType.LowestHpAlly, value: 0.5, useCasterAttack: true, excludeCaster: true }
            ]
        }],

        [Characters.Assassin, {
            name: "Enhanced Critical 🔪",
            description: "Years of training have honed deadly precision to perfection. Doubles critical chance, 25% counter-crit chance.",
            triggerTiming: SkillTiming.Passive,
            effects: [
                { type: EffectType.CritBoost, target: TargetType.Self, value: 2, chance: 0.25 }
            ]
        }],

        [Characters.Dragon, {
            name: "Dragon Fire 🔥",
            description: "Ancient flames burn with the fury of a thousand suns. Burns enemy for 1 damage and reduces attack by 50% for 1 turn.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Burn, target: TargetType.Enemy, duration: 1, value: 1 },
                { type: EffectType.AttackReduction, target: TargetType.Enemy, duration: 1, value: 0.5 }
            ]
        }],

        [Characters.Elf, {
            name: "Piercing Shot 🏹",
            description: "Elven arrows find their mark through any defense. Attacks bypass dodges, damage reduction, and damage sharing.",
            triggerTiming: SkillTiming.Passive,
            effects: [
                { type: EffectType.IgnoreDefense, target: TargetType.Self }
            ]
        }],

        [Characters.Ent, {
            name: "Provoke 💢",
            description: "The ancient guardian's roar echoes through the battlefield. Forces enemy to only attack Ent for 1 turn.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Taunt, target: TargetType.Enemy, duration: 1 }
            ]
        }],

        [Characters.Ganesha, {
            name: "Purifying Grace",
            description: "With a quiet blessing, Ganesha lifts the burdens of battle. After spending an enemy turn on the battlefield, cleanses all negative effects from one random affected ally, including himself or the leader, before other friendly turn-start skills. Cleanses Infection while the countdown is active.",
            triggerTiming: SkillTiming.StartOfTurn,
            effects: [{ type: EffectType.Cleanse, target: TargetType.RandomAlly }]
        }],

        [Characters.Ghost, {
            name: "Last Breath 👻",
            description: "A tormented soul finds peace in its final act of devotion. Gives a living allied Reaper 1 health on death, even above maximum health.",
            triggerTiming: SkillTiming.OnDeath,
            effects: [
                { type: EffectType.Heal, target: CharacterList.Reaper, value: 1, allowOverheal: true }
            ]
        }],

        [Characters.Gunslinger, {
            name: "Hunter's Mark 🎯",
            description: "A skilled marksman never loses sight of their prey. Marks the enemy to take 50% more damage from normal attacks until the end of the Gunslinger’s side’s next turn.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Mark, target: TargetType.Enemy, duration: 1, value: 1.5 }
            ]
        }],

        [Characters.Herbalist, {
            name: "Nature's Blessing 🌿",
            description: "The whispers of the forest rejuvenate allies. After spending an enemy turn on the battlefield, heals the lowest-health ally for 1 at the start of each friendly turn.",
            triggerTiming: SkillTiming.StartOfTurn,
            effects: [
                { type: EffectType.Heal, target: TargetType.LowestHpAlly, value: 1 }
            ]
        }],

        [Characters.Illusionist, {
            name: "Reality Swap 🎭",
            description: "With a theatrical flourish, the impossible becomes possible. Once per match, before attacking, swaps the target’s displayed attack and current HP.",
            triggerTiming: SkillTiming.BeforeAttack,
            once: true,
            effects: [
                { type: EffectType.StatSwap, target: TargetType.Enemy }
            ]
        }],

        [Characters.Joker, {
            name: "Copycat 🃏",
            description: "The ultimate mimic adapts to any situation with a grin. Copies enemy's attack if it's higher.",
            triggerTiming: SkillTiming.BeforeAttack,
            effects: [
                { type: EffectType.AttackCopy, target: TargetType.Self }
            ]
        }],

        [Characters.Knight, { //TODO bazı hatalar var
            name: "Guardian Shield 🛡️",
            description: "His shield stands between a comrade and the killing blow. At the start of his turn, guards a random ally other than the leader. Knight absorbs up to half the incoming damage, capped by his remaining HP. The ally takes the rest.",
            triggerTiming: SkillTiming.StartOfTurn,
            effects: [
                { type: EffectType.Protection, target: TargetType.RandomAlly, duration: 1 }
            ]
        }],

        [Characters.Lich, {
            name: "Frost Prison ❄️",
            description: "Death's cold embrace paralyzes even the bravest souls. After attack and counterattack damage resolve, freezes the target for one turn. A frozen card cannot attack or counterattack.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Freeze, target: TargetType.Enemy, duration: 1 }
            ]
        }],

        [Characters.Luxen, {
            name: "Veil of Light",
            description: "Distant arrows vanish in Luxen's light. Ranged enemies cannot target Luxen unless Luxen is silenced or is the last non-leader on his side and no enemy melee card can attack him.",
            triggerTiming: SkillTiming.Passive,
            effects: [{ type: EffectType.RangedTargetImmunity, target: TargetType.Self }]
        }],

        [Characters.Mimic, {
            name: "Borrowed Power",
            description: "Behind each borrowed face, another power stirs. On a hit, copies an enemy skill that triggers before an attack, after an attack, or on a kill. It triggers automatically when its conditions are met on Mimic’s next normal attack and expires at the end of that turn.",
            triggerTiming: SkillTiming.Passive,
            effects: [{ type: EffectType.SkillCopy, target: TargetType.Self }]
        }],

        [Characters.Necromancer, {
            name: "Raise Dead 🧟‍♂️",
            description: "The grave yields when the necromancer calls. Once per match, after a kill, returns a random fallen ally to the deck with 1 HP and resets its skill usage for the turn.",
            triggerTiming: SkillTiming.OnKill,
            once: true,
            effects: [
                { type: EffectType.SummonDeadAlly, target: TargetType.RandomDeadAlly }
            ]
        }],

        [Characters.Ninja, {
            name: "Shadow Flurry",
            description: "One shadow strikes before the last has faded. Each critical hit during Ninja's attack triggers another attack on the same target. The chain ends when a hit fails to crit, misses, or defeats the target.",
            triggerTiming: SkillTiming.Passive,
            effects: [{ type: EffectType.CriticalFollowUp, target: TargetType.Self }]
        }],

        [Characters.Phoenix, {
            name: "Ashes to Life",
            description: "Even the ashes remember how to fly. Once per match, lethal damage turns Phoenix into a targetable egg. The egg cannot attack or counterattack. If it survives two of its team's turns, Phoenix returns.",
            triggerTiming: SkillTiming.Passive,
            effects: [{ type: EffectType.PhoenixRebirth, target: TargetType.Self }]
        }],

        [Characters.Reaper, {
            name: "Soul Harvest 👻",
            description: "Reaps the souls of the fallen. Adds ghost to deck when killing an enemy.",
            triggerTiming: SkillTiming.OnKill,
            effects: [
                { type: EffectType.SummonAlly, target: TargetType.None, summon: CharacterList.Ghost }
            ]
        }],

        [Characters.Samurai, {
            name: "Bleeding Strike 🩸",
            description: "His sharp katana cuts through anything that stands before him. Causes enemy to bleed for 1 damage next 2 turns.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Bleed, target: TargetType.Enemy, duration: 2, value: 1 }
            ]
        }],

        [Characters.Scorpion, {
            name: "Venomous Strike 🦂",
            description: "The scorpion’s venom outlives the sting. After attacking, poisons the target even if Scorpion dies to the counterattack. Poison deals 1 damage each turn, lasts indefinitely, and cannot be reapplied while active.",
            triggerTiming: SkillTiming.AfterAttack,
            persistsAfterDeath: true,
            effects: [
                { type: EffectType.Poison, target: TargetType.Enemy, duration: Number.POSITIVE_INFINITY, value: 1 }
            ]
        }],

        // [Characters.Shadow, {
        //     name: "Cloak of Shadows 🖤",
        //     description: "The shadowy figure melds into the darkness, becoming untargetable for 1 turn.",
        //     triggerTiming: SkillTiming.BeforeAttack,
        //     effects: [
        //         { type: EffectType.Invisible, target: TargetType.Self, duration: 1 }
        //     ]
        // }],

        [Characters.Shaman, {
            name: "Spirit Link 🌌",
            description: "The shaman draws strength from the spirit world. After attacking, permanently grants another random ally +1 current HP, +1 max HP, and +1 attack.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Buff, target: TargetType.RandomAlly, value: 1 }
            ]
        }],

        [Characters.Siren, {
            name: "Silence Song 🎶",
            description: "Her haunting melody weaves spells that steal away voices. Silences enemy for 1 turn, cannot use skills.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Silence, target: TargetType.Enemy, duration: 1 }
            ]
        }],

        [Characters.Vampire, {
            name: "Life Drain 🩸",
            description: "Every drop of spilled blood flows back to strengthen the undead. If Vampire survives its attack, it heals for half of its current attack.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.LifeSteal, target: TargetType.Self, value: 0.5, useCasterAttack: true }
            ]
        }],

        [Characters.Void, {
            name: "Nullifying Strike",
            description: "The void swallows every borrowed strength. After a hit, removes the surviving target's stat buffs and prevents healing and new stat buffs until cleansed.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [{ type: EffectType.VoidLock, target: TargetType.Enemy }]
        }],

        [Characters.Wukong, {
            name: "Stoneborn Fury 🐒",
            description: "Arrows splinter against the stone that bore him, and every wound stokes his fury. Wukong is both a Tank and a Warrior.",
            triggerTiming: SkillTiming.Passive,
            effects: [
                { type: EffectType.IronWall, target: TargetType.Self }
            ]
        }],

        [Characters.Zombie, {
            name: "Zombify ☠️",
            description: "The rot takes root with a single strike. After attacking, infects the target for two of its turns. The target keeps its abilities until it permanently takes Zombie’s class and attack type, with half Zombie’s base attack and HP and all abilities disabled. Leaders and Zombies are immune.",
            triggerTiming: SkillTiming.AfterAttack,
            persistsAfterDeath: true,
            effects: [
                { type: EffectType.Zombify, target: TargetType.Enemy, duration: 2 }
            ]
        }]
    ]);

    public static createSkill(cardName: string): BaseSkill | null {
        const config = this.skillConfigs.get(cardName);
        return config ? new GenericSkill(config) : null;
    }
}
