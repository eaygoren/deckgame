export enum Turn {
    Player,
    Bot,
}
export enum Rarity {
    Legendary = "Legendary",
    Rare = "Rare",
    Common = "Common"
}
export enum UnitType {
    Leader = "Leader",
    Regular = "Regular"
}
export enum Color {
    Common = 0x696969,
    Rare = 0x3399ff,
    Legendary = 0xff9900,
    Leader = 0xff0000,
}
export enum AttackType {
    Melee = "Melee",
    Ranged = "Ranged",
}
export enum ClassType {
    Mage = "Mage",  // can deal damage to one random (except leader) opponent with 50% base damage
    Rogue = "Rogue",  // can make critical hits with 25% chance
    Tank = "Tank",  // can take half damage from ranged cards
    Warrior = "Warrior", // after losing %50 health, deals %50 more damage
}