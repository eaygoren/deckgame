import type { Card } from "../game/Card";
import { EffectType } from "../shared/interfaces/skillInterfaces";
import { createAbilityBadge } from "./abilityTitle";

interface BattleAbilityBadge {
  detail: string;
  once?: true;
  replacedBy?: EffectType;
}

const battleAbilityBadges: ReadonlyMap<string, BattleAbilityBadge> = new Map([
  ["Evasion", { detail: "25% chance to dodge and fire a ranged counterattack." }],
  ["Stealth Mode", { detail: "Gains Stealth after surviving damage.", replacedBy: EffectType.Invisible }],
  ["Enhanced Critical", { detail: "Doubles attack critical chance and grants a 25% counter-critical chance." }],
  ["Threefold Bite", { detail: "Active heads depend on current HP." }],
  ["Piercing Shot", { detail: "Bypasses dodges, damage reduction, and damage sharing." }],
  ["Veil of Light", { detail: "Restricts ranged targeting." }],
  ["Shadow Flurry", { detail: "A critical hit can trigger another attack on the same target." }],
  ["Reality Swap", { detail: "Swaps the target's attack and HP before attacking.", once: true }],
  ["Raise Dead", { detail: "Returns a fallen ally to the deck after a kill.", once: true }],
  ["Ashes to Life", { detail: "Turns into an egg after lethal damage.", once: true, replacedBy: EffectType.PhoenixEgg }],
  ["Reforge Protocol", { detail: "Returns to the deck after a lethal attack or counterattack, then comes back Empowered.", once: true, replacedBy: EffectType.Empowered }],
  ["Last Hunt", { detail: "Survives a lethal counterattack at 0 HP.", once: true, replacedBy: EffectType.LastHunt }],
]);

export function replacementAbilityEffect(card: Card): EffectType | undefined {
  return card.skill ? battleAbilityBadges.get(card.skill.name)?.replacedBy : undefined;
}

export function createBattleAbilityStatus(card: Card) {
  const skill = card.skill;
  if (!card.isAlive || card.isZombified || !skill) return;
  const config = battleAbilityBadges.get(skill.name);
  if (!config || (config.replacedBy && card.hasEffect(config.replacedBy))) return;

  const silenced = card.hasEffect(EffectType.Silence);
  const used = config.once && (skill.exhausted || (config.replacedBy === EffectType.PhoenixEgg && card.hasUsedPhoenixRebirth));
  const status = used ? "Used" : silenced ? "Silenced" : config.once || config.replacedBy ? "Ready" : "Active";
  const heads = card.hasThreefoldBite ? card.activeHeadCount() : undefined;
  const headCount = heads === undefined ? "" : `${heads} / 3`;
  const description = [config.detail, status === "Silenced" && "Disabled by Silence."].filter(Boolean).join(" ");

  const badge = createAbilityBadge(skill.name);
  badge.classList.add("effect-pinned");
  badge.dataset.abilityStatus = status.toLowerCase();
  badge.title = [skill.name, status, headCount && `${headCount} active heads`, config.detail].filter(Boolean).join(" · ");
  badge.setAttribute("aria-hidden", "true");

  return { name: skill.name, badge, heads, status, headCount, description };
}
