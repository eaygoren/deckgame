import { EffectType, SkillEffect } from "../shared/interfaces/skillInterfaces";

interface EffectBadge {
  label: string;
  path: IconShape;
  category?: "buff" | "debuff";
}

export type IconShape = string | readonly {
  d: string;
  transform?: string;
  strokeWidth?: number;
  filled?: boolean;
}[];

export const clockIconPath = "M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";
export const threeHeadsIconPath = "M3 14v-3l2-2 1-3 2 2m-5 6h3l1 3m14-3v-3l-2-2-1-3-2 2m5 6h-3l-1 3M8 14v-3l1.5-2L10 5l2 2 2-2 .5 4 1.5 2v3l-2.5 2.5L12 21l-1.5-4.5L8 14Zm2.5-2h.1m2.8 0h.1";
export const thunderMarkIconPath = "M13 2.9l-7 10.2h5.2l-.7 8L18 10.8h-5.4l.4-7.9ZM4 5.8l1.8 1.8m12.4 8.8 1.8 1.8";
export const lastHuntIconPath = "M18.9 16.3a8.7 8.7 0 1 1-6.4-13.2 7.4 7.4 0 0 0 6.4 13.2Z M11.6 14.3l2-4.5m1 5.5 2-4.5m1 5.5 2-4.5";
export const timeweaveIcon: IconShape = [
  { d: "M21 12h22M21 52h22M24 12v6c0 5 4 9 8 14-4 5-8 9-8 14v6m16-40v6c0 5-4 9-8 14 4 5 8 9 8 14v6", transform: "scale(.375)", strokeWidth: 2.5 },
  { d: "M27 46l5-4 5 4M17 23a17.5 17.5 0 0 0 0 18m-5-1 5 1 1-5m29 5a17.5 17.5 0 0 0 0-18m5 1-5-1-1 5", transform: "scale(.375)", strokeWidth: 2.5 },
  { d: "M28 20h8m-4 16v2", transform: "scale(.375)", strokeWidth: 2 },
];
export const fearIcon: IconShape = [
  { d: "M32 11c-9.9 0-16 7.1-16 16.2 0 8.6 4.3 14.1 9.5 18.7L32 53l6.5-7.1C43.7 41.3 48 35.8 48 27.2 48 18.1 41.9 11 32 11Z", transform: "scale(.375)", strokeWidth: 2.8 },
  { d: "M22.5 23.6c2.2.3 4.8 1.8 6.8 4.1-2.2 2.3-6.7 1.5-6.8-4.1Zm19 0c-2.2.3-4.8 1.8-6.8 4.1 2.2 2.3 6.7 1.5 6.8-4.1Z", transform: "scale(.375)", filled: true },
  { d: "M32 33.5c2.8 0 4.2 3.7 4.2 7.1 0 2.6-1.5 4.2-4.2 4.2s-4.2-1.6-4.2-4.2c0-3.4 1.4-7.1 4.2-7.1Z", transform: "scale(.375)", filled: true },
  { d: "m9 21 3.8 4.3L8 29.1l3.8 4.4L8 38.2m47-17.2-3.8 4.3 4.8 3.8-3.8 4.4 3.8 4.7", transform: "scale(.375)", strokeWidth: 2.5 },
];

