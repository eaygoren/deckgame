import { CharacterList, Characters } from "@/shared/constants";
import { EffectType, SkillConfig, SkillTiming, TargetType } from "@/shared/interfaces/skillInterfaces";
import { BaseSkill } from "./BaseSkill";
import { GenericSkill } from "./GenericSkill";

export class SkillFactory {
    private static skillConfigs: Map<string, SkillConfig> = new Map([
        [Characters.Aerwyn, {
            name: "Evasion",
            description: "Like a whisper in the wind, she dances away from danger. Has a 25% chance to dodge an attack, including Arcane Blast, and fire a ranged counterattack.",
            triggerTiming: SkillTiming.Passive,
            effects: [
                { type: EffectType.Dodge, target: TargetType.Self, chance: 0.25, counterOnDodge: true }
            ]
        }],

        [Characters.Alien, {
            name: "Stealth Mode",
            description: "Advanced alien technology bends light around its form. After surviving damage, gains [[invisible]] through the enemy turn and until the end of the friendly turn that follows. Enemies can still target Alien if his only remaining ally is the leader or if none of his other non-leader allies can be targeted.",
            triggerTiming: SkillTiming.OnDamageReceived,
            effects: [
                { type: EffectType.Invisible, target: TargetType.Self, duration: 1 }
            ]
        }],

        [Characters.Archangel, {
            name: "Divine Healing",
            description: "Celestial light flows through wounded allies, mending their pain. After attacking, heals the other ally with the lowest current HP for half of Archangel’s current attack, even if Archangel dies to the counterattack.",
            triggerTiming: SkillTiming.AfterAttack,
            persistsAfterDeath: true,
            effects: [
                { type: EffectType.Heal, target: TargetType.LowestHpAlly, value: 0.5, useCasterAttack: true, excludeCaster: true }
            ]
        }],

        [Characters.Archmage, {
            name: "Timeweave",
            description: "With a twist of his fingers, old wounds linger and distant curses draw near. After each normal attack that hits a surviving target, extends all of its timed [[bleed]], [[burn]], [[poison]], [[mark]], and [[thunder_mark]] effects by one turn. Shortens [[zombify_pending]] by one turn and triggers the transformation immediately if it reaches zero.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [{ type: EffectType.Timeweave, target: TargetType.Enemy }]
        }],

        [Characters.Assassin, {
            name: "Enhanced Critical",
            description: "Years of training have honed deadly precision to perfection. Doubles critical chance, 25% counter-crit chance.",
            triggerTiming: SkillTiming.Passive,
            effects: [
                { type: EffectType.CritBoost, target: TargetType.Self, value: 2, chance: 0.25 }
            ]
        }],

        [Characters.Banshee, {
            name: "Dread Wail",
            description: "In her wail, the living hear the echo of their own funeral bells. When Banshee's normal attack or Arcane Blast damages a surviving enemy, applies [[fear]] until the end of that enemy's next turn.",
            triggerTiming: SkillTiming.AfterAttack,
            triggersOnArcaneBlast: true,
            effects: [{ type: EffectType.Fear, target: TargetType.Enemy }]
        }],

        [Characters.Cerberus, {
            name: "Threefold Bite",
            description: "Three jaws stand watch at the gates of the dead. This card has one active head at 1–2 HP, two at 3–4 HP, and three at 5 HP or more. If it survives its normal attack, each extra head bites a different random enemy unit other than the primary target or leader for 1 damage, without provoking a counterattack. When counterattacking, each extra head adds 1 damage against the attacker, based on HP after the incoming hit.",
            triggerTiming: SkillTiming.Passive,
            effects: [{ type: EffectType.ThreeHeads, target: TargetType.Self }]
        }],

        [Characters.Dragon, {
            name: "Dragon Fire",
            description: "Ancient flames burn with the fury of a thousand suns. After attacking, applies [[burn]] and [[attack_reduction]] to the target for one turn.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Burn, target: TargetType.Enemy, duration: 1, value: 1 },
                { type: EffectType.AttackReduction, target: TargetType.Enemy, duration: 1, value: 0.5 }
            ]
        }],

        [Characters.Elf, {
            name: "Piercing Shot",
            description: "Elven arrows find their mark through any defense. Attacks bypass dodges, damage reduction, and damage sharing.",
            triggerTiming: SkillTiming.Passive,
            effects: [
                { type: EffectType.IgnoreDefense, target: TargetType.Self }
            ]
        }],

        [Characters.Ent, {
            name: "Provoke",
            description: "The ancient guardian's roar echoes through the battlefield. After attacking, applies [[taunt]] to the target for one turn.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Taunt, target: TargetType.Enemy, duration: 1 }
            ]
        }],

