const mouseTilt = "(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)";

export function addMouseTilt(tile: HTMLElement, face: HTMLElement): void {
  const reset = () => tile.classList.remove("is-tilted");
  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || !window.matchMedia(mouseTilt).matches
        || window.frameElement?.getAttribute("data-mode") === "mobile"
        || tile.classList.contains("is-moving")) return;

    // Measure the grid cell, which stays still while the card face tilts.
    const { left, top, width, height } = tile.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - left) / width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - top) / height * 2 - 1));
    face.style.setProperty("--tilt-x", `${-y * 9}deg`);
    face.style.setProperty("--tilt-y", `${x * 9}deg`);
    face.style.setProperty("--portrait-x", `${x * 4}px`);
    face.style.setProperty("--portrait-y", `${y * 4}px`);
    tile.classList.add("is-tilted");
  };

  tile.addEventListener("pointerenter", move);
  tile.addEventListener("pointermove", move);
  tile.addEventListener("pointerleave", reset);
  tile.addEventListener("pointercancel", reset);
}
