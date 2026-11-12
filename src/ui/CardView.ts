import { Card } from "../game/Card";
import { EffectType } from "../shared/interfaces/skillInterfaces";
import { createEffectBadge, effectBadges, effectDetails, effectDuration } from "./battleEffects";
import { cardTraitNames, renderCardHeader, renderCardTraitBadges } from "./cardTraits";
import { addMouseTilt } from "./cardTilt";

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
    renderCardHeader(art, card);
    this.effects.className = "battle-card-effects";
    art.append(this.effects);

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
    const face = document.createElement("div");
    face.className = "collection-card-face";
    face.append(this.action, this.info);
    this.element.append(face);
    addMouseTilt(this.element, face);
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
    this.info.setAttribute("aria-label", this.card.name + " card details");
    this.attack.textContent = "⚔ " + this.card.attack;
    this.health.textContent = "♥ " + this.card.health;
    this.action.setAttribute("aria-label", [this.card.name, ...cardTraitNames(this.card), "Attack " + this.card.attack, "HP " + this.card.health].join(", "));
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
    if (badges.length > 1) {
      const label = `${badges.length} active effects`;
      const overflow = createEffectBadge({ label, path: "M6 12h.01M12 12h.01M18 12h.01" });
      overflow.classList.add("effect-overflow");
      overflow.title = badges.map(badge => badge.title).join("\n");
      overflow.setAttribute("aria-label", label);
      badges.push(overflow);
    }
    this.effects.replaceChildren(...badges);
    this.element.dispatchEvent(new Event("effectschange"));
  }
}