        [Characters.Ganesha, {
            name: "Purifying Grace",
            description: "With a quiet blessing, Ganesha lifts the burdens of battle. At the start of your turn, cleanses one random ally with a negative effect, including [[zombify_pending]], and grants them [[debuff_immunity]] until the end of the next enemy turn. If no ally needs cleansing, grants immunity to one random living non-leader ally. Triggers before other friendly turn-start skills. If Ganesha enters at the start of your turn, this ability starts on your next turn.",
            triggerTiming: SkillTiming.StartOfTurn,
            effects: [{ type: EffectType.Cleanse, target: TargetType.RandomAlly, duration: 1 }]
        }],

        [Characters.Ghost, {
            name: "Last Breath",
            description: "A tormented soul finds peace in its final act of devotion. Gives a living allied Reaper 1 health on death, even above maximum health.",
            triggerTiming: SkillTiming.OnDeath,
            effects: [
                { type: EffectType.Heal, target: CharacterList.Reaper, value: 1, allowOverheal: true }
            ]
        }],

        [Characters.Gunslinger, {
            name: "Hunter's Mark",
            description: "A skilled marksman never loses sight of their prey. After attacking, applies [[mark]] to the target until the end of your next turn.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Mark, target: TargetType.Enemy, duration: 1, value: 1.5 }
            ]
        }],

        [Characters.Herbalist, {
            name: "Nature's Blessing",
            description: "The whispers of the forest rejuvenate allies. After spending an enemy turn on the battlefield, heals the lowest-health ally for 1 at the start of each friendly turn.",
            triggerTiming: SkillTiming.StartOfTurn,
            effects: [
                { type: EffectType.Heal, target: TargetType.LowestHpAlly, value: 1 }
            ]
        }],

        [Characters.Illusionist, {
            name: "Reality Swap",
            description: "With a theatrical flourish, the impossible becomes possible. Once per match, before attacking, swaps the target’s displayed attack and current HP.",
            triggerTiming: SkillTiming.BeforeAttack,
            once: true,
            effects: [
                { type: EffectType.StatSwap, target: TargetType.Enemy }
            ]
        }],

        [Characters.Joker, {
            name: "Copycat",
            description: "The ultimate mimic adapts to any situation with a grin. Copies enemy's attack if it's higher.",
            triggerTiming: SkillTiming.BeforeAttack,
            effects: [
                { type: EffectType.AttackCopy, target: TargetType.Self }
            ]
        }],

        [Characters.Knight, { //TODO bazı hatalar var
            name: "Guardian Shield",
            description: "His shield stands between a comrade and the killing blow. At the start of your turn, grants [[protection]] to a random ally other than the leader until the start of your next turn. If Knight enters at the start of your turn, this ability starts on your next turn.",
            triggerTiming: SkillTiming.StartOfTurn,
            effects: [
                { type: EffectType.Protection, target: TargetType.RandomAlly, duration: 1 }
            ]
        }],

        [Characters.Lich, {
            name: "Frost Prison",
            description: "Death's cold embrace paralyzes even the bravest souls. After attack and counterattack damage resolve, applies [[freeze]] to the target until the end of your next turn.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Freeze, target: TargetType.Enemy, duration: 1 }
            ]
        }],

        [Characters.Luxen, {
            name: "Veil of Light",
            description: "Distant arrows vanish in Luxen's light. Ranged enemies cannot target Luxen unless he is under [[silence]] or is the last non-leader on his side and no enemy melee card can attack him.",
            triggerTiming: SkillTiming.Passive,
            effects: [{ type: EffectType.RangedTargetImmunity, target: TargetType.Self }]
        }],

        [Characters.Mimic, {
            name: "Borrowed Power",
            description: "Behind each borrowed face, another power stirs. On a hit, gains a [[skill_copy]] from an enemy skill that triggers before an attack, after an attack, or on a kill. The copy expires after use or at the end of Mimic’s next turn.",
            triggerTiming: SkillTiming.Passive,
            effects: [{ type: EffectType.SkillCopy, target: TargetType.Self }]
        }],

        [Characters.Necromancer, {
            name: "Raise Dead",
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
            description: "Even the ashes remember how to fly. Once per match, lethal damage turns Phoenix into a targetable [[phoenix_egg]]. Phoenix returns if the egg survives through the end of its team’s second turn.",
            triggerTiming: SkillTiming.Passive,
            effects: [{ type: EffectType.PhoenixRebirth, target: TargetType.Self }]
        }],

        [Characters.Reaper, {
            name: "Soul Harvest",
            description: "Reaps the souls of the fallen. Adds ghost to deck when killing an enemy.",
            triggerTiming: SkillTiming.OnKill,
            effects: [
                { type: EffectType.SummonAlly, target: TargetType.None, summon: CharacterList.Ghost }
            ]
        }],

        [Characters.Samurai, {
            name: "Bleeding Strike",
            description: "His sharp katana cuts through anything that stands before him. After attacking, applies [[bleed]] to the target for two of its turns.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Bleed, target: TargetType.Enemy, duration: 2, value: 1 }
            ]
        }],

        [Characters.Scorpion, {
            name: "Venomous Strike",
            description: "The scorpion’s venom outlives the sting. After attacking, applies [[poison]] to the target indefinitely, even if Scorpion dies to the counterattack. The effect cannot be reapplied while active.",
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
            name: "Spirit Link",
            description: "The shaman draws strength from the spirit world. After attacking, permanently grants another random ally +1 current HP, +1 max HP, and +1 attack.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Buff, target: TargetType.RandomAlly, value: 1 }
            ]
        }],

        [Characters.Siren, {
            name: "Silence Song",
            description: "Her haunting melody weaves spells that steal away voices. After attacking, applies [[silence]] to the target for one turn.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Silence, target: TargetType.Enemy, duration: 1 }
            ]
        }],

        [Characters.Vampire, {
            name: "Life Drain",
            description: "Every drop of spilled blood flows back to strengthen the undead. If Vampire survives its attack, it heals for half of its current attack.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.LifeSteal, target: TargetType.Self, value: 0.5, useCasterAttack: true }
            ]
        }],

        [Characters.Void, {
            name: "Nullifying Strike",
            description: "The void swallows every borrowed strength. After a hit, removes the surviving target's stat buffs and applies [[void_lock]] until cleansed.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [{ type: EffectType.VoidLock, target: TargetType.Enemy }]
        }],

        [Characters.Werewolf, {
            name: "Last Hunt",
            description: "Even death must wait until the hunt is over. Once per match, a lethal counterattack during this card’s normal attack triggers [[last_hunt]] at 0 HP. While hunting, this card is immune to new debuffs and dies at the end of your next turn.",
            triggerTiming: SkillTiming.AfterAttack,
            once: true,
            persistsAfterDeath: true,
            effects: [{ type: EffectType.LastHunt, target: TargetType.Self }]
        }],

        [Characters.Wukong, {
            name: "Stoneborn Fury",
            description: "Arrows splinter against the stone that bore him, and every wound stokes his fury. Wukong is both a Tank and a Warrior.",
            triggerTiming: SkillTiming.Passive,
            effects: [
                { type: EffectType.IronWall, target: TargetType.Self }
            ]
        }],

        [Characters.Zeus, {
            name: "Thunder Mark",
            description: "The heavens remember where lightning strikes. If Zeus survives his normal attack and any Arcane Blast, lightning strikes a random living enemy, including the leader, and applies [[thunder_mark]] until the end of your next turn.",
            triggerTiming: SkillTiming.Passive,
            effects: [{ type: EffectType.ThunderMark, target: TargetType.RandomEnemy, duration: 2 }]
        }],

        [Characters.Zombie, {
            name: "Zombify",
            description: "The rot takes root with a single strike. After attacking, applies [[zombify_pending]] for two of the target’s turns. If the infection runs its course, the target becomes permanently [[zombify]]. Leaders and Zombies are immune.",
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
