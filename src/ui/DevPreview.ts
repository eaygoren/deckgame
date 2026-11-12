import "./dev-preview.css";
import { createEffectBadge, effectBadges } from "./battleEffects";

const resolutions = [
  { name: "HD", width: 1280, height: 720 },
  { name: "Full HD", width: 1920, height: 1080 },
  { name: "QHD", width: 2560, height: 1440 },
];

const devices = [
  { name: "iPhone SE", width: 375, height: 667 },
  { name: "iPhone 15", width: 393, height: 852 },
  { name: "iPhone 15 Pro Max", width: 430, height: 932 },
  { name: "Samsung Galaxy S24", width: 360, height: 780 },
  { name: "Google Pixel 8", width: 412, height: 915 },
  { name: "iPad Mini", width: 744, height: 1133 },
  { name: "iPad Air", width: 820, height: 1180 },
];

export function mountDevPreview(url: URL): void {
  const shell = document.createElement("div");
  shell.className = "dev-preview";
  shell.innerHTML = `
    <div class="dev-preview-toolbar" aria-label="Development preview" role="group">
      <button type="button" data-mode="desktop" aria-pressed="true">Desktop</button>
      <button type="button" data-mode="mobile" aria-pressed="false">Mobile</button>
      <select aria-label="Resolution"></select>
      <div class="dev-preview-mobile" hidden>
        <select aria-label="Device"></select>
        <button type="button" data-orientation="portrait" aria-pressed="true">Portrait</button>
        <button type="button" data-orientation="landscape" aria-pressed="false">Landscape</button>
      </div>
      <output aria-label="Viewport size"></output>
      <button type="button" data-show-badges aria-haspopup="dialog">Badges</button>
    </div>
    <dialog aria-labelledby="dev-badges-title">
      <form method="dialog"><button class="detail-close" aria-label="Close">×</button></form>
      <h2 id="dev-badges-title">Effect badges</h2>
      <ul class="dev-badge-list"></ul>
    </dialog>
    <div class="dev-preview-stage">
      <iframe title="Game preview"></iframe>
    </div>
  `;

  const frame = shell.querySelector("iframe")!;
  const badgeDialog = shell.querySelector("dialog")!;
  const badgeList = badgeDialog.querySelector("ul")!;
  for (const definition of Object.values(effectBadges)) {
    const entry = document.createElement("li");
    const badge = createEffectBadge(definition);
    badge.setAttribute("aria-hidden", "true");
    entry.append(badge, definition.label);
    badgeList.append(entry);
  }
  shell.querySelector("[data-show-badges]")!.addEventListener("click", () => badgeDialog.showModal());
  const stage = shell.querySelector<HTMLElement>(".dev-preview-stage")!;
  const mobileControls = shell.querySelector<HTMLElement>(".dev-preview-mobile")!;
  const deviceSelect = mobileControls.querySelector("select")!;
  const resolutionSelect = shell.querySelector<HTMLSelectElement>('select[aria-label="Resolution"]')!;
  const dimensions = shell.querySelector("output")!;
  const modeButtons = shell.querySelectorAll<HTMLButtonElement>("[data-mode]");
  const orientationButtons = shell.querySelectorAll<HTMLButtonElement>("[data-orientation]");
  let mobile = false;
  let landscape = false;

  devices.forEach((device, index) => deviceSelect.add(new Option(device.name, String(index))));
  deviceSelect.selectedIndex = 1;
  resolutions.forEach((resolution, index) => resolutionSelect.add(new Option(resolution.name, String(index))));
  resolutionSelect.selectedIndex = 1;

  function updateViewport(): void {
    const viewport = mobile ? devices[deviceSelect.selectedIndex] : resolutions[resolutionSelect.selectedIndex];
    const rotated = mobile && landscape;
    const width = rotated ? viewport.height : viewport.width;
    const height = rotated ? viewport.width : viewport.height;
    const scale = Math.min(1, stage.clientWidth / width, stage.clientHeight / height);
    frame.dataset.mode = mobile ? "mobile" : "desktop";
    frame.style.width = width + "px";
    frame.style.height = height + "px";
    frame.style.transform = `translate(-50%, -50%) scale(${scale})`;
    dimensions.textContent = `${width} × ${height}`;
  }

  for (const button of modeButtons) {
    button.addEventListener("click", () => {
      mobile = button.dataset.mode === "mobile";
      shell.classList.toggle("is-mobile", mobile);
      mobileControls.hidden = !mobile;
      resolutionSelect.hidden = mobile;
      for (const option of modeButtons) option.setAttribute("aria-pressed", String(option === button));
      updateViewport();
    });
  }
  for (const button of orientationButtons) {
    button.addEventListener("click", () => {
      landscape = button.dataset.orientation === "landscape";
      for (const option of orientationButtons) option.setAttribute("aria-pressed", String(option === button));
      updateViewport();
    });
  }
  deviceSelect.addEventListener("change", updateViewport);
  resolutionSelect.addEventListener("change", updateViewport);
  frame.src = url.href;
  document.body.append(shell);
  updateViewport();
  new ResizeObserver(updateViewport).observe(stage);
}
