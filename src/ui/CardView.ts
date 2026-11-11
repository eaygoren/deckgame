import { Card } from "../game/Card";
import { EffectType } from "../shared/interfaces/skillInterfaces";
import { Rarity, UnitType } from "../shared/enums";
import { createEffectBadge, effectBadges, effectDetails, effectDuration } from "./battleEffects";
import { cardTraitNames, renderCardTraitBadges } from "./cardTraits";

export class CardView {
  readonly element = document.createElement("article");
  readonly action = document.createElement("button");
  readonly info = document.createElement("button");
  private readonly portrait = document.createElement("img");
  private readonly name = document.createElement("strong");
  private readonly meta = document.createElement("div");
  private readonly attack = document.createElement("span");
  private readonly health = document.createElement("span");
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
    this.portrait.className = "card-portrait";
    this.portrait.alt = "";
    const badge = document.createElement("span");
    badge.className = "card-badge";
    badge.textContent = card.unitType === UnitType.Leader ? "♜ Lider"
      : card.rarity === Rarity.Legendary ? "Efsanevi" : card.rarity === Rarity.Rare ? "Nadir" : "Yaygın";
    this.effects.className = "battle-card-effects";
    art.append(badge, this.effects);

    const caption = document.createElement("div");
    caption.className = "card-caption";
    this.meta.className = "card-meta";
    const stats = document.createElement("div");
    stats.className = "card-stats";
    stats.append(this.attack, this.health);
    caption.append(this.name, this.meta, stats);
    this.action.append(this.portrait, art, caption);

    this.info.type = "button";
    this.info.className = "card-info";
    this.info.textContent = "i";
    this.element.append(this.action, this.info);
    this.updateStats();
  }

  setState(state: "attacker" | "target" | "locked" | "frozen" | "idle", actionable: boolean): void {
    this.element.dataset.state = state;
    this.action.setAttribute("aria-disabled", String(!actionable));
    this.action.setAttribute("aria-pressed", String(state === "attacker"));
  }

  updateStats(): void {
    const portrait = import.meta.env.BASE_URL + "assets/characters/" + this.card.cover + ".png";
    if (this.portrait.getAttribute("src") !== portrait) this.portrait.src = portrait;
    this.name.textContent = this.card.name;
    renderCardTraitBadges(this.meta, this.card);
    this.info.setAttribute("aria-label", this.card.name + " kart bilgisi");
    this.attack.textContent = "⚔ " + this.card.attack;
    this.health.textContent = "♥ " + this.card.health;
    this.action.setAttribute("aria-label", [this.card.name, ...cardTraitNames(this.card), "saldırı " + this.card.attack, "can " + this.card.health].join(", "));
    this.updateCover();
  }

  updateCover(): void {
    this.element.classList.toggle("is-invisible", this.card.hasEffect(EffectType.Invisible));
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
