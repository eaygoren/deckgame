import type { Card } from "../game/Card";
import { Characters } from "../shared/constants/characters";

const tagColors = {
  Arcane: "#c3a4ff",
  Celestial: "#ffe29a",
  Construct: "#9ed4dc",
  Creature: "#e4b88b",
  Fae: "#f5afe0",
  Human: "#dfd5c5",
  Infernal: "#ff987c",
  Lord: "#dba9ef",
  Martial: "#ffbd66",
  Mythic: "#9dbaff",
  Primal: "#9fdb85",
  Shapeshifter: "#e6a0ad",
  Spirit: "#94e4d6",
  Undead: "#b8b1cd",
};

type CardTag = keyof typeof tagColors;
export const tagNames = Object.keys(tagColors) as CardTag[];

const tagIconPaths: Record<CardTag, string> = {
  Arcane: "M12 2.8 20.3 12 12 21.2 3.7 12ZM12 6.8v10.4m-3-3.5 6-3.4",
  Celestial: "M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM4 15c-1 2 1 3 4 2 4-1 10-4 12-7 2-2 0-3-2-2M15 3h.1M21 16h.1",
  Construct: "M9 3.8h6l.8 2.8 2.6 1 .9-.3 2 3.5-1.9 1.9v1.7l1.1 1-2 3.4-2.8-.7-.8 2.1h-5.8l-.8-2.1-2.8.7-2-3.4 1.1-1v-1.7l-1.9-1.9 2-3.5.9.3 2.6-1Zm3 5.3a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Z",
  Creature: "M7.2 17.2c0-2.3 2.7-5.2 4.8-5.2s4.8 2.9 4.8 5.2c0 1.3-1 2-2 2s-1.8-.6-2.8-.6-1.9.6-2.8.6-2-.7-2-2ZM4.8 10.8l.5 1.5M9 6.3l.3 2m5.7-2-.3 2m4.5 2.5-.5 1.5",
  Fae: "M5 4c5 3 12 1 14 6 2 5-1 10-5 10-2 0-3-1-3-3 0-3 4-3 4-6 0-2-2-3-4-3M5 4c0 5 2 8 5 9m-5 5h.1M20 4h.1",
  Human: "M12 4a4 4 0 1 0 0 8 4 4 0 1 0 0-8ZM4 21v-2c0-6 16-6 16 0v2",
  Infernal: "M12 3v18m-7-16v4a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V5M3 7l2-2 2 2m3-2 2-2 2 2m3 2 2-2 2 2",
  Lord: "M12 8v13m-2 0h4M12 3l3 3-3 3-3-3Zm-6 4 2 4h8l2-4",
  Martial: "M3 9c5 2 13 2 18 0l-1 5c-5 2-11 2-16 0Zm7 2 1 4h2l1-4m-3 4-4 6m6-6 4 6",
  Mythic: "M4.3 17 8 5l7 5 4.7 8M3.3 17h2m-1-1v2M7 5h2M8 4v2m6 4h2m-1-1v2m3.7 7h2m-1-1v2",
  Primal: "M4 19c0-4 2-9 5-13-1 5-1 8-5 13Zm5.5 0c.4-4.6 2.4-9.1 5.3-13-.7 5.3-1.8 9.6-5.3 13Zm5.5 0c.6-4.3 2.5-8.8 5.2-12.7-.5 5.2-1.6 9.5-5.2 12.7Z",
  Shapeshifter: "M2.5 12c2.7-4.1 5.9-6 9.5-6s6.8 1.9 9.5 6c-2.7 4.1-5.9 6-9.5 6s-6.8-1.9-9.5-6ZM12 8.5c-2.7 2-2.7 5 0 7 2.7-2 2.7-5 0-7ZM6 5l2-2m8 18 2-2",
  Spirit: "M5 20v-8a7 7 0 0 1 14 0v8l-3.5-2.5L12 20l-3.5-2.5ZM9 11v1m6-1v1",
  Undead: "M5 21h14M7 21V8a5 5 0 0 1 10 0v13M12 8v7m-3-4h6",
};

const cardTags: Partial<Record<string, readonly [CardTag, CardTag?]>> = {
  [Characters.Aerwyn]: ["Fae"],
  [Characters.Alien]: ["Creature"],
  [Characters.Archangel]: ["Celestial"],
  [Characters.Archmage]: ["Human", "Arcane"],
  [Characters.Assassin]: ["Human", "Martial"],
  [Characters.Banshee]: ["Spirit", "Infernal"],
  [Characters.Cerberus]: ["Creature", "Infernal"],
  [Characters.Cyborg]: ["Human", "Construct"],
  [Characters.Dragon]: ["Creature", "Mythic"],
  [Characters.Elf]: ["Fae"],
  [Characters.Ent]: ["Creature", "Fae"],
  [Characters.Ganesha]: ["Celestial", "Mythic"],
  [Characters.Ghost]: ["Undead", "Spirit"],
  [Characters.Gunslinger]: ["Human"],
  [Characters.Herbalist]: ["Human"],
  [Characters.Illusionist]: ["Human", "Arcane"],
  [Characters.Joker]: ["Human"],
  [Characters.Knight]: ["Human"],
  [Characters.Lich]: ["Undead", "Arcane"],
  [Characters.Luxen]: ["Celestial"],
  [Characters.Mimic]: ["Creature", "Shapeshifter"],
  [Characters.Monk]: ["Human", "Martial"],
  [Characters.Necromancer]: ["Undead", "Lord"],
  [Characters.Ninja]: ["Human", "Martial"],
  [Characters.Phoenix]: ["Creature", "Mythic"],
  [Characters.Reaper]: ["Lord", "Infernal"],
  [Characters.Samurai]: ["Human", "Martial"],
  [Characters.Scorpion]: ["Creature", "Primal"],
  [Characters.Shaman]: ["Human", "Primal"],
  [Characters.Siren]: ["Creature", "Mythic"],
  [Characters.Vampire]: ["Undead"],
  [Characters.Void]: ["Celestial"],
  [Characters.Werewolf]: ["Shapeshifter", "Primal"],
  [Characters.Wukong]: ["Creature", "Mythic"],
  [Characters.Zeus]: ["Celestial", "Mythic"],
  [Characters.Zombie]: ["Undead"],
};

export function getCardTags(card: Card): readonly CardTag[] {
  return (card.isZombified || card.skill ? cardTags[card.name] : undefined)?.filter(tag => tag !== undefined) ?? [];
}

export function createTagIcon(tag: CardTag): SVGSVGElement {
  const namespace = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(namespace, "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(namespace, "path");
  path.setAttribute("d", tagIconPaths[tag]);
  icon.append(path);
  icon.classList.add("tag-icon");
  icon.style.color = tagColors[tag];
  return icon;
}

export function renderCardTags(container: HTMLElement, card: Card): void {
  const tags = getCardTags(card);
  container.hidden = tags.length === 0;
  container.replaceChildren();
  for (const tag of tags) {
    const badge = document.createElement("span");
    badge.style.color = tagColors[tag];
    badge.append(createTagIcon(tag), tag);
    container.append(badge);
  }
}
