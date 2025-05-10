import { Application, Text } from "pixi.js";

export class EndGameRenderer {
  app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  showWinner(winner: string) {
    const winnerText = new Text(winner, { fontSize: 56, fill: 0x000000, fontWeight: "bold" });
    winnerText.style.fontWeight = "bold";
    winnerText.x = 250;
    winnerText.y = 400;
    this.app.stage.addChild(winnerText);
  }
}
