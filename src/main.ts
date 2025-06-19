import { Application } from "pixi.js";
import { AssetLoader } from "./utils/AssetLoader";
import { Game } from "./game/Game";

const app = new Application();

(async () => {
  await AssetLoader.loadAll();
  await app.init({
    width: 1920,
    height: 1080,
    resolution: window.devicePixelRatio || 1,
    backgroundColor: 0xfafafa,
    resizeTo: window,
  });

  (globalThis as any).__PIXI_APP__ = app;

  document.getElementById("pixi-container")?.appendChild(app.canvas);
  
  // Update scale function to fit the game area
  function updateScale() {
    const scaleX = window.innerWidth / 1920;
    const scaleY = window.innerHeight / 1080;
    const scale = Math.min(scaleX, scaleY);

    // Scale and center the stage
    app.stage.scale.set(scale);
    app.stage.position.set(
      (window.innerWidth - 1920 * scale) / 2,
      (window.innerHeight - 1080 * scale) / 2
    );
  }
  
  window.addEventListener("resize", updateScale);
  updateScale();
  // Start the game
  new Game(app).start();
})();
