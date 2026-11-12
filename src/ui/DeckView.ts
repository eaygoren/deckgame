import { Card, LeaderCard } from "../game/Card";
import { Deck } from "../game/Deck";
import { CharacterList } from "../shared/constants/characters";
import { AttackType, ClassType, Rarity, UnitType } from "../shared/enums";
import { AvailabilityType } from "../shared/interfaces";
import { attackTypeNames, cardClasses, classNames, createAttackTypeIcon, createClassIcon, createLeaderIcon, createRarityIcon, rarityNames, renderCardDetailTraits, renderCardHeader, renderCardTraitBadges } from "./cardTraits";
import { addMouseTilt } from "./cardTilt";
import { renderAbilityDescription } from "./abilityDescription";
import { renderAbilityTitle } from "./abilityTitle";

const deckSize = 10;
const limits = { [Rarity.Legendary]: 2, [Rarity.Rare]: 4, [Rarity.Common]: deckSize };

function addIconFilterOptions<T extends string>(
  select: HTMLSelectElement,
  values: T[],
  names: Record<T, string>,
  createIcon: (value: T) => SVGSVGElement | undefined,
): void {
  const supportsOptionIcons = CSS.supports("appearance", "base-select");
  if (supportsOptionIcons) {
    const button = document.createElement("button");
    button.type = "button";
    button.append(document.createElement("selectedcontent"));
    select.prepend(button);
  }
  for (const value of values) {
    const option = new Option(names[value], value);
    const icon = supportsOptionIcons ? createIcon(value) : undefined;
    if (icon) option.append(icon);
    select.add(option);
  }
}

export class DeckView {
  private readonly selected = new Set<Card>();
  private readonly cards = Object.values(CharacterList)
    .filter(character => character.availabilityType === AvailabilityType.Playable)
    .map(character => character.unitType === UnitType.Leader ? new LeaderCard(character) : new Card(character));
  private readonly tiles = new Map<Card, { tile: HTMLElement; action: HTMLButtonElement; reason: HTMLElement }>();
  private readonly search: HTMLInputElement;
  private readonly unit: HTMLSelectElement;
  private readonly cardClass: HTMLSelectElement;
  private readonly attackType: HTMLSelectElement;
  private readonly rarity: HTMLSelectElement;
  private readonly details: HTMLDialogElement;
  private readonly toggle: HTMLButtonElement;
  private readonly confirm: HTMLButtonElement;
  private readonly status: HTMLElement;
  private busy = false;

  constructor(private readonly root: HTMLElement, startMatch: (deck: Deck) => Promise<void>) {
    this.search = root.querySelector("#card-search")!;
    this.unit = root.querySelector("#card-unit")!;
    this.cardClass = root.querySelector("#card-class")!;
    this.attackType = root.querySelector("#card-attack-type")!;
    this.rarity = root.querySelector("#card-rarity")!;
    this.details = root.querySelector("#card-details")!;
    this.toggle = root.querySelector("#deck-toggle")!;
    this.confirm = root.querySelector("#confirm-deck")!;
    this.status = root.querySelector("#deck-status")!;
    const panel = root.querySelector("#deck-panel")!;

    addIconFilterOptions(this.unit, [UnitType.Leader, UnitType.Regular],
      { [UnitType.Leader]: "Leader", [UnitType.Regular]: "Unit" },
      type => type === UnitType.Leader ? createLeaderIcon() : undefined);
    addIconFilterOptions(this.cardClass, Object.values(ClassType), classNames, createClassIcon);
    addIconFilterOptions(this.attackType, Object.values(AttackType), attackTypeNames, createAttackTypeIcon);
    addIconFilterOptions(this.rarity, Object.values(Rarity), rarityNames, createRarityIcon);

    const grid = root.querySelector("#card-grid")!;
    for (const card of this.cards) grid.append(this.createTile(card));
    const sortField = root.querySelector<HTMLSelectElement>("#card-sort")!;
    const directionButton = root.querySelector<HTMLButtonElement>("#sort-direction")!;
    let ascending = true;
    const sortCards = () => {
      const field = sortField.value;
      const sorted = [...this.cards].sort((a, b) => {
        const byName = a.name.localeCompare(b.name, "en");
        const difference = field === "attack" ? a.attack - b.attack
          : field === "health" ? a.health - b.health : byName;
        return (ascending ? difference : -difference) || byName;
      });
      for (const card of sorted) grid.append(this.tiles.get(card)!.tile);
    };
    sortField.addEventListener("change", sortCards);
    directionButton.addEventListener("click", () => {
      ascending = !ascending;
      const direction = ascending ? "Ascending" : "Descending";
      directionButton.textContent = ascending ? "↑" : "↓";
      directionButton.setAttribute("aria-label", "Sort direction: " + direction);
      directionButton.title = direction + " order";
      sortCards();
    });
    sortCards();
    this.search.addEventListener("input", () => this.filter());
    for (const filter of [this.unit, this.cardClass, this.attackType, this.rarity]) {
      filter.addEventListener("change", () => this.filter());
    }

    const setPanelOpen = (expanded: boolean) => {
      panel.classList.toggle("is-open", expanded);
      this.toggle.setAttribute("aria-expanded", String(expanded));
    };
    this.toggle.addEventListener("click", () => {
      setPanelOpen(!panel.classList.contains("is-open"));
    });
    document.addEventListener("click", event => {
      if (event.target instanceof Node && !panel.contains(event.target) && !this.toggle.contains(event.target)) {
        setPanelOpen(false);
      }
    });

    this.confirm.addEventListener("click", async () => {
      const leader = this.leader;
      if (this.busy || this.selected.size !== deckSize || !leader) return;
      this.busy = true;
      this.render();
      const deck = new Deck();
      deck.setLeader(leader);
      for (const card of this.selected) {
        if (card !== leader) deck.addCard(card);
      }

      try {
        await startMatch(deck);
        this.busy = false;
        this.render();
      } catch (error) {
        console.error(error);
        this.busy = false;
        this.render();
        this.status.textContent = "Could not start the match. Try again.";
      }
    });

    this.filter();
    this.render();
  }

