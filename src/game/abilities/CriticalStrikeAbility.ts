import { IAbility } from "../../shared/interfaces";

export class CriticalStrikeAbility implements IAbility {
    public name = "Critical Strike";
    public description = "25% chance to deal double damage on attack.";

    public useAbility(): void { }
}