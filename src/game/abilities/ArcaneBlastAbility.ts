import { IAbility } from "../../shared/interfaces";

export class ArcaneBlastAbility implements IAbility {
    public name = "Arcane Blast";
    public description = "After attacking, deal 50% base damage to one random opponent (except leader).";

    public useAbility(): void { }
}