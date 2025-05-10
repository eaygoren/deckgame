import { Application, Container, Text } from "pixi.js";
import { Card, LeaderCard } from "../game/Card";
import { CardView, CARD_WIDTH, CARD_HEIGHT, CARD_GAP } from "./CardView";

const HAND_Y = 500;
const BOT_HAND_Y = 50;
const HAND_GAP = 40; // Kartlar arası boşluk artırıldı

export class HandRenderer {
  app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  renderHand(hand: Card[], y: number, isPlayer: boolean, playCardCallback: (card: Card) => void) {
    // Lider kartı ve diğer 4 kartı ortalanmış şekilde göster
    const container = new Container();
    const fieldCards = isPlayer ? (window as any).gameUI?.playerField ?? [] : (window as any).gameUI?.botField ?? [];
    // Lider kartı bul ve sadece oyun alanında değilse göster
    const leaderCard = hand.find(card => card instanceof LeaderCard && !fieldCards.includes(card));
    // Oyun alanında olmayan ilk 4 kart
    const nonFieldHand = hand.filter(card => !fieldCards.includes(card) && !(card instanceof LeaderCard)).slice(0, leaderCard ? 4 : 5);
    // Lider kartı ortada olacak şekilde diz
    let visibleHand: Card[] = [];
    if (leaderCard) {
      // 2 kart sola, lider, 2 kart sağa (varsa)
      const left = nonFieldHand.slice(0, 2);
      const right = nonFieldHand.slice(2, 4);
      visibleHand = [...left, leaderCard, ...right];
    } else {
      visibleHand = nonFieldHand;
    }
    // Ortalamak için başlangıç x'i hesapla
    const totalWidth = visibleHand.length * (CARD_WIDTH + HAND_GAP) - HAND_GAP;
    const startX = (this.app.screen.width - totalWidth) / 2;
    visibleHand.slice(0, 5).forEach((card, i) => {
      const cardView = new CardView(card);
      cardView.setOriginalPosition(startX + i * (CARD_WIDTH + HAND_GAP), y);
      cardView.x = startX + i * (CARD_WIDTH + HAND_GAP);
      cardView.y = y;
      cardView.interactive = isPlayer;
      if (isPlayer) {
        cardView.on("pointerup", () => playCardCallback(card));
      }
      container.addChild(cardView);
    });
    this.app.stage.addChild(container);
    return container;
  }
}
