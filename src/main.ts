import { Game } from "./game/Game";
import { DeckView } from "./ui/DeckView";
import { Deck } from "./game/Deck";
import { Card, LeaderCard } from "./game/Card";
import "./deck-builder.css";
import "./battle.css";

const builder = document.querySelector<HTMLElement>("#deck-builder")!;
const battle = document.querySelector<HTMLElement>("#app")!;
const url = new URL(window.location.href);

document.addEventListener("dragstart", event => {
  if (event.target instanceof HTMLImageElement) event.preventDefault();
});

document.addEventListener("click", event => {
  const dialog = event.target;
  if (dialog instanceof Element && !dialog.closest(".battle-panels, dialog")) {
    document.querySelector<HTMLDetailsElement>(".battle-panels details[open]")?.removeAttribute("open");
  }
  if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return;

  const { left, right, top, bottom } = dialog.getBoundingClientRect();
  if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) {
    dialog.close();
  }
});

if (import.meta.env.DEV && window.parent === window) {
  builder.hidden = true;
  void import("./ui/DevPreview").then(({ mountDevPreview }) => mountDevPreview(url));
} else {
  const desktopViewport = window.matchMedia("(min-width: 761px) and (min-height: 541px) and (pointer: fine)");
  function resizeDesktopLayout(): void {
    const previewMode = window.frameElement?.getAttribute("data-mode");
    const desktop = previewMode ? previewMode === "desktop" : desktopViewport.matches;
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    document.documentElement.style.setProperty("--desktop-scale", String(scale));
    builder.classList.toggle("is-scaled", desktop);
    battle.classList.toggle("is-scaled", desktop);
  }
  resizeDesktopLayout();
  window.addEventListener("resize", resizeDesktopLayout);
  desktopViewport.addEventListener("change", resizeDesktopLayout);

  const result = document.querySelector<HTMLDialogElement>("#match-result")!;
  const resultTitle = result.querySelector("#match-result-title")!;
  const showResultButton = document.querySelector<HTMLButtonElement>("#show-match-result")!;
  const exitMatch = document.querySelector<HTMLDialogElement>("#exit-match")!;
  let selectedDeck: Deck;
  let activeGame: Game | undefined;

  function startMatch(): void {
    const deck = new Deck();
    deck.setLeader(new LeaderCard(selectedDeck.leader));
    for (const card of selectedDeck.cards) {
      if (card !== selectedDeck.leader) deck.addCard(new Card(card));
    }

    result.close();
    showResultButton.hidden = true;
    activeGame = new Game(deck, outcome => {
      battle.querySelectorAll<HTMLDialogElement>("dialog[open]").forEach(dialog => dialog.close());
      resultTitle.textContent = { win: "You won!", loss: "You lost", draw: "Draw!" }[outcome];
      result.dataset.outcome = outcome;
      showResultButton.hidden = false;
      result.showModal();
    });
    activeGame.start();
    builder.hidden = true;
    battle.hidden = false;
    window.scrollTo(0, 0);
  }

  showResultButton.addEventListener("click", () => result.showModal());
  result.querySelector("#play-again")!.addEventListener("click", startMatch);
  function returnToMenu(): void {
    activeGame?.stop();
    activeGame = undefined;
    battle.querySelectorAll<HTMLDialogElement>("dialog[open]").forEach(dialog => dialog.close());
    battle.hidden = true;
    builder.hidden = false;
    builder.scrollTop = 0;
    window.scrollTo(0, 0);
    builder.querySelector("h1")?.focus({ preventScroll: true });
  }

  result.querySelector("#edit-match-deck")!.addEventListener("click", returnToMenu);
  document.querySelector("#open-exit-match")!.addEventListener("click", () => exitMatch.showModal());
  exitMatch.querySelector("#confirm-exit-match")!.addEventListener("click", returnToMenu);

  new DeckView(builder, async deck => {
    selectedDeck = deck;
    startMatch();
  });
}
