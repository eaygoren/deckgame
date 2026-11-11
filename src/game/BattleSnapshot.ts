import { GenericSkill } from "./skills/GenericSkill";

export function cloneBattleState<T>(value: T, copies: Map<object, object>): T {
    if (!value || typeof value !== "object") return value;
    const existing = copies.get(value);
    if (existing) return existing as T;

    if (value instanceof GenericSkill) {
        const skill = value.copyForSimulation();
        copies.set(value, skill);
        return skill as T;
    }

    const copy = Array.isArray(value) ? []
        : value instanceof Map ? new Map()
        : Object.create(Object.getPrototypeOf(value));
    copies.set(value, copy);
    if (value instanceof Map) {
        for (const [key, item] of value) copy.set(key, cloneBattleState(item, copies));
    } else {
        for (const [key, item] of Object.entries(value)) copy[key] = cloneBattleState(item, copies);
    }
    return copy as T;
}

export function seededBattleRandom(seed: number): () => number {
    return () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let bits = Math.imul(seed ^ (seed >>> 15), seed | 1);
        bits ^= bits + Math.imul(bits ^ (bits >>> 7), bits | 61);
        return ((bits ^ (bits >>> 14)) >>> 0) / 4294967296;
    };
}