  private get leader(): LeaderCard | undefined {
    return [...this.selected].find(card => card instanceof LeaderCard) as LeaderCard | undefined;
  }

  private filter(): void {
    const query = this.search.value.trim().toLowerCase();
    let count = 0;
    for (const [card, { tile }] of this.tiles) {
      const visible = card.name.toLowerCase().includes(query)
        && (!this.unit.value || card.unitType === this.unit.value)
        && (!this.cardClass.value || cardClasses(card).some(type => type === this.cardClass.value))
        && (!this.attackType.value || card.attackType === this.attackType.value)
        && (!this.rarity.value || card.rarity === this.rarity.value);
      tile.hidden = !visible;
      if (visible) count++;
    }
    this.root.querySelector("#collection-count")!.textContent = count + " / " + this.cards.length + " cards";
    this.root.querySelector<HTMLElement>("#collection-empty")!.hidden = count > 0;
  }

  private portrait(card: Card): HTMLImageElement {
    const img = document.createElement("img");
    img.src = import.meta.env.BASE_URL + "assets/characters/" + card.cover + ".png";
    img.alt = "";
    img.loading = "lazy";
    return img;
  }

  private createTile(card: Card): HTMLElement {
    const tile = document.createElement("article");
    tile.className = "collection-card";
    tile.dataset.rarity = card.rarity;
    const face = document.createElement("div");
    face.className = "collection-card-face";
    const action = document.createElement("button");
    action.type = "button";
    action.className = "card-action";
    action.innerHTML = `
      <div class="card-art">
        <small class="card-reason"></small>
        <span class="card-mark" aria-hidden="true"></span>
      </div>
      <div class="card-caption">
        <strong></strong>
        <div class="card-meta"></div>
        <div class="card-stats"><span></span><span></span></div>
      </div>`;
    const portrait = this.portrait(card);
    portrait.className = "card-portrait";
    action.prepend(portrait);
    renderCardHeader(action.querySelector(".card-art")!, card);
    action.querySelector("strong")!.textContent = card.name;
    renderCardTraitBadges(action.querySelector(".card-meta")!, card);
    const [attack, health] = action.querySelectorAll(".card-stats span");
    attack.textContent = "⚔ " + card.attack;
    attack.setAttribute("aria-label", "Attack " + card.attack);
    health.textContent = "♥ " + card.health;
    health.setAttribute("aria-label", "HP " + card.health);
    const reason = action.querySelector<HTMLElement>(".card-reason")!;
    action.addEventListener("click", () => {
      if (this.busy || action.getAttribute("aria-disabled") === "true") return;
      if (!this.selected.delete(card)) this.selected.add(card);
      this.render();
    });

    const info = document.createElement("button");
    info.type = "button";
    info.className = "card-info";
    info.textContent = "i";
    info.setAttribute("aria-label", card.name + " card details");
    info.addEventListener("click", () => {
      renderCardDetailTraits(this.details.querySelector("#detail-category")!, card);
      this.details.querySelector("#detail-title")!.textContent = card.name;
      this.details.querySelector("#detail-attack")!.textContent = `⚔ Attack ${card.attack}`;
      this.details.querySelector("#detail-health")!.textContent = `♥ HP ${card.health}`;
      renderAbilityTitle(this.details.querySelector("#detail-skill")!, card.skill?.name);
      renderAbilityDescription(this.details.querySelector("#detail-description")!, card.skill?.description);
      this.details.showModal();
    });
    face.append(action, info);
    tile.append(face);
    addMouseTilt(tile, face);
    this.tiles.set(card, { tile, action, reason });
    return tile;
  }