export const effectBadges: Partial<Record<EffectType, EffectBadge>> = {
  [EffectType.VowLink]: {
    category: "buff",
    label: "Vow Link",
    path: [{
      d: "M13.7 7.2a4.5 4.5 0 1 0-6.5 6.5l1.5 1.5m1.6 1.6a4.5 4.5 0 1 0 6.5-6.5l-1.5-1.5M9 15l6-6",
      transform: "translate(12 12) scale(1.2) translate(-12 -12)",
    }],
  },
  [EffectType.Empowered]: {
    category: "buff",
    label: "Empowered",
    path: [
      { d: "M21.6 12a9.6 4.3 0 1 0-19.2 0 9.6 4.3 0 1 0 19.2 0Z", strokeWidth: 1.05 },
      { d: "M21.6 12a9.6 4.3 0 1 0-19.2 0 9.6 4.3 0 1 0 19.2 0Z", strokeWidth: 1.05, transform: "rotate(60 12 12)" },
      { d: "M21.6 12a9.6 4.3 0 1 0-19.2 0 9.6 4.3 0 1 0 19.2 0Z", strokeWidth: 1.05, transform: "rotate(-60 12 12)" },
      { d: "M13.8 12a1.8 1.8 0 1 0 -3.6 0a1.8 1.8 0 1 0 3.6 0Z M22.35 10.5a1.35 1.35 0 1 0 -2.7 0a1.35 1.35 0 1 0 2.7 0Z M8.65 4a1.35 1.35 0 1 0 -2.7 0a1.35 1.35 0 1 0 2.7 0Z M8.65 20a1.35 1.35 0 1 0 -2.7 0a1.35 1.35 0 1 0 2.7 0Z", filled: true },
    ],
  },
  [EffectType.VoidLock]: { category: "debuff", label: "Void Lock", path: "M7.5 10V7a4.5 4.5 0 0 1 9 0v3M6.3 10h11.4a1.8 1.8 0 0 1 1.8 1.8v6.4a1.8 1.8 0 0 1-1.8 1.8H6.3a1.8 1.8 0 0 1-1.8-1.8v-6.4A1.8 1.8 0 0 1 6.3 10Z M10.2 13.2l3.6 3.6m0-3.6-3.6 3.6" },
  [EffectType.PhoenixEgg]: { category: "buff", label: "Phoenix Egg", path: "M12 2.7c-3.5 0-7.1 6.6-7.1 11.6a7.1 7.1 0 0 0 14.2 0C19.1 9.3 15.5 2.7 12 2.7Z M5.2 11.8l4.1 1.5 2.3-3.7 2.7 5 4.3-2.6" },
  [EffectType.SkillCopy]: { category: "buff", label: "Copied Ability", path: "M14.5 4H5.8a1.7 1.7 0 0 0-1.7 1.7v9.1M9.5 8h8.8a1.7 1.7 0 0 1 1.7 1.7v8.6a1.7 1.7 0 0 1-1.7 1.7H9.5a1.7 1.7 0 0 1-1.7-1.7V9.7A1.7 1.7 0 0 1 9.5 8Z M14 10.8v6.4m-3.2-3.2h6.4" },
  [EffectType.Freeze]: {
    category: "debuff",
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
  [EffectType.Protection]: { category: "buff", label: "Protection", path: "M12 3c2.6 1.5 5.3 2.3 8 2.6v5c0 4.5-2.7 7.8-8 10.4-5.3-2.6-8-5.9-8-10.4v-5c2.7-.3 5.4-1.1 8-2.6Z M8.6 12.1l2.3 2.4 4.5-5" },
  [EffectType.DebuffImmunity]: { category: "buff", label: "Debuff Immunity", path: "M12 3c2.6 1.5 5.3 2.3 8 2.6v5c0 4.5-2.7 7.8-8 10.4-5.3-2.6-8-5.9-8-10.4v-5c2.7-.3 5.4-1.1 8-2.6ZM12 8v7m-3.5-3.5h7" },
  [EffectType.Bleed]: { category: "debuff", label: "Bleed", path: "M12 2.7c-2.9 4.2-6.3 7.6-6.3 12a6.3 6.3 0 0 0 12.6 0c0-4.4-3.4-7.8-6.3-12Z M8.8 14.8a3.2 3.2 0 0 0 3.2 3.2" },
  [EffectType.Burn]: { category: "debuff", label: "Burn", path: "M12 21a7.1 7.1 0 0 1-6.1-10.7c.4 1.7 1.3 2.4 2.3 2.8C8.6 8.5 12.1 7 12.2 3c3.4 2.1 5.6 6.2 4.6 10.2.7-.3 1.4-.9 1.8-1.8A7.1 7.1 0 0 1 12 21Z M12 21c-2.9-.8-3.4-3.9 0-6.8 3.4 2.9 2.9 6 0 6.8Z" },
  [EffectType.Poison]: { category: "debuff", label: "Poison", path: "M9 3h6m-5 0v5.5l-4 5.1a4.5 4.5 0 0 0 3.6 7.3h4.8a4.5 4.5 0 0 0 3.6-7.3l-4-5.1V3M6.4 14.3c3.3-2.1 5.2 2.6 8.6.5 1-.6 1.7-.7 2.6-.5m-6 3.4h.1" },
  [EffectType.Silence]: { category: "debuff", label: "Silence", path: "M4.2 5.1h15.6a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8h-8.9L6.8 20v-3.3H4.2a1.8 1.8 0 0 1-1.8-1.8v-8a1.8 1.8 0 0 1 1.8-1.8Z M3.2 3.2 20.8 20.8" },
  [EffectType.AttackReduction]: {
    category: "debuff",
    label: "Attack Down",
    path: [
      { d: "M9.9 8.5V6L12 2.6 14.1 6v2.1L12 7.5l-.8 2.4Zm0 3.1v4.5h4.2v-4.7L12 13l-.9-2.4Zm-2 4.5h8.2M12 16.1v4.5", transform: "rotate(40 12 12)" },
    ],
  },
  [EffectType.Mark]: { category: "debuff", label: "Mark", path: "M19.1 12 a7.1 7.1 0 1 0 -14.2 0 a7.1 7.1 0 1 0 14.2 0Z M14.2 12 a2.2 2.2 0 1 0 -4.4 0 a2.2 2.2 0 1 0 4.4 0Z M12 2.6v4m0 10.8v4m-9.4-9.4h4m10.8 0h4" },
  [EffectType.ThunderMark]: { category: "debuff", label: "Thunder Mark", path: thunderMarkIconPath },
  [EffectType.LastHunt]: { category: "buff", label: "Last Hunt", path: lastHuntIconPath },
  [EffectType.Fear]: { category: "debuff", label: "Fear", path: fearIcon },
  [EffectType.Taunt]: { category: "debuff", label: "Taunt", path: "M4.2 5.1h15.6a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8h-8.9L6.8 20v-3.3H4.2a1.8 1.8 0 0 1-1.8-1.8v-8a1.8 1.8 0 0 1 1.8-1.8Z M12 8.2v3.8m0 2.2h.01" },
  [EffectType.ZombifyPending]: {
    category: "debuff",
    label: "Infection",
    path: [
      { d: "M10.6 8.8a4.3 4.3 0 0 1-1.2-5.5 5.4 5.4 0 0 0 2.6 10 5.4 5.4 0 0 0 2.6-10 4.3 4.3 0 0 1-1.2 5.5", transform: "translate(2.2 2.2) scale(.82)" },
      { d: "M10.6 8.8a4.3 4.3 0 0 1-1.2-5.5 5.4 5.4 0 0 0 2.6 10 5.4 5.4 0 0 0 2.6-10 4.3 4.3 0 0 1-1.2 5.5", transform: "translate(2.2 2.2) scale(.82) rotate(120 12 12)" },
      { d: "M10.6 8.8a4.3 4.3 0 0 1-1.2-5.5 5.4 5.4 0 0 0 2.6 10 5.4 5.4 0 0 0 2.6-10 4.3 4.3 0 0 1-1.2 5.5", transform: "translate(2.2 2.2) scale(.82) rotate(240 12 12)" },
      { d: "M14 12 a2 2 0 1 0 -4 0 a2 2 0 1 0 4 0Z", transform: "translate(2.2 2.2) scale(.82)" },
    ],
  },
  [EffectType.Zombify]: { category: "debuff", label: "Zombified", path: "M12 3.1a7.5 7.5 0 0 0-4.7 13.3v3.9h9.4v-3.9A7.5 7.5 0 0 0 12 3.1ZM7.5 10.4l2.4 2.4m0-2.4-2.4 2.4m6.6-2.4 2.4 2.4m0-2.4-2.4 2.4m-2.1.9v1m-1.7 3v2.6m3.4-2.6v2.6" },
  [EffectType.WarriorRage]: { category: "buff", label: "Rage", path: "M4.6 11V7.6a1.9 1.9 0 0 1 3.8 0V6a1.8 1.8 0 0 1 3.6 0v.6a1.8 1.8 0 0 1 3.6 0v1a1.8 1.8 0 0 1 3.6 0v5.6c0 1.6-.7 2.8-2.1 4v3.3H8v-3.3l-3.3-3a2.1 2.1 0 0 1 0-3.2c.8-.7 1.9-.6 2.6 0l1.8 1.4m-.7-4.8v2m3.6-3v3m3.6-2v2m-7.6 7.6h9.1" },
  [EffectType.Invisible]: { category: "buff", label: "Stealth", path: "M3.2 3.2 20.8 20.8M10 6.1c4.2-.8 8.4 1.3 11.3 5.9-.9 1.5-2 2.7-3.2 3.6M6.4 7.8A15.9 15.9 0 0 0 2.7 12c3.1 4.8 7.8 7 12.2 5.6m-5-7.7a3 3 0 0 0 4.2 4.2" },
};

export function createEffectBadge(badge?: EffectBadge): HTMLSpanElement {
  const element = document.createElement("span");
  element.className = "effect-badge";
  if (badge?.category) element.dataset.effectCategory = badge.category;
  const namespace = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(namespace, "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  appendIconPaths(icon, badge?.path ?? "M12 8v4m0 4h.01");
  element.append(icon);
  return element;
}

export function appendIconPaths(icon: SVGSVGElement, shape: IconShape): void {
  const parts = typeof shape === "string" ? [{ d: shape }] : shape;
  for (const { d, transform, strokeWidth, filled } of parts) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    if (transform) path.setAttribute("transform", transform);
    if (strokeWidth !== undefined) path.setAttribute("stroke-width", String(strokeWidth));
    if (filled) {
      path.setAttribute("fill", "currentColor");
      path.setAttribute("stroke", "none");
    }
    icon.append(path);
  }
}

export function effectDuration(effect: SkillEffect): string {
  if (effect.type === EffectType.Protection || effect.type === EffectType.VowLink) return "Until the start of this team's next turn";
  if (effect.type === EffectType.Invisible) {
    return effect.duration > 1 ? "Until the end of this team's next turn" : "Until the end of this team's turn";
  }
  if (effect.type === EffectType.DebuffImmunity) return "Until the end of the opposing team's next turn";
  if (effect.type === EffectType.Mark || effect.type === EffectType.ThunderMark) {
    return effect.duration === 1 ? "Until the end of the marking team's turn"
      : `${effect.duration} turns of the marking team left`;
  }
  if (effect.type === EffectType.Freeze) return "Until the end of the freezing team's next turn";
  if (effect.duration === Infinity) return "∞";
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
    case EffectType.VowLink:
      return "Monk takes counterattack damage for this ally or counterattacks in their place using his own attack. The link ends after one use.";
    case EffectType.Protection:
      if (effect.protector && effect.protector.health <= 0) {
        return "Damage sharing has ended because the protector fell.";
      }
      return `${effect.protector?.name ?? "The protector"} absorbs up to half the incoming combat damage, capped by their remaining HP. This card takes the rest.`;
    case EffectType.Mark:
      return "The marked target takes 50% more damage from normal attacks.";
    case EffectType.Empowered:
      return "This card cannot gain buffs or debuffs. Its attacks bypass damage reduction and damage sharing.";
    case EffectType.ThunderMark:
      return "Zeus’s lightning deals 1 damage to an unmarked target and 2 to a target he has already marked.";
    case EffectType.LastHunt:
      return "This card stays in play at 0 HP. It can attack and be targeted, but cannot take damage, heal, counterattack, or receive new debuffs. Existing debuffs remain active.";
    case EffectType.Taunt:
      return `This card can only attack ${effect.source?.name ?? "the unit that taunted it"}.`;
    case EffectType.Fear:
        return `This card cannot choose ${effect.source?.name ?? "the source of fear"} for a normal attack if it has a legal target it does not fear. Counterattacks and bonus hits still work.`;
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
