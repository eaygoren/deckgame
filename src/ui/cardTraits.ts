import type { Card } from "../game/Card";
import { AttackType, ClassType, Rarity, UnitType } from "../shared/enums";
import { EffectType } from "../shared/interfaces/skillInterfaces";

export const rarityNames = {
  [Rarity.Legendary]: "Legendary",
  [Rarity.Rare]: "Rare",
  [Rarity.Common]: "Common",
};

const rarityPaths = {
  [Rarity.Common]: "M17.2 12a5.2 5.2 0 1 0-10.4 0 5.2 5.2 0 1 0 10.4 0Z",
  [Rarity.Rare]: "m12 5 7 7-7 7-7-7Z",
  [Rarity.Legendary]: "m12 3 7.8 4.5v9L12 21l-7.8-4.5v-9Zm0 5 4 4-4 4-4-4Z",
};

export function createRarityIcon(rarity: Rarity): SVGSVGElement {
  const namespace = "http://www.w3.org/2000/svg";
  const badge = document.createElementNS(namespace, "svg");
  badge.classList.add("rarity-icon");
  badge.dataset.rarity = rarity;
  badge.setAttribute("viewBox", "0 0 24 24");
  badge.setAttribute("aria-hidden", "true");
  badge.setAttribute("focusable", "false");
  const rarityShape = document.createElementNS(namespace, "path");
  rarityShape.setAttribute("d", rarityPaths[rarity]);
  badge.append(rarityShape);
  return badge;
}

export function renderCardHeader(art: Element, card: Card): void {
  const namespace = "http://www.w3.org/2000/svg";
  const badge = createRarityIcon(card.rarity);
  badge.classList.add("card-badge");
  badge.removeAttribute("aria-hidden");
  badge.setAttribute("role", "img");
  badge.setAttribute("aria-label", rarityNames[card.rarity]);
  const title = document.createElementNS(namespace, "title");
  title.textContent = rarityNames[card.rarity];
  badge.prepend(title);
  art.prepend(badge);
  if (card.unitType !== UnitType.Leader) return;
  const crown = createLeaderIcon();
  crown.classList.add("card-leader-crown");
  badge.after(crown);
}

export function createLeaderIcon(): SVGSVGElement {
  const namespace = "http://www.w3.org/2000/svg";
  const crown = document.createElementNS(namespace, "svg");
  crown.classList.add("leader-icon");
  crown.setAttribute("viewBox", "0 0 24 24");
  crown.setAttribute("aria-hidden", "true");
  crown.setAttribute("focusable", "false");
  const path = document.createElementNS(namespace, "path");
  path.setAttribute("d", "M3.5 7.5 8 11l4-6 4 6 4.5-3.5L18 17H6L3.5 7.5ZM6 20h12M12 12.5l1.5 1.5-1.5 1.5-1.5-1.5Z");
  crown.append(path);
  return crown;
}

export const classNames = {
  [ClassType.Mage]: "Mage",
  [ClassType.Rogue]: "Rogue",
  [ClassType.Tank]: "Tank",
  [ClassType.Warrior]: "Warrior",
};

const classPaths = {
  [ClassType.Mage]: [
    "M12 6.4c-2.6-2-5.8-2.5-8.8-1.4v13.3c3-1.1 6.2-.6 8.8 1.4 2.6-2 5.8-2.5 8.8-1.4V5c-3-1.1-6.2-.6-8.8 1.4Zm0 0v13.3M6 9c1-.1 2 .1 3 .5M6 12.5c1-.1 2 .1 3 .5m6-3.5 1-1.3 1 1.3 1.3 1-1.3 1-1 1.3-1-1.3-1.3-1Z",
  ],
  [ClassType.Rogue]: [
    "M3.2 8c3.2-2.4 6.1-2.5 8.8-.5 2.7-2 5.6-1.9 8.8.5l-.8 5.3c-.4 2.7-3.8 4.2-6.1 2.5l-1.9-1.4-1.9 1.4c-2.3 1.7-5.7.2-6.1-2.5ZM6.4 10.3c1.3-.4 2.6 0 3.5 1.2-1.3.5-2.6.1-3.5-1.2Zm11.2 0c-1.3-.4-2.6 0-3.5 1.2 1.3.5 2.6.1 3.5-1.2Z",
  ],
  [ClassType.Tank]: [
    "M12 3.1c2.5 1.5 5.1 2.2 7.7 2.5v5.2c0 4.5-2.6 7.7-7.7 10.1-5.1-2.4-7.7-5.6-7.7-10.1V5.6c2.6-.3 5.2-1 7.7-2.5Z",
    "m12 7.5 3.9 1.2v2.1c0 2.5-1.3 4.4-3.9 5.9-2.6-1.5-3.9-3.4-3.9-5.9V8.7Z",
  ],
  [ClassType.Warrior]: [
    "M10.6 10.1V7.6L12 3l1.4 4.6v2.5M10.6 13.9v3.6m2.8-3.6v3.6M8.5 17.5h7M12 17.5v4m-1.1 0h2.2",
    "M10.6 17.5V7.6L12 3l1.4 4.6v9.9M8.5 17.5h7M12 17.5v4m-1.1 0h2.2",
  ],
};

