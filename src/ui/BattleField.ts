import { Turn } from "../shared/enums";
import { BroadcastEvents } from "../shared/constants/events";
import { Broadcast } from "../utils/Broadcast";
import { CardView } from "./CardView";
import { renderCardDetailTraits } from "./cardTraits";
import { Card } from "../game/Card";
import { Player } from "../game/Player";
import { clockIconPath, createEffectBadge, effectBadges, effectDetails, effectDuration } from "./battleEffects";
import { renderAbilityDescription } from "./abilityDescription";
import { renderAbilityTitle } from "./abilityTitle";
import { createBattleAbilityStatus, replacementAbilityEffect } from "./battleAbilityBadge";

export class BattleField {
  private readonly playerRow = document.querySelector<HTMLElement>("#player-cards")!;
  private readonly botRow = document.querySelector<HTMLElement>("#bot-cards")!;
  private readonly playerCount = document.querySelector<HTMLElement>("#player-deck-count")!;
  private readonly botCount = document.querySelector<HTMLElement>("#bot-deck-count")!;
  private readonly details = document.querySelector<HTMLDialogElement>("#battle-card-details")!;
  private detailCard?: Card;
  private readonly entries = document.querySelector<HTMLOListElement>("#battle-history-entries")!;
  private readonly emptyHistory = document.querySelector<HTMLElement>("#battle-history-empty")!;

  constructor(broadcast: Broadcast) {
    this.playerRow.replaceChildren();
    this.botRow.replaceChildren();
    this.entries.replaceChildren();
    this.emptyHistory.hidden = false;
    document.querySelectorAll<HTMLDetailsElement>(".battle-panels details").forEach(panel => { panel.open = false; });
    const history = this.entries.closest("details")!;
    history.ontoggle = () => {
      if (history.open) this.entries.scrollTop = this.entries.scrollHeight;
    };
    broadcast.on(BroadcastEvents.COMBAT_HIT, ({ source, target, damage, action, shared }: {
      source: CardView; target: CardView; damage: number; action: string;
      shared?: { name: string; damage: number };
    }) => {
      const split = shared?.damage ? ` ${shared.name} absorbed ${shared.damage} damage.` : "";
      this.addHistoryEntry(`${this.cardLabel(source)} → ${this.cardLabel(target)} · ${action} · ${damage} damage.${split}`);
    });
    broadcast.on(BroadcastEvents.SHOW_ABILITY_MESSAGE, ({ targetView, sourceView, abilityName, copiedAbilityName, message }: {
      targetView?: CardView | null; sourceView?: CardView; abilityName?: string; copiedAbilityName?: string; message: string;
    }) => {
      const actor = sourceView ?? targetView;
      const label = actor ? this.cardLabel(actor) + " · " : "";
      const content: (Node | string)[] = [label];
      if (abilityName) {
        const title = document.createElement("span");
        renderAbilityTitle(title, abilityName);
        content.push(title, " · ");
      }
      if (copiedAbilityName && message.endsWith(copiedAbilityName)) {
        const title = document.createElement("span");
        renderAbilityTitle(title, copiedAbilityName);
        content.push(message.slice(0, -copiedAbilityName.length), title);
      } else {
        content.push(message);
      }
      this.addHistoryEntry(...content);
    });
  }

  private cardLabel(view: CardView): string {
    const side = this.playerRow.contains(view.element) ? "You" : "Opponent";
    return `${view.card.name} (${side})`;
  }

  private addHistoryEntry(...content: (Node | string)[]): void {
    const follow = this.entries.scrollHeight - this.entries.scrollTop <= this.entries.clientHeight + 12;
    const item = document.createElement("li");
    item.append(...content);
    this.entries.append(item);
    this.emptyHistory.hidden = true;
    if (follow) this.entries.scrollTop = this.entries.scrollHeight;
  }

  addCard(view: CardView, side: Turn): void {
    const row = side === Turn.Player ? this.playerRow : this.botRow;
    const next = [...row.children].find(child => Number((child as HTMLElement).dataset.slot) > view.slot);
    row.insertBefore(view.element, next ?? null);
    view.info.addEventListener("click", () => this.showCardDetails(view.card, true));
    view.element.addEventListener("effectschange", () => {
      if (this.details.open && this.detailCard === view.card) this.renderCardStatus(view.card, true);
    });
  }

  private showCardDetails(card: Card, inArena = false): void {
    this.detailCard = card;
    this.renderCardStatus(card, inArena);
    this.details.showModal();
  }

