import type { Card } from "../game/Card";
import { AttackType, ClassType } from "../shared/enums";
import { EffectType } from "../shared/interfaces/skillInterfaces";

export const classNames = {
  [ClassType.Mage]: "Büyücü",
  [ClassType.Rogue]: "Haydut",
  [ClassType.Tank]: "Tank",
  [ClassType.Warrior]: "Savaşçı",
};

const attackTypeNames = {
  [AttackType.Ranged]: "Menzilli",
  [AttackType.Melee]: "Yakın dövüş",
};

export function cardClasses(card: Card): ClassType[] {
  const classes = [card.classType];
  if (card.classType !== ClassType.Tank && card.skill?.passiveEffect?.(EffectType.IronWall)) {
    classes.push(ClassType.Tank);
  }
  return classes;
}

export function cardTraitNames(card: Card): string[] {
  const classLabels = cardClasses(card).map(type =>
    card.isZombified ? classNames[type] + " (sınıf yeteneği devre dışı)" : classNames[type]);
  return [...classLabels, attackTypeNames[card.attackType]];
}

export function renderCardTraitBadges(container: Element, card: Card): void {
  const traits = [...cardClasses(card), card.attackType];
  const key = [...traits, card.isZombified].join(" ");
  if (container.getAttribute("data-traits") === key) return;

  const labels = cardTraitNames(card);
  const badges = traits.map((type, index) => {
    const badge = document.createElement("img");
    const name = labels[index];
    badge.className = "card-trait-badge";
    badge.classList.toggle("is-inactive", card.isZombified && type !== card.attackType);
    badge.src = import.meta.env.BASE_URL + "assets/environment/" + type.toLowerCase() + ".png";
    badge.alt = name;
    badge.title = name;
    return badge;
  });
  container.setAttribute("data-traits", key);
  container.replaceChildren(...badges);
}
