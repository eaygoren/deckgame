import { IAbility } from "../../shared/interfaces";

export class ZombieSkill implements IAbility {
    public name = "Undead Resilience";
    public description = "Revive with 50% health after being defeated once.";

    public useSkill(context: { isDefeated: boolean; reviveHealth: number }): void {
        const { isDefeated, reviveHealth } = context;
        if (isDefeated) {
            this.revive(reviveHealth);
        }
    }

    private revive(health: number): void {
        // Logic to revive the zombie with the specified health
        console.log(`Zombie revived with ${health} health.`);
    }
}
