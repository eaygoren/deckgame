import { Card, LeaderCard } from "../game/Card";
import { Deck } from "../game/Deck";
import { CharacterList } from "../shared/constants/characters";
import { AttackType, ClassType, Rarity, UnitType } from "../shared/enums";
import { AvailabilityType } from "../shared/interfaces";

const deckSize = 10;
const limits = { [Rarity.Legendary]: 2, [Rarity.Rare]: 4, [Rarity.Common]: deckSize };
const rarityNames = { [Rarity.Legendary]: "Efsanevi", [Rarity.Rare]: "Nadir", [Rarity.Common]: "Yaygın" };
const classNames = { [ClassType.Mage]: "Büyücü", [ClassType.Rogue]: "Haydut", [ClassType.Tank]: "Tank", [ClassType.Warrior]: "Savaşçı" };

export class DeckView {
  private readonly selected = new Set<Card>();
  private readonly cards = Object.values(CharacterList)
    .filter(character => character.availabilityType === AvailabilityType.Playable)
    .map(character => character.unitType === UnitType.Leader ? new LeaderCard(character) : new Card(character));
  private readonly tiles = new Map<Card, { tile: HTMLElement; action: HTMLButtonElement; reason: HTMLElement }>();
  private readonly search: HTMLInputElement;
  private readonly unit: HTMLSelectElement;
  private readonly cardClass: HTMLSelectElement;
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
    this.rarity = root.querySelector("#card-rarity")!;
    this.details = root.querySelector("#card-details")!;
    this.toggle = root.querySelector("#deck-toggle")!;
    this.confirm = root.querySelector("#confirm-deck")!;
    this.status = root.querySelector("#deck-status")!;
    const panel = root.querySelector("#deck-panel")!;

    for (const type of Object.values(ClassType)) this.cardClass.add(new Option(classNames[type], type));
    for (const rarity of Object.values(Rarity)) this.rarity.add(new Option(rarityNames[rarity], rarity));

