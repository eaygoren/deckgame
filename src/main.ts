import { Application } from "pixi.js";
import { AssetLoader } from "./utils/AssetLoader";
import { Game } from "./game/Game";
import { DeckView } from "./ui/DeckView";

const app = new Application();

(async () => {
  await AssetLoader.loadAll();
  await app.init({
    width: 1920,
    height: 1080,
    resolution: window.devicePixelRatio || 1,
    backgroundColor: 0x5c454d,
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

  const playerDeck = new DeckView(app);

  const confirmDeckButton = document.getElementById("confirm-deck") as HTMLButtonElement;
  confirmDeckButton.disabled = true; // Initially disable the button

  playerDeck.on("DeckReady", () => {
    confirmDeckButton.disabled = false;
  });
  playerDeck.on("DeckUnready", () => {
    confirmDeckButton.disabled = true;
  });

  confirmDeckButton?.addEventListener("click", () => {
    confirmDeckButton.style.display = "none"; // Hide the button after confirming the deck
    console.log("Deck confirmed:", playerDeck.getDeckCards());
    // Start the game
    new Game(app, playerDeck.getDeckCards()).start();
    playerDeck.destroy(); // Destroy the deck view after starting the game
  });
})();