  private renderCardStatus(card: Card, inArena: boolean): void {
    this.details.querySelector("#battle-detail-title")!.textContent = card.name;
    renderCardDetailTraits(this.details.querySelector("#battle-detail-meta")!, card);
    renderAbilityTitle(this.details.querySelector("#battle-detail-skill")!, card.skill?.name);
    renderAbilityDescription(this.details.querySelector("#battle-detail-description")!, card.skill?.description);
    this.details.querySelector("#battle-detail-attack")!.textContent = `⚔ Attack ${card.attack}`;
    this.details.querySelector("#battle-detail-health")!.textContent = `♥ HP ${Math.max(0, card.health)}`;
    const fallen = !card.isAlive;
    this.details.querySelector<HTMLElement>("#battle-detail-status")!.hidden = fallen;
    const effects = fallen ? [] : card.activeEffects;
    const replacement = inArena ? replacementAbilityEffect(card) : undefined;
    const entries: HTMLLIElement[] = [];
    for (const effect of effects) {
      const badge = effectBadges[effect.type];
      const duration = document.createElement("span");
      duration.className = "battle-effect-duration";
      const clock = createEffectBadge({ label: "Clock", path: clockIconPath });
      clock.classList.add("effect-clock");
      clock.setAttribute("aria-hidden", "true");
      const remaining = document.createElement("span");
      remaining.textContent = effect.duration === Infinity ? "∞" : String(effect.duration);
      duration.title = effectDuration(effect);
      duration.append(clock, remaining);
      const icon = createEffectBadge(badge);
      const isReplacement = effect.type === replacement;
      if (isReplacement) icon.dataset.abilityStatus = "active";
      const details = effectDetails(effect);
      const entry = this.cardEffectEntry(icon, badge?.label ?? effect.type, isReplacement ? `Active. ${details}` : details, duration);
      if (isReplacement) entries.unshift(entry);
      else entries.push(entry);
    }
    const ability = inArena ? createBattleAbilityStatus(card) : undefined;
    if (ability) {
      const status = document.createElement("span");
      status.className = "battle-effect-duration";
      status.textContent = ability.headCount || ability.status;
      const details = ability.headCount ? `${ability.status}. ${ability.description}` : ability.description;
      entries.unshift(this.cardEffectEntry(ability.badge, ability.name, details, status));
    }
    this.details.querySelector("#battle-detail-effects")!.replaceChildren(...entries);
    this.details.querySelector<HTMLElement>("#battle-effects-empty")!.hidden = entries.length > 0;
  }

  private cardEffectEntry(icon: HTMLSpanElement, label: string, description: string, value: HTMLSpanElement): HTMLLIElement {
    const entry = document.createElement("li");
    icon.setAttribute("aria-hidden", "true");
    const text = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = label;
    text.append(title);
    if (description) {
      const details = document.createElement("small");
      details.textContent = description;
      text.append(details);
    }
    entry.append(icon, text, value);
    return entry;
  }

  updateCardPanels(player: Player, bot: Player): void {
    this.playerCount.textContent = "In deck: " + player.deck.cards.length;
    this.botCount.textContent = "In deck: " + bot.deck.cards.length;
    const fallen = (side: Player) => side.team.filter(card =>
      !card.isAlive && !side.hand.includes(card) && !side.deck.cards.includes(card));
    const deckRows = [...player.deck.cards]
      .sort((a, b) => a.name.localeCompare(b.name, "en"))
      .map(card => this.cardPanelEntry(card));
    const graveRows = [
      ...fallen(player).map(card => this.cardPanelEntry(card, "You")),
      ...fallen(bot).map(card => this.cardPanelEntry(card, "Opponent")),
    ];
    document.querySelector("#battle-deck-cards")!.replaceChildren(...deckRows);
    document.querySelector("#battle-graveyard-cards")!.replaceChildren(...graveRows);
    document.querySelector<HTMLElement>("#battle-deck-empty")!.hidden = deckRows.length > 0;
    document.querySelector<HTMLElement>("#battle-graveyard-empty")!.hidden = graveRows.length > 0;
  }

  private cardPanelEntry(card: Card, side?: string): HTMLLIElement {
    const entry = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-haspopup", "dialog");
    button.addEventListener("click", () => this.showCardDetails(card));
    const portrait = document.createElement("img");
    portrait.src = import.meta.env.BASE_URL + "assets/characters/" + card.cover + ".png";
    portrait.alt = "";
    portrait.loading = "lazy";
    const label = document.createElement("span");
    label.textContent = side ? `${card.name} (${side})` : `${card.name} · ⚔ ${card.attack} · ♥ ${card.health}`;
    button.append(portrait, label);
    entry.append(button);
    return entry;
  }

  setActiveSide(side: Turn | null): void {
    this.playerRow.parentElement!.classList.toggle("is-active", side === Turn.Player);
    this.botRow.parentElement!.classList.toggle("is-active", side === Turn.Bot);
  }
}
