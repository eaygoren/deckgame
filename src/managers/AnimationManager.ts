import gsap from "gsap";
import { BroadcastEvents } from "../shared/constants/events";
import { CardView } from "../ui/CardView";
import { Broadcast } from "../utils/Broadcast";

export class AnimationManager {
  private readonly reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  constructor(broadcast: Broadcast) {
    broadcast.on(BroadcastEvents.SHOW_ABILITY_MESSAGE, ({ targetView, message, color }: {
      targetView?: CardView; message: string; color: number | string;
    }) => this.floatText(targetView, message, color, "battle-ability"));
  }

  private floatText(view: CardView | undefined, message: string, color: number | string, style: string): void {
    if (!view?.element.isConnected || !message) return;
    const label = document.createElement("span");
    label.className = "battle-float " + style;
    label.textContent = message;
    label.style.color = typeof color === "number" ? "#" + color.toString(16).padStart(6, "0") : color;
    view.element.append(label);
    gsap.to(label, {
      y: this.reducedMotion.matches ? 0 : -30,
      opacity: 0,
      delay: 0.35,
      duration: 0.55,
      onComplete: () => label.remove(),
    });
  }

  private showDamage(view: CardView, damage: number): void {
    view.updateStats();
    if (damage > 0) this.floatText(view, "−" + damage, "#ffd4ce", "battle-damage");
  }

  async playAttack(attacker: CardView, defender: CardView, impact: () => number): Promise<void> {
    if (!attacker.element.isConnected || !defender.element.isConnected) {
      impact();
      return;
    }
    if (this.reducedMotion.matches) {
      this.showDamage(defender, impact());
      return;
    }

    const from = attacker.element.getBoundingClientRect();
    const to = defender.element.getBoundingClientRect();
    const scale = from.width / attacker.element.offsetWidth;
    const duration = 0.24;
    attacker.element.classList.add("is-moving");
    attacker.element.classList.remove("is-tilted");
    try {
      await new Promise<void>((resolve, reject) => {
        let finish = resolve;
        gsap.timeline({ onComplete: () => finish() })
          .to(attacker.element, { x: (to.left - from.left) / scale, y: (to.top - from.top) / scale, duration, ease: "power2.in" })
          .call(() => {
            try {
              this.showDamage(defender, impact());
            } catch (error) {
              finish = () => reject(error);
            }
          })
          .to(attacker.element, { x: 0, y: 0, duration, ease: "power2.out" });
      });
    } finally {
      attacker.element.classList.remove("is-moving");
    }
  }

  async playBlockedCounter(defender: CardView): Promise<void> {
    if (this.reducedMotion.matches || !defender.element.isConnected) return;

    const element = defender.element;
    element.classList.add("is-moving");
    element.classList.remove("is-tilted");
    try {
      await new Promise<void>(resolve => {
        gsap.to(element, {
          keyframes: { x: [-4, 4, -2, 0] },
          duration: 0.2,
          ease: "none",
          onComplete: resolve,
        });
      });
    } finally {
      element.classList.remove("is-moving");
    }
  }

  async removeCards(cards: CardView[]): Promise<void> {
    if (!cards.length) return;
    await new Promise<void>(resolve => {
      gsap.to(cards.map(view => view.element), {
        opacity: 0,
        duration: this.reducedMotion.matches ? 0 : 0.25,
        onComplete: resolve,
      });
    });
    for (const view of cards) view.element.remove();
  }

  showNewCard(view: CardView): void {
    if (this.reducedMotion.matches) return;
    gsap.from(view.element, { opacity: 0, y: 10, duration: 0.25, clearProps: "transform,opacity" });
  }
}
