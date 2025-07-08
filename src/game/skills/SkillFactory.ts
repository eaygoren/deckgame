import { EffectType, SkillConfig, SkillTiming, Target } from "../../shared/interfaces/skillInterfaces";
import { BaseSkill } from "./BaseSkill";
import { GenericSkill } from "./GenericSkill";

// src/game/skills/SkillFactory.ts
export class SkillFactory {
    private static skillConfigs: Map<string, SkillConfig> = new Map([
        // Aerwyn - %25 ihtimalle saldırılardan kaçınır
        ['aerwyn', {
            name: "Evasion 🌪️",
            description: "Like a whisper in the wind, she dances away from danger. 25% chance to dodge attacks.",
            triggerTiming: SkillTiming.Passive,
            effects: [
                { type: EffectType.Dodge, target: Target.Self, chance: 0.25 }
            ]
        }],

        // Alien - hasar aldıktan sonra 1 tur görünmez olur
        ['alien', {
            name: "Stealth Mode 💨",
            description: "Advanced alien technology bends light around its form. Becomes invisible for 1 turn after taking damage.",
            triggerTiming: SkillTiming.OnDamageReceived,
            effects: [
                { type: EffectType.Invisible, target: Target.Self, duration: 1 }
            ]
        }],

        // Archangel - takımındaki en düşük canı olan kartı iyileştirir
        ['archangel', {
            name: "Divine Healing ✨",
            description: "Celestial light flows through wounded allies, mending their pain. Heals lowest HP ally for 50% of damage dealt.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Heal, target: Target.LowestHpAlly, value: 0.5 }
            ]
        }],

        // Assassin - kritik ihtimalini 2 katına çıkarır
        ['assassin', {
            name: "Enhanced Critical 🔪",
            description: "Years of training have honed deadly precision to perfection. Doubles critical chance, 25% counter-crit chance.",
            triggerTiming: SkillTiming.Passive,
            effects: [
                { type: EffectType.CritBoost, target: Target.Self, value: 2, chance: 0.25 }
            ]
        }],

        // Dragon - hasar verdiği rakipleri yakar
        ['dragon', {
            name: "Dragon Fire 🔥",
            description: "Ancient flames burn with the fury of a thousand suns. Burns enemy for 1 damage and reduces attack by 50% for 1 turn.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Burn, target: Target.Enemy, duration: 1, value: 1 },
                { type: EffectType.AttackReduction, target: Target.Enemy, duration: 1, value: 0.5 }
            ]
        }],

        // Elf - tüm hasar düşürme etkilerini yok sayar
        ['elf', {
            name: "Piercing Shot 🏹",
            description: "Elven arrows find their mark through any defense. Ignores all damage reduction effects.",
            triggerTiming: SkillTiming.Passive,
            effects: [
                { type: EffectType.IgnoreDefense, target: Target.Self }
            ]
        }],

        // Ent - saldırdığı rakibi zorla kendine yönlendirir
        ['ent', {
            name: "Provoke 💢",
            description: "The ancient guardian's roar echoes through the battlefield. Forces enemy to only attack Ent for 1 turn.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Taunt, target: Target.Enemy, duration: 1 }
            ]
        }],

        // Gunslinger - rakibi işaretler
        ['gunslinger', {
            name: "Hunter's Mark 🎯",
            description: "A skilled marksman never loses sight of their prey. Marks enemy to take 50% more damage for 1 turn.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Mark, target: Target.Enemy, duration: 1, value: 1.5 }
            ]
        }],

        // Illusionist - can ve saldırıyı değiştirir
        ['illusionist', {
            name: "Reality Swap 🎭",
            description: "With a theatrical flourish, the impossible becomes possible. Swaps enemy's health and attack (once per game).",
            triggerTiming: SkillTiming.BeforeAttack,
            once: true,
            effects: [
                { type: EffectType.StatSwap, target: Target.Enemy }
            ]
        }],

        // Joker - saldırı gücünü kopyalar
        ['joker', {
            name: "Copycat 🃏",
            description: "The ultimate mimic adapts to any situation with a grin. Copies enemy's attack if it's higher.",
            triggerTiming: SkillTiming.BeforeAttack,
            effects: [
                { type: EffectType.AttackCopy, target: Target.Self }
            ]
        }],

        // Knight - takım arkadaşını korur
        ['knight', {
            name: "Guardian Shield 🛡️",
            description: "Honor compels the knight to shield those in need. Protects a random ally at turn start, shares damage 50/50.",
            triggerTiming: SkillTiming.StartOfTurn,
            effects: [
                { type: EffectType.Protection, target: Target.RandomAlly, value: 0.5 }
            ]
        }],

        // Lich - rakibi dondurur
        ['lich', {
            name: "Frost Prison ❄️",
            description: "Death's cold embrace paralyzes even the bravest souls. Freezes enemy for 1 turn, cannot attack.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Freeze, target: Target.Enemy, duration: 1 }
            ]
        }],

        // Reaper - öldürdüğünde hayalet ekler (custom implementation gerekli)
        // ['reaper', {
        //     name: "Soul Harvest",
        //     description: "Adds ghost to deck when killing an enemy",
        //     triggerTiming: SkillTiming.OnKill, // Enemy death
        //     effects: [] // Custom implementation
        // }],

        // Samurai - rakibi kanatır
        ['samurai', {
            name: "Bleeding Strike 🩸",
            description: "His sharp katana cuts through anything that stands before him. Causes enemy to bleed for 1 damage next 2 turns.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Bleed, target: Target.Enemy, duration: 2, value: 1 }
            ]
        }],

        // Siren - rakibi susturur
        ['siren', {
            name: "Silence Song 🎶",
            description: "Her haunting melody weaves spells that steal away voices. Silences enemy for 1 turn, cannot use skills.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Silence, target: Target.Enemy, duration: 1 }
            ]
        }],

        // Vampire - can çalar
        ['vampire', {
            name: "Life Drain 🩸",
            description: "Every drop of spilled blood flows back to strengthen the undead. Heals for 50% of damage dealt.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.LifeSteal, target: Target.Self, value: 0.5 }
            ]
        }],

        // Zombie - rakibi zombie yapar
        ['zombie', {
            name: "Zombify ☠️",
            description: "The curse of undeath spreads through a single infectious bite. Turns enemy into zombie for 1 turn, silences skills.",
            triggerTiming: SkillTiming.AfterAttack,
            effects: [
                { type: EffectType.Zombify, target: Target.Enemy, duration: 1 }
            ]
        }]
    ]);

    public static createSkill(cardName: string): BaseSkill | null {
        // Önce custom skill'leri kontrol et
        switch (cardName.toLowerCase()) {
            // case 'reaper':
            //     return new ReaperSkill(); // Custom implementation
            default:
                // Generic skill config'ten oluştur
                const config = this.skillConfigs.get(cardName.toLowerCase());
                return config ? new GenericSkill(config) : null;
        }
    }
}