export function createClassIcon(type: ClassType): SVGSVGElement {
  const namespace = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(namespace, "svg");
  icon.classList.add("class-icon");
  icon.dataset.cardClass = type;
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");
  classPaths[type].forEach((shape, index) => {
    const path = document.createElementNS(namespace, "path");
    path.setAttribute("d", shape);
    if (type === ClassType.Warrior) path.setAttribute("transform", `rotate(${index === 0 ? -43 : 43} 12 12)`);
    icon.append(path);
  });
  return icon;
}

export const attackTypeNames = {
  [AttackType.Ranged]: "Ranged",
  [AttackType.Melee]: "Melee",
};

export function createAttackTypeIcon(type: AttackType): SVGSVGElement {
  const namespace = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(namespace, "svg");
  icon.classList.add("attack-type-icon");
  icon.dataset.attackType = type;
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");
  const main = document.createElementNS(namespace, "path");
  if (type === AttackType.Melee) {
    main.setAttribute("d", "M10 15.8V7.4L12 2.5l2 4.9v8.4Zm2-8.2v5.6m-4.7 2.6h9.4M11 16v4.4m2-4.4v4.4m-3.5 0h5");
    main.setAttribute("transform", "rotate(42 12 12)");
    icon.append(main);
  } else {
    main.setAttribute("d", "M5 19 20.5 3.5m-6 .3 6-.3-.3 6M3.2 11.3l4.7-4.7m5 14.2 4.7-4.7");
    const feathers = document.createElementNS(namespace, "path");
    feathers.setAttribute("d", "M5 19l-.3-3.8 3-3 .3 3.8m-3 3 3.8.3 3-3-3.8-.3");
    feathers.setAttribute("transform", "rotate(180 6.5 17.5)");
    icon.append(main, feathers);
  }
  return icon;
}

function labelTraitBadge(badge: SVGSVGElement, name: string): void {
  badge.classList.add("card-trait-badge");
  badge.removeAttribute("aria-hidden");
  badge.setAttribute("role", "img");
  badge.setAttribute("aria-label", name);
  const title = document.createElementNS(badge.namespaceURI, "title");
  title.textContent = name;
  badge.prepend(title);
}

export function cardClasses(card: Card): ClassType[] {
  const classes = [card.classType];
  if (card.classType !== ClassType.Tank && card.skill?.passiveEffect?.(EffectType.IronWall)) {
    classes.push(ClassType.Tank);
  }
  return classes;
}

export function cardTraitNames(card: Card): string[] {
  const classLabels = cardClasses(card).map(type =>
    card.isZombified ? classNames[type] + " (class ability disabled)" : classNames[type]);
  return [...classLabels, attackTypeNames[card.attackType]];
}

export function renderCardDetailTraits(container: Element, card: Card): void {
  const labels = cardTraitNames(card);
  const traits = cardClasses(card).map((type, index) => ({ label: labels[index], icon: createClassIcon(type) }));
  traits.push(
    { label: attackTypeNames[card.attackType], icon: createAttackTypeIcon(card.attackType) },
    { label: rarityNames[card.rarity], icon: createRarityIcon(card.rarity) },
  );
  if (card.unitType === UnitType.Leader) traits.unshift({ label: "Leader", icon: createLeaderIcon() });
  container.replaceChildren(...traits.flatMap(({ label, icon }, index) => {
    const item = document.createElement("span");
    item.className = "detail-trait";
    const text = document.createElement("span");
    text.textContent = label;
    item.append(text, icon);
    if (index === 0) return [item];

    const separator = document.createElement("span");
    separator.className = "detail-trait-separator";
    separator.setAttribute("aria-hidden", "true");
    separator.textContent = "·";
    return [separator, item];
  }));
}

export function renderCardTraitBadges(container: Element, card: Card): void {
  const classes = cardClasses(card);
  const key = [...classes, card.attackType, card.isZombified].join(" ");
  if (container.getAttribute("data-traits") === key) return;

  const labels = cardTraitNames(card);
  const badges = classes.map((type, index) => {
    const badge = createClassIcon(type);
    labelTraitBadge(badge, labels[index]);
    badge.classList.toggle("is-inactive", card.isZombified);
    return badge;
  });
  const attackBadge = createAttackTypeIcon(card.attackType);
  labelTraitBadge(attackBadge, attackTypeNames[card.attackType]);
  container.setAttribute("data-traits", key);
  container.replaceChildren(...badges, attackBadge);
}
