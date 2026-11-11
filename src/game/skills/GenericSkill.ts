import { CharacterList } from "@/shared/constants/characters";
import { UnitType } from "@/shared/enums";
import { Card } from "../Card";
import { BaseSkill } from "./BaseSkill";
import { SkillConfig, SkillTiming, CombatContext, SkillResult, EffectType, TargetType, SkillEffect, EffectConfig } from "@/shared/interfaces/skillInterfaces";

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

    public canUse(caster: Card): boolean {
        // Once kontrolü
        if (this.config.once && this.hasBeenUsed) {
            console.log("Skill has already been used");
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

        const result = this.combineResults(results);
        if (this.config.once && result.success) {
            this.hasBeenUsed = true;
        }

        return result;
    }

    private applyEffect(effectConfig: EffectConfig, caster: Card, target?: Card, context?: CombatContext): SkillResult {
        const targetCard = this.resolveTarget(effectConfig, caster, target, context);

        // Sadece Enemy target'larda null kontrolü yap
        if (!targetCard && (effectConfig.target === TargetType.Enemy || effectConfig.target === TargetType.RandomEnemy)) {
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
            case EffectType.Buff:
                return this.applyBuff(actualTarget, effectConfig);
            case EffectType.LifeSteal:
                return this.applyLifeSteal(actualTarget, effectConfig, context);
            case EffectType.Burn:
                return this.applyBurn(actualTarget, effectConfig);
            case EffectType.AttackReduction:
                return this.applyAttackReduction(actualTarget, effectConfig);
            case EffectType.Freeze:
                return this.applyFreeze(actualTarget, effectConfig);
            case EffectType.Bleed:
                return this.applyBleed(actualTarget, effectConfig);
            case EffectType.Poison:
                return this.applyPoison(actualTarget, effectConfig);
            case EffectType.Mark:
                return this.applyMark(actualTarget, effectConfig);
            case EffectType.AttackCopy:
                return this.applyAttackCopy(caster, target);
            case EffectType.StatSwap:
                return this.applyStatSwap(actualTarget);
            case EffectType.Protection:
                if (!targetCard) return { success: false };
                return this.applyProtection(caster, targetCard, effectConfig);
            case EffectType.SummonAlly:
                return this.applySummon(caster, effectConfig, context!);
            case EffectType.SummonDeadAlly:
                if (!targetCard) return { success: false, message: "No dead ally to revive" };
                return this.applySummonDeadAlly(targetCard, context?.player);
            default:
                return { success: false, message: `Unknown effect type: ${effectConfig.type}` };
        }
    }

    private resolveTarget(effectConfig: EffectConfig, caster: Card, target?: Card, context?: CombatContext): Card | null {
        let targetName: string | undefined;

        if (typeof effectConfig.target === "object" && effectConfig.target !== null && "name" in effectConfig.target) {
            targetName = effectConfig.target.name;
        }

        if (targetName && Object.values(CharacterList).some(character => character.name === targetName)) {
            if (context?.player?.team.includes(caster)) {
                return context.player.team.find(card => card.name === targetName) || null;
            } else if (context?.opponent?.team.includes(caster)) {
                return context?.opponent?.team.find(card => card.name === targetName) || null;
            }
        }

        switch (effectConfig.target) {
            case TargetType.Self:
                return caster;
            case TargetType.Enemy:
                return target || null;
            case TargetType.LowestHpAlly:
                return this.findLowestHpAlly(context?.allPlayerCards);
            case TargetType.RandomAlly: {
                const allies = context?.allPlayerCards;
                const eligibleAllies = effectConfig.type === EffectType.Protection
                    ? allies?.filter(ally => ally.unitType !== UnitType.Leader)
                    : allies;
                return this.findRandomAlly(caster, eligibleAllies);
            }
            case TargetType.RandomEnemy:
                return this.findRandomEnemy(context?.allOpponentCards);
            case TargetType.RandomDeadAlly:
                return this.findRandomDeadAlly(context?.player);
            case TargetType.None:
                return effectConfig.type === EffectType.SummonAlly && effectConfig.summon ? effectConfig.summon as Card : null;
            default:
                return caster; // Default olarak self'i döndür
        }
    }

    // Effect implementation metodları
    private applySilence(target: Card, config: EffectConfig): SkillResult {
        const effect: SkillEffect = {
            type: EffectType.Silence,
            target: target,
            duration: config.duration || 1
        };

        if (target.addEffect) {
            if (target.hasEffect(EffectType.Silence) && target.activeEffects) {
                const silenceEffect = target.activeEffects.find(effect => effect.type === EffectType.Silence);
                if (silenceEffect && typeof silenceEffect.duration === "number") {
                    silenceEffect.duration++;
                }
            } else {
                target.addEffect(effect);
            }
        }

        return {
            success: true,
            message: `${target.name} has been silenced!`,
            additionalEffects: [effect]
        };
    }

    private applyZombify(target: Card, config: EffectConfig): SkillResult {
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

    private applyHeal(target: Card, config: EffectConfig, context?: CombatContext): SkillResult {
        const healAmount = Math.floor((context?.damage || 1) * (config.value || 0.5));

        if (target.health !== undefined) {
            target.health = Math.min(target.health + healAmount, target.maxHealth || target.health + healAmount);
        }

        return {
            success: true,
            message: `${target.name} healed for ${healAmount} HP!`
        };
    }

    private applyBuff(target: Card, config: EffectConfig): SkillResult {
        const buffAmount = config.value || 1;

        if (target.attack !== undefined && target.health !== undefined) {
            target.attack += buffAmount;
            target.health += buffAmount;
            target.maxHealth += buffAmount;
        }

        return {
            success: true,
            message: `${target.name} received a buff of ${buffAmount} attack and health!`
        };
    }

    private applyLifeSteal(target: Card, config: EffectConfig, context?: CombatContext): SkillResult {
        const healAmount = Math.floor((context?.damage || 1) * (config.value || 0.5));

        if (target.health !== undefined) {
            target.health = Math.min(target.health + healAmount, target.maxHealth || target.health + healAmount);
        }

        return {
            success: true,
            message: `${target.name} steals ${healAmount} HP!`
        };
    }

    private applyBurn(target: Card, config: EffectConfig): SkillResult {
        const effect: SkillEffect = {
            type: EffectType.Burn,
            target: target,
            duration: config.duration || 1
        };

        if (target.addEffect) {
            if (target.hasEffect(EffectType.Burn) && target.activeEffects) {
                const burnEffect = target.activeEffects.find(effect => effect.type === EffectType.Burn);
                if (burnEffect && typeof burnEffect.duration === "number") {
                    burnEffect.duration++;
                }
            } else if (!target.hasEffect(EffectType.Burn)) {
                target.addEffect(effect);
            }
        }

        return {
            success: true,
            message: `${target.name} is burning!`,
            additionalEffects: [effect]
        };
    }

    private applyAttackReduction(target: Card, config: EffectConfig): SkillResult {
        const effect: SkillEffect = {
            type: EffectType.AttackReduction,
            target: target,
            duration: config.duration || 1,
            value: config.value || 0.5 // Default %50 azaltma
        };

        if (target.addEffect) {
            if (target.hasEffect(EffectType.AttackReduction) && target.activeEffects) {
                const attackReductionEffect = target.activeEffects.find(effect => effect.type === EffectType.AttackReduction);
                if (attackReductionEffect && typeof attackReductionEffect.duration === "number") {
                    attackReductionEffect.duration++;
                }
            } else {
                target.addEffect(effect);

                // Attack'ı azalt - null check ekleyin
                const reductionValue = effect.value || 0.5; // Güvenli değer
                const reductionAmount = Math.floor(target.attack * reductionValue);
                target.attack = Math.max(1, target.attack - reductionAmount); // Minimum 1 attack
            }
        }

        return {
            success: true,
            message: `${target.name}'s attack reduced by ${Math.floor((config.value || 0.5) * 100)}%!`,
            additionalEffects: [effect]
        };
    }

    private applyFreeze(target: Card, config: EffectConfig): SkillResult {
        const effect: SkillEffect = {
            type: EffectType.Freeze,
            target: target,
            duration: config.duration || 1
        };

        if (target.addEffect) {
            if (target.hasEffect(EffectType.Freeze) && target.activeEffects) {
                const freezeEffect = target.activeEffects.find(effect => effect.type === EffectType.Freeze);
                if (freezeEffect && typeof freezeEffect.duration === "number") {
                    freezeEffect.duration++;
                }
            } else if (!target.hasEffect(EffectType.Freeze)) {
                target.addEffect(effect);
            }
        }

        return {
            success: true,
            message: `${target.name} is frozen!`,
            additionalEffects: [effect]
        };
    }

    private applyBleed(target: Card, config: EffectConfig): SkillResult {
        const effect: SkillEffect = {
            type: EffectType.Bleed,
            target: target,
            duration: config.duration || 1,
            value: config.value || 1
        };

        if (target.addEffect) {
            if (target.hasEffect(EffectType.Bleed) && target.activeEffects) {
                const bleedEffect = target.activeEffects.find(effect => effect.type === EffectType.Bleed);
                if (bleedEffect && typeof bleedEffect.duration === "number") {
                    bleedEffect.duration++;
                }
            } else {
                target.addEffect(effect);
            }
        }

        return {
            success: true,
            message: `${target.name} is bleeding!`,
            additionalEffects: [effect]
        };
    }

    private applyPoison(target: Card, config: EffectConfig): SkillResult {
        const effect: SkillEffect = {
            type: EffectType.Poison,
            target: target,
            duration: config.duration!,
            value: config.value
        };

        if (target.addEffect) {
            if (!target.hasEffect(EffectType.Poison)) {
                target.addEffect(effect);
            }
        }

        return {
            success: true,
            message: `${target.name} is poisoned!`,
            additionalEffects: [effect]
        };
    }

    private applyMark(target: Card, config: EffectConfig): SkillResult {
        const effect: SkillEffect = {
            type: EffectType.Mark,
            target: target,
            duration: config.duration || 1,
            value: config.value || 1.5
        };

        if (target.addEffect) {
            if (target.hasEffect(EffectType.Mark) && target.activeEffects) {
                const markEffect = target.activeEffects.find(effect => effect.type === EffectType.Mark);
                if (markEffect && typeof markEffect.duration === "number") {
                    markEffect.duration++;
                }
            } else {
                target.addEffect(effect);
            }
        }

        return {
            success: true,
            message: `${target.name} has been marked!`,
            additionalEffects: [effect]
        };
    }

    private applyAttackCopy(caster: Card, target?: Card): SkillResult {
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

    private applyStatSwap(target: Card): SkillResult {
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

    private applyProtection(protector: Card, target: Card, config: EffectConfig): SkillResult {
        const effect: SkillEffect = {
            type: EffectType.Protection,
            target: target,
            protector,
            duration: config.duration || 1
        };

        target.addEffect(effect);

        return {
            success: true,
            message: `${target.name} is protected!`,
            additionalEffects: [effect]
        };
    }

    private applySummon(caster: Card, config: EffectConfig, context: CombatContext): SkillResult {
        const summon = new Card({
            ...config.summon!
        });

        if (context.player?.team.includes(caster)) {
            context.player.deck.addCard(summon);
            context.player.addToTeam(summon);

            return {
                success: true,
                message: `${caster.name} summons a ${summon.name} to their player's deck!`
            };
        } else if (context.opponent?.team.includes(caster)) {
            context.opponent.deck.addCard(summon);
            context.opponent.addToTeam(summon);

            return {
                success: true,
                message: `${caster.name} summons a ${summon.name} to their opponent's deck!`
            };
        } else {
            return {
                success: false,
                message: "Cannot summon: player or deck is undefined."
            };
        }
    }

    private applySummonDeadAlly(target: Card, player?: CombatContext["player"]): SkillResult {
        if (!player) return { success: false };

        player.deck.addCard(target);
        target.health = 1;
        return {
            success: true,
            message: `${target.name} has been revived and added to the deck!`
        };
    }
}
