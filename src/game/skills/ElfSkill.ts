import { ISkill, SkillOptions } from "../../shared/interfaces";

export class ElfSkill implements ISkill {
    public name = "Piercing Arrow";
    public description = "A swift arrow that pierces through the enemy. Ignores all damage reduction effects.";

    public useSkill(context: SkillOptions): boolean {
        const { ignoreDefense, isDisabled } = context;

        return (!!ignoreDefense && !isDisabled);
    }
}