  private deckEntry(card: Card, tag: "div" | "li"): HTMLElement {
    const row = document.createElement(tag);
    row.className = "deck-entry";
    const name = document.createElement("strong");
    name.textContent = card.name;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Remove " + card.name);
    remove.disabled = this.busy;
    remove.addEventListener("click", () => {
      this.selected.delete(card);
      this.render();
      this.tiles.get(card)?.action.focus({ preventScroll: true });
    });
    row.append(this.portrait(card), name, remove);
    return row;
  }

  private render(): void {
    const leader = this.leader;
    const count = this.selected.size;
    const units = [...this.selected].filter(card => card !== leader);
    const rarityCounts = { [Rarity.Legendary]: 0, [Rarity.Rare]: 0, [Rarity.Common]: 0 };
    for (const card of this.selected) rarityCounts[card.rarity]++;

    for (const [card, { tile, action, reason }] of this.tiles) {
      const picked = this.selected.has(card);
      const blocked = picked ? "" : count >= deckSize ? "Deck is full"
        : card instanceof LeaderCard && leader ? "Leader slot is full"
        : !(card instanceof LeaderCard) && units.length === deckSize - 1 ? "Unit slots are full"
        : rarityCounts[card.rarity] >= limits[card.rarity] ? "Rarity limit reached" : "";
      tile.classList.toggle("is-picked", picked);
      action.setAttribute("aria-pressed", String(picked));
      action.setAttribute("aria-disabled", String(this.busy || Boolean(blocked)));
      action.setAttribute("aria-label", card.name + (blocked ? " · " + blocked : ""));
      action.querySelector(".card-mark")!.textContent = picked ? "✓" : "";
      reason.textContent = blocked || (picked ? "In deck" : "");
    }

    const leaderSlot = this.root.querySelector<HTMLElement>("#deck-leader")!;
    leaderSlot.classList.toggle("empty-slot", !leader);
    leaderSlot.replaceChildren(leader ? this.deckEntry(leader, "div") : "♜  Choose a leader");
    const list = this.root.querySelector("#deck-cards")!;
    list.replaceChildren(...units.map(card => this.deckEntry(card, "li")));
    if (units.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty-units";
      empty.textContent = "Add units from the collection.";
      list.append(empty);
    }

    this.root.querySelector("#deck-count")!.textContent = count + " / " + deckSize;
    this.root.querySelector<HTMLProgressElement>("#deck-progress")!.value = count;
    this.root.querySelector("#deck-limits")!.textContent = "Legendary " + rarityCounts[Rarity.Legendary] + "/2 · Rare " + rarityCounts[Rarity.Rare] + "/4";
    this.toggle.textContent = "My deck · " + count + "/" + deckSize;
    this.confirm.disabled = this.busy || count !== deckSize || !leader;
    const missingUnits = deckSize - 1 - units.length;
    const missing = [leader ? "" : "1 leader", missingUnits > 0 ? missingUnits + (missingUnits === 1 ? " unit" : " units") : ""].filter(Boolean);
    this.status.textContent = this.busy ? "Preparing the arena…" : missing.length ? "Choose " + missing.join(" and ") + " to complete your deck." : "Your deck is ready.";
  }
}
