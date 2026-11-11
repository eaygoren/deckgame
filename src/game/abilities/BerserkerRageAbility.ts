import { IAbility } from "@/shared/interfaces";

export class BerserkerRageAbility implements IAbility {
    public name = "Berserker Rage";
    public description = "Permanently gain 50% more attack when health drops below 50%.";

    public useAbility(): void { }
}