import { IAbility } from "@/shared/interfaces";

export class IronWallAbility implements IAbility {
    public name = "Iron Wall";
    public description = "Take 50% less damage from ranged attacks.";

    public useAbility(): void { }
}