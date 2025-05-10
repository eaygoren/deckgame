import { Application } from "pixi.js";
import { GameUI } from "./ui/GameUI";
import { AssetLoader } from "./AssetLoader";

const app = new Application({
  width: 1920,
  height: 1080,
  background: "#222244",
});

const gameUI = new GameUI(app);

(async () => {
  await AssetLoader.loadAll();
  await app.init();
  document.getElementById("pixi-container")?.appendChild(app.canvas);
  gameUI.init();
})();
