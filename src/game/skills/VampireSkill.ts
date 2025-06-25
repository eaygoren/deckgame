import { ISkill, SkillOptions } from "../../shared/interfaces";

export class VampireSkill implements ISkill {
    public name = "Blood Drain";
    public description = "Drain blood from the target. Heal for half the dealt damage.";

    public useSkill(context: SkillOptions): void {
        const { attacker, dealtDamage, isDisabled: isSkillDisabled } = context;

        if (isSkillDisabled || !attacker || typeof dealtDamage !== "number") return;

        const healAmount = Math.floor(dealtDamage / 2);
        attacker.health += healAmount;
    }
}