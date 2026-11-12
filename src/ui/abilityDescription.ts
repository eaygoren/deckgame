import { EffectType } from "../shared/interfaces/skillInterfaces";
import { effectBadges, effectDetails } from "./battleEffects";

let nextTooltipId = 0;
const renderedDescriptions = new WeakMap<Element, string>();

export function renderAbilityDescription(container: Element, description?: string): void {
  const copy = description ?? "This card has no special ability.";
  if (renderedDescriptions.get(container) === copy) return;
  if (!renderedDescriptions.has(container)) {
    container.closest("dialog")?.addEventListener("close", () => {
      container.querySelector<HTMLElement>(":popover-open")?.hidePopover();
    });
  }
  renderedDescriptions.set(container, copy);
  container.replaceChildren();
  let offset = 0;
  let activeTooltip: HTMLElement | undefined;

  for (const match of copy.matchAll(/\[\[([a-z_]+)\]\]/g)) {
    const type = match[1] as EffectType;
    const badge = effectBadges[type];
    if (!badge) continue;

    container.append(copy.slice(offset, match.index));
    offset = match.index + match[0].length;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "ability-effect-term";
    button.textContent = badge.label;

    const tooltip = document.createElement("span");
    tooltip.className = "ability-effect-tooltip";
    tooltip.id = `ability-effect-tooltip-${++nextTooltipId}`;
    tooltip.popover = "auto";
    tooltip.setAttribute("role", "tooltip");
    tooltip.textContent = effectDetails({ type });
    button.setAttribute("aria-describedby", tooltip.id);

    let hovered = false;
    let tapped = false;
    let closeTimer: number | undefined;

    function closeIfInactive(): void {
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        if (!hovered && !button.matches(":focus-visible") && !tapped) tooltip.hidePopover();
      }, 180);
    }

    function showTooltip(): void {
      window.clearTimeout(closeTimer);
      if (activeTooltip !== tooltip) activeTooltip?.hidePopover();
      activeTooltip = tooltip;
      if (tooltip.matches(":popover-open")) return;

      const bounds = button.getBoundingClientRect();
      const descriptionBounds = container.getBoundingClientRect();
      tooltip.style.left = `${Math.max(8, descriptionBounds.left)}px`;
      tooltip.style.width = `${Math.min(descriptionBounds.width, window.innerWidth - 16)}px`;
      tooltip.showPopover();
      const height = tooltip.offsetHeight;
      tooltip.style.top = `${bounds.bottom + height + 8 <= window.innerHeight
        ? bounds.bottom + 4
        : Math.max(4, bounds.top - height - 4)}px`;
    }

    button.addEventListener("pointerenter", event => {
      if (event.pointerType !== "mouse") return;
      hovered = true;
      showTooltip();
    });
    button.addEventListener("pointerleave", event => {
      if (event.pointerType !== "mouse") return;
      hovered = false;
      closeIfInactive();
    });
    tooltip.addEventListener("pointerenter", event => {
      if (event.pointerType !== "mouse") return;
      hovered = true;
      window.clearTimeout(closeTimer);
    });
    tooltip.addEventListener("pointerleave", event => {
      if (event.pointerType !== "mouse") return;
      hovered = false;
      closeIfInactive();
    });
    button.addEventListener("focus", () => {
      if (button.matches(":focus-visible")) showTooltip();
    });
    button.addEventListener("blur", closeIfInactive);
    button.addEventListener("click", event => {
      if (event instanceof PointerEvent && event.pointerType === "mouse") return;
      if (event.detail === 0) {
        showTooltip();
        return;
      }
      tapped = !tooltip.matches(":popover-open");
      if (tapped) showTooltip();
      else tooltip.hidePopover();
    });
    tooltip.addEventListener("toggle", () => {
      if (!tooltip.matches(":popover-open")) tapped = false;
    });

    container.append(button, tooltip);
  }
  container.append(copy.slice(offset));
}
