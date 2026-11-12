import { EffectType, SkillEffect } from "../shared/interfaces/skillInterfaces";

interface EffectBadge {
  label: string;
  path: string | readonly { d: string; transform?: string }[];
}

export const clockIconPath = "M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";
export const thunderMarkIconPath = "M13 2.9l-7 10.2h5.2l-.7 8L18 10.8h-5.4l.4-7.9ZM4 5.8l1.8 1.8m12.4 8.8 1.8 1.8";
export const lastHuntIconPath = "M18.9 16.3a8.7 8.7 0 1 1-6.4-13.2 7.4 7.4 0 0 0 6.4 13.2Z M11.6 14.3l2-4.5m1 5.5 2-4.5m1 5.5 2-4.5";

export const effectBadges: Partial<Record<EffectType, EffectBadge>> = {
  [EffectType.VoidLock]: { label: "Void Lock", path: "M7.5 10V7a4.5 4.5 0 0 1 9 0v3M6.3 10h11.4a1.8 1.8 0 0 1 1.8 1.8v6.4a1.8 1.8 0 0 1-1.8 1.8H6.3a1.8 1.8 0 0 1-1.8-1.8v-6.4A1.8 1.8 0 0 1 6.3 10Z M10.2 13.2l3.6 3.6m0-3.6-3.6 3.6" },
  [EffectType.PhoenixEgg]: { label: "Phoenix Egg", path: "M12 2.7c-3.5 0-7.1 6.6-7.1 11.6a7.1 7.1 0 0 0 14.2 0C19.1 9.3 15.5 2.7 12 2.7Z M5.2 11.8l4.1 1.5 2.3-3.7 2.7 5 4.3-2.6" },
  [EffectType.SkillCopy]: { label: "Copied Ability", path: "M14.5 4H5.8a1.7 1.7 0 0 0-1.7 1.7v9.1M9.5 8h8.8a1.7 1.7 0 0 1 1.7 1.7v8.6a1.7 1.7 0 0 1-1.7 1.7H9.5a1.7 1.7 0 0 1-1.7-1.7V9.7A1.7 1.7 0 0 1 9.5 8Z M14 10.8v6.4m-3.2-3.2h6.4" },
  [EffectType.Freeze]: {
    label: "Freeze",
    path: [
      { d: "M12 12V2.8m-2.4 2.6L12 7.8l2.4-2.4" },
      { d: "M12 12V2.8m-2.4 2.6L12 7.8l2.4-2.4", transform: "rotate(60 12 12)" },
      { d: "M12 12V2.8m-2.4 2.6L12 7.8l2.4-2.4", transform: "rotate(120 12 12)" },
      { d: "M12 12V2.8m-2.4 2.6L12 7.8l2.4-2.4", transform: "rotate(180 12 12)" },
      { d: "M12 12V2.8m-2.4 2.6L12 7.8l2.4-2.4", transform: "rotate(240 12 12)" },
      { d: "M12 12V2.8m-2.4 2.6L12 7.8l2.4-2.4", transform: "rotate(300 12 12)" },
    ],
  },
  [EffectType.Protection]: { label: "Protection", path: "M12 3c2.6 1.5 5.3 2.3 8 2.6v5c0 4.5-2.7 7.8-8 10.4-5.3-2.6-8-5.9-8-10.4v-5c2.7-.3 5.4-1.1 8-2.6Z M8.6 12.1l2.3 2.4 4.5-5" },
  [EffectType.DebuffImmunity]: { label: "Debuff Immunity", path: "M12 3c2.6 1.5 5.3 2.3 8 2.6v5c0 4.5-2.7 7.8-8 10.4-5.3-2.6-8-5.9-8-10.4v-5c2.7-.3 5.4-1.1 8-2.6ZM12 8v7m-3.5-3.5h7" },
  [EffectType.Bleed]: { label: "Bleed", path: "M12 2.7c-2.9 4.2-6.3 7.6-6.3 12a6.3 6.3 0 0 0 12.6 0c0-4.4-3.4-7.8-6.3-12Z M8.8 14.8a3.2 3.2 0 0 0 3.2 3.2" },
  [EffectType.Burn]: { label: "Burn", path: "M12 21a7.1 7.1 0 0 1-6.1-10.7c.4 1.7 1.3 2.4 2.3 2.8C8.6 8.5 12.1 7 12.2 3c3.4 2.1 5.6 6.2 4.6 10.2.7-.3 1.4-.9 1.8-1.8A7.1 7.1 0 0 1 12 21Z M12 21c-2.9-.8-3.4-3.9 0-6.8 3.4 2.9 2.9 6 0 6.8Z" },
  [EffectType.Poison]: { label: "Poison", path: "M9 3h6m-5 0v5.5l-4 5.1a4.5 4.5 0 0 0 3.6 7.3h4.8a4.5 4.5 0 0 0 3.6-7.3l-4-5.1V3M6.4 14.3c3.3-2.1 5.2 2.6 8.6.5 1-.6 1.7-.7 2.6-.5m-6 3.4h.1" },
  [EffectType.Silence]: { label: "Silence", path: "M4.2 5.1h15.6a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8h-8.9L6.8 20v-3.3H4.2a1.8 1.8 0 0 1-1.8-1.8v-8a1.8 1.8 0 0 1 1.8-1.8Z M3.2 3.2 20.8 20.8" },
  [EffectType.AttackReduction]: {
    label: "Attack Down",
    path: [
      { d: "M9.9 8.5V6L12 2.6 14.1 6v2.1L12 7.5l-.8 2.4Zm0 3.1v4.5h4.2v-4.7L12 13l-.9-2.4Zm-2 4.5h8.2M12 16.1v4.5", transform: "rotate(40 12 12)" },
    ],
  },
  [EffectType.Mark]: { label: "Mark", path: "M19.1 12 a7.1 7.1 0 1 0 -14.2 0 a7.1 7.1 0 1 0 14.2 0Z M14.2 12 a2.2 2.2 0 1 0 -4.4 0 a2.2 2.2 0 1 0 4.4 0Z M12 2.6v4m0 10.8v4m-9.4-9.4h4m10.8 0h4" },
  [EffectType.ThunderMark]: { label: "Thunder Mark", path: thunderMarkIconPath },
  [EffectType.LastHunt]: { label: "Last Hunt", path: lastHuntIconPath },
  [EffectType.Taunt]: { label: "Taunt", path: "M4.2 5.1h15.6a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8h-8.9L6.8 20v-3.3H4.2a1.8 1.8 0 0 1-1.8-1.8v-8a1.8 1.8 0 0 1 1.8-1.8Z M12 8.2v3.8m0 2.2h.01" },
  [EffectType.ZombifyPending]: {
    label: "Infection",
    path: [
      { d: "M10.6 8.8a4.3 4.3 0 0 1-1.2-5.5 5.4 5.4 0 0 0 2.6 10 5.4 5.4 0 0 0 2.6-10 4.3 4.3 0 0 1-1.2 5.5", transform: "translate(2.2 2.2) scale(.82)" },
      { d: "M10.6 8.8a4.3 4.3 0 0 1-1.2-5.5 5.4 5.4 0 0 0 2.6 10 5.4 5.4 0 0 0 2.6-10 4.3 4.3 0 0 1-1.2 5.5", transform: "translate(2.2 2.2) scale(.82) rotate(120 12 12)" },
      { d: "M10.6 8.8a4.3 4.3 0 0 1-1.2-5.5 5.4 5.4 0 0 0 2.6 10 5.4 5.4 0 0 0 2.6-10 4.3 4.3 0 0 1-1.2 5.5", transform: "translate(2.2 2.2) scale(.82) rotate(240 12 12)" },
      { d: "M14 12 a2 2 0 1 0 -4 0 a2 2 0 1 0 4 0Z", transform: "translate(2.2 2.2) scale(.82)" },
    ],
  },
  [EffectType.Zombify]: { label: "Zombified", path: "M12 3.1a7.5 7.5 0 0 0-4.7 13.3v3.9h9.4v-3.9A7.5 7.5 0 0 0 12 3.1ZM7.5 10.4l2.4 2.4m0-2.4-2.4 2.4m6.6-2.4 2.4 2.4m0-2.4-2.4 2.4m-2.1.9v1m-1.7 3v2.6m3.4-2.6v2.6" },
  [EffectType.WarriorRage]: { label: "Rage", path: "M4.6 11V7.6a1.9 1.9 0 0 1 3.8 0V6a1.8 1.8 0 0 1 3.6 0v.6a1.8 1.8 0 0 1 3.6 0v1a1.8 1.8 0 0 1 3.6 0v5.6c0 1.6-.7 2.8-2.1 4v3.3H8v-3.3l-3.3-3a2.1 2.1 0 0 1 0-3.2c.8-.7 1.9-.6 2.6 0l1.8 1.4m-.7-4.8v2m3.6-3v3m3.6-2v2m-7.6 7.6h9.1" },
  [EffectType.Invisible]: { label: "Stealth", path: "M3.2 3.2 20.8 20.8M10 6.1c4.2-.8 8.4 1.3 11.3 5.9-.9 1.5-2 2.7-3.2 3.6M6.4 7.8A15.9 15.9 0 0 0 2.7 12c3.1 4.8 7.8 7 12.2 5.6m-5-7.7a3 3 0 0 0 4.2 4.2" },
};

