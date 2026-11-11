import { CharacterList, Characters } from "@/shared/constants";
import { EffectType, SkillConfig, SkillTiming, TargetType } from "@/shared/interfaces/skillInterfaces";
import { BaseSkill } from "./BaseSkill";
import { GenericSkill } from "./GenericSkill";

export class SkillFactory {
    private static skillConfigs: Map<string, SkillConfig> = new Map([
        [Characters.Aerwyn, {
            name: "Evasion 🌪️",
            description: "Like a whisper in the wind, she dances away from danger. 25% chance to dodge attacks.",
            triggerTiming: SkillTiming.Passive,
            effects: [
                { type: EffectType.Dodge, target: TargetType.Self, chance: 0.25 }
            ]
        }],

        [Characters.Alien, {
            name: "Stealth Mode 💨",
            description: "Advanced alien technology bends light around its form. Becomes invisible for 1 turn after taking damage.",
            triggerTiming: SkillTiming.OnDamageReceived,
            effects: [
                { type: EffectType.Invisible, target: TargetType.Self, duration: 1 }
            ]
        }],

        [Characters.Archangel, {
            name: "Divine Healing ✨",
            description: "Celestial light flows through wounded allies, mending their pain. Heals lowest HP ally for 50% of damage dealt.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Heal, target: TargetType.LowestHpAlly, value: 0.5 }
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
            description: "Elven arrows find their mark through any defense. Ignores all damage reduction effects.",
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

        [Characters.Ghost, {
            name: "Last Breath 👻",
            description: "A tormented soul finds peace in its final act of devotion. Restores 1 health to Reaper when defeated.",
            triggerTiming: SkillTiming.OnDeath,
            effects: [
                { type: EffectType.Heal, target: CharacterList.Reaper, value: 1 }
            ]
        }],

        [Characters.Gunslinger, {
            name: "Hunter's Mark 🎯",
            description: "A skilled marksman never loses sight of their prey. Marks enemy to take 50% more damage for 1 turn.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Mark, target: TargetType.Enemy, duration: 1, value: 1.5 }
            ]
        }],

        [Characters.Herbalist, {
            name: "Nature's Blessing 🌿",
            description: "The whispers of the forest rejuvenate allies. Restores 1 health to lowest HP ally each turn.",
            triggerTiming: SkillTiming.StartOfTurn,
            effects: [
                { type: EffectType.Heal, target: TargetType.LowestHpAlly, value: 1 }
            ]
        }],

        [Characters.Illusionist, {
            name: "Reality Swap 🎭",
            description: "With a theatrical flourish, the impossible becomes possible. Swaps enemy's health and attack (once per game).",
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
            description: "Protects a random non-leader ally at turn start and shares damage 50/50.",
            triggerTiming: SkillTiming.StartOfTurn,
            effects: [
                { type: EffectType.Protection, target: TargetType.RandomAlly, duration: 1 }
            ]
        }],

        [Characters.Lich, {
            name: "Frost Prison ❄️",
            description: "Death's cold embrace paralyzes even the bravest souls. Freezes enemy for 1 turn, cannot attack.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Freeze, target: TargetType.Enemy, duration: 1 }
            ]
        }],

        [Characters.Necromancer, {
            name: "Raise Dead 🧟‍♂️",
            description: "Bends the forces of life and death. Revives a random dead ally once.",
            triggerTiming: SkillTiming.OnKill,
            once: true,
            effects: [
                { type: EffectType.SummonDeadAlly, target: TargetType.RandomDeadAlly }
            ]
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
            description: "The scorpion's tail strikes with deadly precision. Poisoning the enemy for 1 damage each turn.",
            triggerTiming: SkillTiming.AfterAttack,
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
            description: "The shaman's connection to the spirit world allows it to share its strength. Buffs a random ally for 1 health and 1 attack.",
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
            description: "Every drop of spilled blood flows back to strengthen the undead. Heals for 50% of damage dealt.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.LifeSteal, target: TargetType.Self, value: 0.5 }
            ]
        }],

        [Characters.Zombie, {
            name: "Zombify ☠️",
            description: "The curse of undeath spreads through a single infectious bite. Turns enemy into zombie for 1 turn, silences skills.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Zombify, target: TargetType.Enemy, duration: 1 }
            ]
        }]
    ]);

    public static createSkill(cardName: string): BaseSkill | null {
        const config = this.skillConfigs.get(cardName);
        return config ? new GenericSkill(config) : null;
    }
}
