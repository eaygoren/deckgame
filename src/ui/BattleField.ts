import { Turn } from "../shared/enums";
import { BroadcastEvents } from "../shared/constants/events";
import { Broadcast } from "../utils/Broadcast";
import { battleCardMeta, CardView } from "./CardView";
import { Card } from "../game/Card";
import { Player } from "../game/Player";
import { createEffectBadge, effectBadges, effectDetails, effectDuration } from "./battleEffects";

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
      const split = shared?.damage ? ` ${shared.name} ${shared.damage} hasarı üstlendi.` : "";
      this.addHistoryEntry(`${this.cardLabel(source)} → ${this.cardLabel(target)} · ${action} · ${damage} hasar.${split}`);
    });
    broadcast.on(BroadcastEvents.SHOW_ABILITY_MESSAGE, ({ targetView, sourceView, abilityName, message }: {
      targetView?: CardView | null; sourceView?: CardView; abilityName?: string; message: string;
    }) => {
      const actor = sourceView ?? targetView;
      const label = actor ? this.cardLabel(actor) + " · " : "";
      this.addHistoryEntry(label + (abilityName ? abilityName + " · " : "") + message);
    });
  }

  private cardLabel(view: CardView): string {
    const side = this.playerRow.contains(view.element) ? "Sen" : "Rakip";
    return `${view.card.name} (${side})`;
  }

  private addHistoryEntry(message: string): void {
    const follow = this.entries.scrollHeight - this.entries.scrollTop <= this.entries.clientHeight + 12;
    const item = document.createElement("li");
    item.textContent = message;
    this.entries.append(item);
    this.emptyHistory.hidden = true;
    if (follow) this.entries.scrollTop = this.entries.scrollHeight;
  }

  addCard(view: CardView, side: Turn): void {
    const row = side === Turn.Player ? this.playerRow : this.botRow;
    const next = [...row.children].find(child => Number((child as HTMLElement).dataset.slot) > view.slot);
    row.insertBefore(view.element, next ?? null);
    view.info.addEventListener("click", () => this.showCardDetails(view.card));
    view.element.addEventListener("effectschange", () => {
      if (this.details.open && this.detailCard === view.card) this.renderCardStatus(view.card);
    });
  }

  private showCardDetails(card: Card): void {
    this.details.querySelector("#battle-detail-title")!.textContent = card.name;
    this.details.querySelector("#battle-detail-meta")!.textContent = battleCardMeta(card).join(" · ");
    this.details.querySelector("#battle-detail-skill")!.textContent = card.skill?.name ?? "Özel yetenek";
    this.details.querySelector("#battle-detail-description")!.textContent = card.skill?.description ?? "Bu kartın özel yeteneği yok.";
    this.detailCard = card;
    this.renderCardStatus(card);
    this.details.showModal();
  }

  private renderCardStatus(card: Card): void {
    this.details.querySelector("#battle-detail-attack")!.textContent = `⚔ Hasar ${card.attack}`;
    this.details.querySelector("#battle-detail-health")!.textContent = `♥ Can ${Math.max(0, card.health)}`;
    const fallen = card.health <= 0;
    this.details.querySelector<HTMLElement>("#battle-detail-status")!.hidden = fallen;
    const effects = fallen ? [] : card.activeEffects;
    const entries = effects.map(effect => {
      const badge = effectBadges[effect.type];
      const entry = document.createElement("li");
      const icon = createEffectBadge(badge);
      icon.setAttribute("aria-hidden", "true");

      const text = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = badge?.label ?? effect.type;
      const details = document.createElement("small");
      details.textContent = [effectDuration(effect), effectDetails(effect)].filter(Boolean).join(" · ");
      text.append(title, details);
      entry.append(icon, text);
      return entry;
    });
    this.details.querySelector("#battle-detail-effects")!.replaceChildren(...entries);
    this.details.querySelector<HTMLElement>("#battle-effects-empty")!.hidden = entries.length > 0;
  }

  updateCardPanels(player: Player, bot: Player): void {
    this.playerCount.textContent = "Destede " + player.deck.cards.length;
    this.botCount.textContent = "Destede " + bot.deck.cards.length;
    const fallen = (side: Player) => side.team.filter(card =>
      card.health <= 0 && !side.hand.includes(card) && !side.deck.cards.includes(card));
    const deckRows = [...player.deck.cards]
      .sort((a, b) => a.name.localeCompare(b.name, "tr"))
      .map(card => this.cardPanelEntry(card));
    const graveRows = [
      ...fallen(player).map(card => this.cardPanelEntry(card, "Sen")),
      ...fallen(bot).map(card => this.cardPanelEntry(card, "Rakip")),
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
