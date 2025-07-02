import { Card } from "../Card";
import { BaseSkill } from "./BaseSkill";
import { SkillConfig, SkillTiming, CombatContext, SkillResult, EffectType, Target, SkillEffect } from "../../shared/interfaces/skillInterfaces";

export class GenericSkill extends BaseSkill {
    private config: SkillConfig;
    private hasBeenUsed: boolean = false;

    constructor(config: SkillConfig) {
        super();
        this.config = config;
    }

    public get name(): string { return this.config.name; }
    public get description(): string { return this.config.description; }
    public get triggerTiming(): SkillTiming { return this.config.triggerTiming; }

    public canUse(caster: Card, target?: Card, context?: CombatContext): boolean {
        // Once kontrolü
        if (this.config.once && this.hasBeenUsed) {
            return false;
        }

        // Silence kontrolü
        if (caster.hasEffect && caster.hasEffect(EffectType.Silence)) {
            return false;
        }

        // Şans kontrolü
        if (this.config.chance && Math.random() > this.config.chance) {
            return false;
        }

        return true;
    }

    public execute(caster: Card, target?: Card, context?: CombatContext): SkillResult {
        const results: SkillResult[] = [];

        // Her effect'i uygula
        for (const effectConfig of this.config.effects) {
            const result = this.applyEffect(effectConfig, caster, target, context);
            results.push(result);
        }

        // Once flag'i işaretle
        if (this.config.once) {
            this.hasBeenUsed = true;
        }

        return this.combineResults(results);
    }

    private applyEffect(effectConfig: any, caster: Card, target?: Card, context?: CombatContext): SkillResult {
        const targetCard = this.resolveTarget(effectConfig.target, caster, target, context);

        // Sadece Enemy target'larda null kontrolü yap
        if (!targetCard && (effectConfig.target === Target.Enemy || effectConfig.target === Target.RandomEnemy)) {
            return { success: false, message: "No valid target found" };
        }

        // Self target'lar için targetCard yerine caster kullan
        const actualTarget = targetCard || caster;

        switch (effectConfig.type) {
            case EffectType.Silence:
                return this.applySilence(actualTarget, effectConfig);
            case EffectType.Zombify:
                return this.applyZombify(actualTarget, effectConfig);
            case EffectType.Heal:
                return this.applyHeal(actualTarget, effectConfig, context);
            case EffectType.LifeSteal:
                return this.applyLifeSteal(caster, effectConfig, context);
            case EffectType.Burn:
                return this.applyBurn(actualTarget, effectConfig);
            case EffectType.AttackReduction:
                return this.applyAttackReduction(actualTarget, effectConfig);
            case EffectType.Freeze:
                return this.applyFreeze(actualTarget, effectConfig);
            case EffectType.Bleed:
                return this.applyBleed(actualTarget, effectConfig);
            case EffectType.Mark:
                return this.applyMark(actualTarget, effectConfig);
            case EffectType.AttackCopy:
                return this.applyAttackCopy(caster, target, effectConfig);
            case EffectType.StatSwap:
                return this.applyStatSwap(actualTarget, effectConfig);
            default:
                return { success: false, message: `Unknown effect type: ${effectConfig.type}` };
        }
    }

    private resolveTarget(targetType: Target, caster: Card, target?: Card, context?: CombatContext): Card | null {
        switch (targetType) {
            case Target.Self:
                return caster;
            case Target.Enemy:
                return target || null;
            case Target.LowestHpAlly:
                return this.findLowestHpAlly(caster, context?.allPlayerCards || context?.allBotCards || []);
            case Target.RandomAlly:
                return this.findRandomAlly(caster, context?.allPlayerCards || context?.allBotCards || []);
            case Target.RandomEnemy:
                // Random enemy logic buraya eklenebilir
                return target || null;
            default:
                return caster; // Default olarak self'i döndür
        }
    }

    // Effect implementation metodları
    private applySilence(target: Card, config: any): SkillResult {
        const effect: SkillEffect = {
            type: EffectType.Silence,
            target: target,
            duration: config.duration || 1
        };

        if (target.addEffect) {
            target.addEffect(effect);
        }

        return {
            success: true,
            message: `${target.name} has been silenced!`,
            additionalEffects: [effect]
        };
    }