    const grid = root.querySelector("#card-grid")!;
    for (const card of this.cards) grid.append(this.createTile(card));
    const sortField = root.querySelector<HTMLSelectElement>("#card-sort")!;
    const directionButton = root.querySelector<HTMLButtonElement>("#sort-direction")!;
    let ascending = true;
    const sortCards = () => {
      const field = sortField.value;
      const sorted = [...this.cards].sort((a, b) => {
        const byName = a.name.localeCompare(b.name, "tr");
        const difference = field === "attack" ? a.attack - b.attack
          : field === "health" ? a.health - b.health : byName;
        return (ascending ? difference : -difference) || byName;
      });
      for (const card of sorted) grid.append(this.tiles.get(card)!.tile);
    };
    sortField.addEventListener("change", sortCards);
    directionButton.addEventListener("click", () => {
      ascending = !ascending;
      const direction = ascending ? "Artan" : "Azalan";
      directionButton.textContent = ascending ? "↑" : "↓";
      directionButton.setAttribute("aria-label", "Sıralama yönü: " + direction);
      directionButton.title = direction + " sıralama";
      sortCards();
    });
    sortCards();
    this.search.addEventListener("input", () => this.filter());
    for (const filter of [this.unit, this.cardClass, this.rarity]) {
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
        this.status.textContent = "Maç başlatılamadı. Tekrar deneyebilirsin.";
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
        && (!this.cardClass.value || card.classType === this.cardClass.value)
        && (!this.rarity.value || card.rarity === this.rarity.value);
      tile.hidden = !visible;
      if (visible) count++;
    }
    this.root.querySelector("#collection-count")!.textContent = count + " / " + this.cards.length + " kart";
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
    const action = document.createElement("button");
    action.type = "button";
    action.className = "card-action";
    action.innerHTML = `
      <div class="card-art">
        <span class="card-badge"></span>
        <small class="card-reason"></small>
        <span class="card-mark" aria-hidden="true"></span>
      </div>
      <div class="card-caption">
        <strong></strong>
        <div class="card-meta"><span></span><span></span></div>
        <div class="card-stats"><span></span><span></span></div>
      </div>`;
    action.querySelector(".card-art")!.prepend(this.portrait(card));
    action.querySelector(".card-badge")!.textContent = card instanceof LeaderCard ? "♜ Lider" : rarityNames[card.rarity];
    action.querySelector("strong")!.textContent = card.name;
    const [cardClass, attackType] = action.querySelectorAll(".card-meta span");
    cardClass.textContent = classNames[card.classType];
    attackType.textContent = card.attackType === AttackType.Ranged ? "Menzilli" : "Yakın dövüş";
    const [attack, health] = action.querySelectorAll(".card-stats span");
    attack.textContent = "⚔ " + card.attack;
    attack.setAttribute("aria-label", "Saldırı " + card.attack);
    health.textContent = "♥ " + card.health;
    health.setAttribute("aria-label", "Can " + card.health);
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
    info.setAttribute("aria-label", card.name + " kart bilgisi");
    info.addEventListener("click", () => {
      this.details.querySelector("#detail-category")!.textContent = rarityNames[card.rarity] + " · " + classNames[card.classType];
      this.details.querySelector("#detail-title")!.textContent = card.name;
      this.details.querySelector("#detail-attack")!.textContent = `⚔ Hasar ${card.attack}`;
      this.details.querySelector("#detail-health")!.textContent = `♥ Can ${card.health}`;
      this.details.querySelector("#detail-skill")!.textContent = card.skill?.name ?? "Özel yetenek";
      this.details.querySelector("#detail-description")!.textContent = card.skill?.description ?? "Bu kartın özel yeteneği yok.";
      this.details.showModal();
    });
    tile.append(action, info);
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
    remove.setAttribute("aria-label", card.name + " kartını çıkar");
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
      const blocked = picked ? "" : count >= deckSize ? "Deste dolu"
        : card instanceof LeaderCard && leader ? "Lider yuvası dolu"
        : !(card instanceof LeaderCard) && units.length === deckSize - 1 ? "Birlik yuvaları dolu"
        : rarityCounts[card.rarity] >= limits[card.rarity] ? "Nadirlik sınırı dolu" : "";
      tile.classList.toggle("is-picked", picked);
      action.setAttribute("aria-pressed", String(picked));
      action.setAttribute("aria-disabled", String(this.busy || Boolean(blocked)));
      action.setAttribute("aria-label", card.name + (blocked ? " · " + blocked : ""));
      action.querySelector(".card-mark")!.textContent = picked ? "✓" : "";
      reason.textContent = blocked || (picked ? "Destede" : "");
    }

    const leaderSlot = this.root.querySelector<HTMLElement>("#deck-leader")!;
    leaderSlot.classList.toggle("empty-slot", !leader);
    leaderSlot.replaceChildren(leader ? this.deckEntry(leader, "div") : "♜  Bir lider seç");
    const list = this.root.querySelector("#deck-cards")!;
    list.replaceChildren(...units.map(card => this.deckEntry(card, "li")));
    if (units.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty-units";
      empty.textContent = "Koleksiyondan birlik ekle.";
      list.append(empty);
    }

    this.root.querySelector("#deck-count")!.textContent = count + " / " + deckSize;
    this.root.querySelector<HTMLProgressElement>("#deck-progress")!.value = count;
    this.root.querySelector("#deck-limits")!.textContent = "Efsanevi " + rarityCounts[Rarity.Legendary] + "/2 · Nadir " + rarityCounts[Rarity.Rare] + "/4";
    this.toggle.textContent = "Destem · " + count + "/" + deckSize;
    this.confirm.disabled = this.busy || count !== deckSize || !leader;
    const missingUnits = deckSize - 1 - units.length;
    const missing = [leader ? "" : "1 lider", missingUnits > 0 ? missingUnits + " birlik" : ""].filter(Boolean);
    this.status.textContent = this.busy ? "Arena hazırlanıyor…" : missing.length ? missing.join(" ve ") + " daha seç." : "Desten hazır.";
  }
}
