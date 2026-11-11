import { Card } from "../Card";
import { ISkill, SkillTiming, CombatContext, SkillResult } from "@/shared/interfaces/skillInterfaces";
import { Player } from "../Player";

export abstract class BaseSkill implements ISkill {
    public abstract name: string;
    public abstract description: string;
    public abstract triggerTiming: SkillTiming;

    public abstract canUse(caster: Card, target?: Card, context?: CombatContext): boolean;
    public abstract execute(caster: Card, target?: Card, context?: CombatContext): SkillResult;

    // Utility metodlar
    protected combineResults(results: SkillResult[]): SkillResult {
        const success = results.some(r => r.success);
        const messages = results.filter(r => r.message).map(r => r.message).join(', ');
        const additionalEffects = results.flatMap(r => r.additionalEffects || []);

        return {
            success,
            message: messages || undefined,
            additionalEffects: additionalEffects.length > 0 ? additionalEffects : undefined
        };
    }

    protected findLowestHpAlly(allAllies?: Card[]): Card | null {
        const allies = allAllies?.filter(card => card.health > 0) || [];

        if (allies.length === 0) return null;

        return allies.reduce((lowest, current) =>
            current.health < lowest.health ? current : lowest
        );
    }

    protected findRandomAlly(caster: Card, allAllies?: Card[], random = Math.random): Card | null {
        const allies = allAllies?.filter(card => card !== caster && card.health > 0) || [];

        if (allies.length === 0) return null;

        return allies[Math.floor(random() * allies.length)];
    }

    protected findRandomDeadAlly(player?: Player, random = Math.random): Card | null {
        if (!player) return null;
        const deadAllies = player.team.filter(card =>
            card.health <= 0 && card !== player.leader &&
            !player.hand.includes(card) && !player.deck.cards.includes(card)
        );

        if (deadAllies.length === 0) return null;

        const randomDeadAlly = deadAllies[Math.floor(random() * deadAllies.length)];

        return randomDeadAlly;
    }

    protected findRandomEnemy(allEnemies?: Card[], random = Math.random): Card | null {
        const enemies = allEnemies?.filter(card => card.health > 0) || [];

        if (enemies.length === 0) return null;

        return enemies[Math.floor(random() * enemies.length)];
    }
}
