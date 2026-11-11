import { EffectType } from "../interfaces/skillInterfaces";

export const CARD_POSITIONS = [
    { x: 225, slot: 0 },  // Sol 1
    { x: 575, slot: 1 },  // Sol 2  
    { x: 925, slot: 2 }, // Orta (Leader)
    { x: 1275, slot: 3 }, // Sağ 1
    { x: 1625, slot: 4 }  // Sağ 2
];

export const Environment = {
    battlefield: "battlefield",
    crown: "crown",
    deck: "deck",
    melee: "melee",
    ranged: "ranged",
    warrior: "warrior",
    mage: "mage",
    rogue: "rogue",
    tank: "tank",
};

export const Effects = {
    bleed: "bleed",
    burn: "burn",
    freeze: "freeze",
    poison: "poison",
    protection: "protection",
    zombify: "zombie",
};

export const EFFECT_FILTERS = {
    [EffectType.Burn]: { blue: 0.2, green: 0.4, red: 1 },
    [EffectType.Freeze]: { blue: 1, green: 0.7, red: 0.3 },
    //[EffectType.Poison]: { blue: 0.4, green: 1, red: 0.4 }
} as const;