    private applyZombify(target: Card, config: any): SkillResult {
        // Zaten zombie ise effect uygulanmaz
        if (target.hasEffect?.(EffectType.Zombify)) {
            return {
                success: false,
                message: `${target.name} is already a zombie!`
            };
        }

        const effect: SkillEffect = {
            type: EffectType.Zombify,
            target: target,
            duration: config.duration || 1
        };

        if (target.addEffect) {
            target.addEffect(effect);
        }

        return {
            success: true,
            message: `${target.name} has been zombified!`,
            additionalEffects: [effect]
        };
    }

    private applyHeal(target: Card, config: any, context?: CombatContext): SkillResult {
        const healAmount = Math.floor((context?.damage || 0) * (config.value || 0.5));

        if (target.health !== undefined) {
            target.health = Math.min(target.health + healAmount, target.maxHealth || target.health + healAmount);
        }

        return {
            success: true,
            message: `${target.name} healed for ${healAmount} HP!`
        };
    }

    private applyLifeSteal(caster: Card, config: any, context?: CombatContext): SkillResult {
        const healAmount = Math.floor((context?.damage || 0) * (config.value || 0.5));

        if (caster.health !== undefined) {
            caster.health = Math.min(caster.health + healAmount, caster.maxHealth || caster.health + healAmount);
        }

        return {
            success: true,
            message: `${caster.name} steals ${healAmount} HP!`
        };
    }

    private applyBurn(target: Card, config: any): SkillResult {
        const effect: SkillEffect = {
            type: EffectType.Burn,
            target: target,
            duration: config.duration || 1
        };

        if (target.addEffect) {
            target.addEffect(effect);
        }

        return {
            success: true,
            message: `${target.name} is burning!`,
            additionalEffects: [effect]
        };
    }

    private applyAttackReduction(target: Card, config: any): SkillResult {
        const effect: SkillEffect = {
            type: EffectType.AttackReduction,
            target: target,
            duration: config.duration || 1,
            value: config.value || 0.5 // Default %50 azaltma
        };

        if (target.addEffect) {
            target.addEffect(effect);

            // Attack'ı azalt - null check ekleyin
            const reductionValue = effect.value || 0.5; // Güvenli değer
            const reductionAmount = Math.floor(target.attack * reductionValue);
            target.attack = Math.max(1, target.attack - reductionAmount); // Minimum 1 attack
        }

        return {
            success: true,
            message: `${target.name}'s attack reduced by ${Math.floor((config.value || 0.5) * 100)}%!`,
            additionalEffects: [effect]
        };
    }

    private applyFreeze(target: Card, config: any): SkillResult {
        const effect: SkillEffect = {
            type: EffectType.Freeze,
            target: target,
            duration: config.duration || 1
        };

        if (target.addEffect) {
            target.addEffect(effect);
        }

        return {
            success: true,
            message: `${target.name} is frozen!`,
            additionalEffects: [effect]
        };
    }

    private applyBleed(target: Card, config: any): SkillResult {
        const effect: SkillEffect = {
            type: EffectType.Bleed,
            target: target,
            duration: config.duration || 1,
            value: config.value || 1
        };

        if (target.addEffect) {
            target.addEffect(effect);
        }

        return {
            success: true,
            message: `${target.name} is bleeding!`,
            additionalEffects: [effect]
        };
    }

    private applyMark(target: Card, config: any): SkillResult {
        const effect: SkillEffect = {
            type: EffectType.Mark,
            target: target,
            duration: config.duration || 1,
            value: config.value || 1.5
        };

        if (target.addEffect) {
            target.addEffect(effect);
        }

        return {
            success: true,
            message: `${target.name} has been marked!`,
            additionalEffects: [effect]
        };
    }

    private applyAttackCopy(caster: Card, target?: Card, config?: any): SkillResult {
        if (!target || target.attack === undefined || caster.attack === undefined) {
            return { success: false };
        }

        if (target.attack > caster.attack) {
            caster.attack = target.attack;
            
            return {
                success: true,
                message: `${caster.name} copies ${target.name}'s attack!`
            };
        }

        return { success: false };
    }

    private applyStatSwap(target: Card, config: any): SkillResult {
        if (!target || target.attack === undefined || target.health === undefined) {
            return { success: false };
        }

        const oldAttack = target.attack;
        const oldHealth = target.health;

        target.attack = oldHealth;
        target.health = oldAttack;

        return {
            success: true,
            message: `${target.name}'s stats have been swapped!`
        };
    }
}