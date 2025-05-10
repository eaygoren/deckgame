import { Application, Text } from "pixi.js";
import { Card, LeaderCard } from "../game/Card";
import { CardView, CARD_WIDTH, CARD_HEIGHT } from "./CardView";

export class LeaderRenderer {
  app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  renderLeaders(playerLeader: LeaderCard, botLeader: LeaderCard) {
    // Sadece oyun alanında lider yoksa göster
    let playerLeaderView: CardView | null = null;
    let botLeaderView: CardView | null = null;
    const gameUI = (window as any).gameUI;
    if (gameUI) {
      // Eğer lider oyun alanında yoksa göster
      if (!gameUI.playerField.includes(playerLeader)) {
        playerLeaderView = new CardView(playerLeader);
        playerLeaderView.x = 50;
        playerLeaderView.y = 500 - CARD_HEIGHT - 40;
        this.app.stage.addChild(playerLeaderView);
      }
      if (!gameUI.botField.includes(botLeader)) {
        botLeaderView = new CardView(botLeader);
        botLeaderView.x = 50;
        botLeaderView.y = 50 + CARD_HEIGHT + 40;
        this.app.stage.addChild(botLeaderView);
      }
    }
    return { playerLeaderView, botLeaderView };
  }
}
