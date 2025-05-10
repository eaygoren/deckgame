import { Application, Container, Text } from "pixi.js";
import { Card, LeaderCard } from "../game/Card";
import { CardView, CARD_WIDTH, CARD_HEIGHT } from "./CardView";

export class FieldRenderer {
  app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  renderField(playerField: Card[], botField: Card[], selectAttack: (attacker: Card, isPlayer: boolean) => void, isPlayerView: boolean) {
    const FIELD_GAP = 50;
    const container = new Container();
    const startX = 100;
    // Sadece canı > 0 olan kartları göster
    const alivePlayerField = playerField.filter(card => card.Health > 0);
    const aliveBotField = botField.filter(card => card.Health > 0);
    // Oyuncu alanı (alt taraf) - lider en solda olacak şekilde sırala
    const sortedPlayerField = [...alivePlayerField].sort((a, b) => (a instanceof LeaderCard ? -1 : b instanceof LeaderCard ? 1 : 0));
    sortedPlayerField.forEach((card, i) => {
      const cardView = new CardView(card);
      cardView.setOriginalPosition(startX + i * (CARD_WIDTH + FIELD_GAP), 500 - CARD_HEIGHT - 20);
      cardView.x = startX + i * (CARD_WIDTH + FIELD_GAP);
      cardView.y = 500 - CARD_HEIGHT - 20;
      cardView.interactive = isPlayerView;
      if (isPlayerView) {
        cardView.on("pointerup", () => selectAttack(card, true));
      }
      container.addChild(cardView);
    });
    // Bot alanı (üst taraf) - lider en solda olacak şekilde sırala
    const sortedBotField = [...aliveBotField].sort((a, b) => (a instanceof LeaderCard ? -1 : b instanceof LeaderCard ? 1 : 0));
    sortedBotField.forEach((card, i) => {
      const cardView = new CardView(card);
      cardView.setOriginalPosition(startX + i * (CARD_WIDTH + FIELD_GAP), 50 + CARD_HEIGHT + 20);
      cardView.x = startX + i * (CARD_WIDTH + FIELD_GAP);
      cardView.y = 50 + CARD_HEIGHT + 20;
      cardView.interactive = !isPlayerView;
      if (!isPlayerView) {
        cardView.on("pointerup", () => selectAttack(card, false));
      }
      container.addChild(cardView);
    });
    this.app.stage.addChild(container);
    return container;
  }
}
