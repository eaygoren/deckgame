import { Card } from "../../game/Card";

export interface ISkill {
    name: string;
    description: string;
    triggerTiming: SkillTiming;
    canUse(caster: Card, target?: Card, context?: CombatContext): boolean;
    execute(caster: Card, target?: Card, context?: CombatContext): SkillResult;
}

export enum SkillTiming {
    BeforeAttack = "before_attack",
    AfterAttack = "after_attack",
    OnDamageReceived = "on_damage_received",
    OnDeath = "on_death",
    OnKill = "on_kill",
    StartOfTurn = "start_of_turn",
    OnCounterAttack = "on_counter_attack",
    Passive = "passive" // Sürekli aktif
}

export interface CombatContext {
    attacker: Card;
    defender: Card | null; // Eğer defender null ise, bu skill sadece attacker üzerinde çalışır
    damage: number;
    isCounterAttack: boolean;
    allPlayerCards: Card[];
    allBotCards: Card[];
}

export interface SkillResult {
    success: boolean;
    message?: string;
    damageModifier?: number; // Hasarı değiştirmek için
    preventCounter?: boolean; // Counter attack'ı engellemek için
    additionalEffects?: SkillEffect[];
}

export interface SkillEffect {
    type: EffectType;
    target: any;
    duration: number;
    value?: number;
    owner?: "player" | "bot";
    coverChange?: string; // YENİ: Effect cover'ı belirlemek için
}

export enum EffectType {
    Silence = "silence",
    Zombify = "zombify",
    Invisible = "invisible",
    Burn = "burn",
    Freeze = "freeze",
    Bleed = "bleed",
    Mark = "mark",
    Dodge = "dodge",
    Heal = "heal",
    LifeSteal = "life_steal",
    CritBoost = "crit_boost",
    AttackReduction = "attack_reduction",
    IgnoreDefense = "ignore_defense",
    Taunt = "taunt",
    StatSwap = "stat_swap",
    AttackCopy = "attack_copy",
    Protection = "protection"
}

export enum Target {
    Self = "self",
    Enemy = "enemy",
    AllEnemies = "all_enemies",
    AllAllies = "all_allies",
    LowestHpAlly = "lowest_hp_ally",
    RandomAlly = "random_ally",
    RandomEnemy = "random_enemy"
}

export interface SkillConfig {
    name: string;
    description: string;
    triggerTiming: SkillTiming;
    effects: EffectConfig[];
    once?: boolean;
    chance?: number;
}

export interface EffectConfig {
    type: EffectType;
    target: Target;
    duration?: number;
    value?: number;
    chance?: number;
}