export function createEffectBadge(badge?: EffectBadge): HTMLSpanElement {
  const element = document.createElement("span");
  element.className = "effect-badge";
  const namespace = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(namespace, "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  const shape = badge?.path ?? "M12 8v4m0 4h.01";
  const parts = typeof shape === "string" ? [{ d: shape }] : shape;
  for (const { d, transform } of parts) {
    const path = document.createElementNS(namespace, "path");
    path.setAttribute("d", d);
    if (transform) path.setAttribute("transform", transform);
    icon.append(path);
  }
  element.append(icon);
  return element;
}

export function effectDuration(effect: SkillEffect): string {
  if (effect.type === EffectType.Protection) return "Until the start of this team's next turn";
  if (effect.type === EffectType.Invisible || effect.type === EffectType.DebuffImmunity) return "Until the end of the opposing team's next turn";
  if (effect.type === EffectType.Mark || effect.type === EffectType.ThunderMark) return "Until the end of the marking team's next turn";
  if (effect.type === EffectType.Freeze) return "Until the end of the freezing team's next turn";
  if (effect.duration === Infinity) return "Indefinite";
  return `${effect.duration} ${effect.duration === 1 ? "turn" : "turns"} left`;
}

export function effectDetails(effect: Pick<SkillEffect, "type" | "value" | "protector" | "source" | "copiedSkill">): string {
  switch (effect.type) {
    case EffectType.VoidLock:
      return "This card cannot heal or gain attack or HP buffs.";
    case EffectType.DebuffImmunity:
      return "This card cannot receive new debuffs.";
    case EffectType.PhoenixEgg:
      return "The egg cannot attack or counterattack. If it survives until the effect expires, Phoenix is reborn.";
    case EffectType.Bleed:
    case EffectType.Burn:
    case EffectType.Poison:
      return `Takes ${effect.value || 1} damage at the end of its turn.`;
    case EffectType.Freeze:
      return "This card cannot attack or counterattack.";
    case EffectType.Protection:
      if (effect.protector && effect.protector.health <= 0) {
        return "Damage sharing has ended because the protector fell.";
      }
      return `${effect.protector?.name ?? "The protector"} absorbs up to half the incoming combat damage, capped by their remaining HP. This card takes the rest.`;
    case EffectType.Mark:
      return "The marked target takes 50% more damage from normal attacks.";
    case EffectType.ThunderMark:
      return "Zeus’s lightning deals 1 damage to an unmarked target and 2 to a target he has already marked.";
    case EffectType.LastHunt:
      return "This card stays in play at 0 HP. It can attack and be targeted, but cannot take damage, heal, or counterattack.";
    case EffectType.Taunt:
      return `This card can only attack ${effect.source?.name ?? "the unit that taunted it"}.`;
    case EffectType.ZombifyPending:
      return "This card can use its abilities during the countdown. It permanently becomes a Zombie when the effect expires.";
    case EffectType.Zombify:
      return "This card takes Zombie’s class and attack type, with half of Zombie’s base attack and HP. It cannot use character or class abilities.";
    case EffectType.Silence:
      return "This card cannot use its special ability.";
    case EffectType.SkillCopy:
      return `${effect.copiedSkill?.name ?? "The copied ability"} triggers on the next normal attack if its conditions are met.`;
    case EffectType.AttackReduction:
      return `Attack is reduced by ${Math.floor((effect.value || 0.5) * 100)}%.`;
    case EffectType.WarriorRage:
      return effect.value === undefined ? "Attack is increased." : `Attack +${effect.value}.`;
    case EffectType.Invisible:
      return "This card cannot be targeted by attacks and takes no counterattack damage.";
    default:
      return "";
  }
}
