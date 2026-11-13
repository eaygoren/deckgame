import { Card } from "@/game/Card";
import { Player } from "@/game/Player";
import { ICard } from "../interfaces";

export interface ISkill {
    name: string;
    description: string;
    triggerTiming: SkillTiming;
    readonly exhausted?: boolean;
    persistsAfterDeath?: boolean;
    triggersOnArcaneBlast?: boolean;
    target?: Card;
    passiveEffect?(type: EffectType): EffectConfig | undefined;
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
    random?: () => number;
    attacker?: Card;
    defender?: Card | null; // Eğer defender null ise, bu skill sadece attacker üzerinde çalışır
    damage?: number;
    dodged?: boolean;
    isArcaneBlast?: boolean;
    isCounterAttack?: boolean;
    killedByCounterattack?: boolean;
    allPlayerCards?: Card[];
    allOpponentCards?: Card[];
    player?: Player;
    opponent?: Player;
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
    protector?: Card;
    source?: Card;
    duration: number;
    value?: number;
    owner?: "player" | "bot";
    coverChange?: string; // YENİ: Effect cover'ı belirlemek için
    copiedSkill?: ISkill;
}

export enum EffectType {
    Silence = "silence",
    ZombifyPending = "zombify_pending",
    Zombify = "zombify",
    Invisible = "invisible",
    Burn = "burn",
    Freeze = "freeze",
    Bleed = "bleed",
    Poison = "poison",
    Mark = "mark",
    ThunderMark = "thunder_mark",
    Reforge = "reforge",
    Empowered = "empowered",
    Timeweave = "timeweave",
    LastHunt = "last_hunt",
    Dodge = "dodge",
    Heal = "heal",
    Cleanse = "cleanse",
    DebuffImmunity = "debuff_immunity",
    VoidLock = "void_lock",
    Buff = "buff",
    LifeSteal = "life_steal",
    CritBoost = "crit_boost",
    IronWall = "iron_wall",
    AttackReduction = "attack_reduction",
    IgnoreDefense = "ignore_defense",
    RangedTargetImmunity = "ranged_target_immunity",
    Taunt = "taunt",
    Fear = "fear",
    StatSwap = "stat_swap",
    AttackCopy = "attack_copy",
    SkillCopy = "skill_copy",
    CriticalFollowUp = "critical_follow_up",
    ThreeHeads = "three_heads",
    Protection = "protection",
    VowLink = "vow_link",
    WarriorRage = "warrior_rage",
    PhoenixRebirth = "phoenix_rebirth",
    PhoenixEgg = "phoenix_egg",
    SummonAlly = "summon_ally",
    SummonDeadAlly = "summon_dead_ally"
}

export enum TargetType {
    Self = "self",
    Enemy = "enemy",
    AllEnemies = "all_enemies",
    AllAllies = "all_allies",
    LowestHpAlly = "lowest_hp_ally",
    RandomAlly = "random_ally",
    RandomEnemy = "random_enemy",
    RandomDeadAlly = "random_dead_ally",
    None = "none"
}

export interface SkillConfig {
    name: string;
    description: string;
    triggerTiming: SkillTiming;
    effects: EffectConfig[];
    once?: boolean;
    persistsAfterDeath?: boolean;
    triggersOnArcaneBlast?: boolean;
    chance?: number;
}

export interface EffectConfig {
    counterOnDodge?: boolean;
    type: EffectType;
    target?: TargetType | ICard;
    duration?: number;
    value?: number;
    chance?: number;
    summon?: ICard;
    useCasterAttack?: boolean;
    excludeCaster?: boolean;
    allowOverheal?: boolean;
}
