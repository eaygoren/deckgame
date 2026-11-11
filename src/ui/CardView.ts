import { Card } from "../game/Card";
import { AttackType, Rarity, UnitType } from "../shared/enums";
import { createEffectBadge, effectBadges, effectDetails, effectDuration } from "./battleEffects";

export function battleCardMeta(card: Card): [string, string] {
  return [
    { Mage: "Büyücü", Rogue: "Haydut", Tank: "Tank", Warrior: "Savaşçı" }[card.classType],
    card.attackType === AttackType.Ranged ? "Menzilli" : "Yakın dövüş",
  ];
}

export class CardView {
  readonly element = document.createElement("article");
  readonly action = document.createElement("button");
  readonly info = document.createElement("button");
  private readonly attack = document.createElement("span");
  private readonly health = document.createElement("span");
  private readonly healthBar = document.createElement("progress");
  private readonly effects = document.createElement("div");

  constructor(readonly card: Card, readonly slot: number) {
    this.element.className = "collection-card battle-card";
    this.element.dataset.rarity = card.rarity;
    this.element.dataset.slot = String(slot);
    this.element.style.setProperty("--card-column", String(slot + 1));

    this.action.type = "button";
    this.action.className = "card-action";
    const art = document.createElement("div");
    art.className = "card-art";
    const portrait = document.createElement("img");
    portrait.src = import.meta.env.BASE_URL + "assets/characters/" + card.cover + ".png";
    portrait.alt = "";
    const badge = document.createElement("span");
    badge.className = "card-badge";
    badge.textContent = card.unitType === UnitType.Leader ? "♜ Lider"
      : card.rarity === Rarity.Legendary ? "Efsanevi" : card.rarity === Rarity.Rare ? "Nadir" : "Yaygın";
    this.effects.className = "battle-card-effects";
    art.append(portrait, badge, this.effects);

    const caption = document.createElement("div");
    caption.className = "card-caption";
    const name = document.createElement("strong");
    name.textContent = card.name;
    const meta = document.createElement("div");
    meta.className = "card-meta";
    const cardClass = document.createElement("span");
    const attackType = document.createElement("span");
    [cardClass.textContent, attackType.textContent] = battleCardMeta(card);
    meta.append(cardClass, attackType);
    const stats = document.createElement("div");
    stats.className = "card-stats";
    stats.append(this.attack, this.health);
    this.healthBar.className = "battle-health";
    this.healthBar.setAttribute("aria-label", "Can");
    caption.append(name, meta, stats, this.healthBar);
    this.action.append(art, caption);

    this.info.type = "button";
    this.info.className = "card-info";
    this.info.textContent = "i";
    this.info.setAttribute("aria-label", card.name + " kart bilgisi");
    this.element.append(this.action, this.info);
    this.updateStats();
  }

  setState(state: "attacker" | "target" | "locked" | "frozen" | "idle", actionable: boolean): void {
    this.element.dataset.state = state;
    this.action.setAttribute("aria-disabled", String(!actionable));
    this.action.setAttribute("aria-pressed", String(state === "attacker"));
  }

  updateStats(): void {
    this.attack.textContent = "⚔ " + this.card.attack;
    this.health.textContent = "♥ " + this.card.health;
    this.healthBar.max = Math.max(1, this.card.maxHealth);
    this.healthBar.value = this.card.health;
    this.action.setAttribute("aria-label", this.card.name + ", saldırı " + this.card.attack + ", can " + this.card.health);
    this.updateCover();
  }

  updateCover(): void {
    const badges = this.card.activeEffects.map(effect => {
      const badge = effectBadges[effect.type];
      const icon = createEffectBadge(badge);
      const name = badge?.label ?? effect.type;
      icon.title = [name, effectDuration(effect), effectDetails(effect)].filter(Boolean).join(" · ");
      icon.setAttribute("aria-label", icon.title);
      return icon;
    });
    this.effects.replaceChildren(...badges);
    this.element.dispatchEvent(new Event("effectschange"));
  }
}
