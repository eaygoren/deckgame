import { lastHuntIconPath, thunderMarkIconPath } from "./battleEffects";

const abilityIcons: Partial<Record<string, { color: string; path: string }>> = {
  "Last Hunt": {
    color: "#dfbfff",
    path: lastHuntIconPath,
  },
  "Thunder Mark": {
    color: "#ffe0a0",
    path: thunderMarkIconPath,
  },
  "Evasion": {
    color: "#b2dafa",
    path: "M3 7h12.5a2.4 2.4 0 1 0-2.4-2.4M2.5 12h17a2.4 2.4 0 1 0-2.4-2.4M5 17h8.5a2.4 2.4 0 1 1-2.4 2.4",
  },
  "Stealth Mode": {
    color: "#b2dafa",
    path: "M3 3l18 18M10 6.2c4.1-.8 8 1.3 11 5.8a14.7 14.7 0 0 1-3.2 3.6M6.3 7.8A16 16 0 0 0 3 12c3.1 4.7 7.6 6.7 11.7 5.6M9.9 9.9a3 3 0 0 0 4.2 4.2",
  },
  "Divine Healing": {
    color: "#ffe0a0",
    path: "M12 8v10m-5-5h10M8.4 5.3c0-2.1 7.2-2.1 7.2 0s-7.2 2.1-7.2 0ZM3 9c.6 4 2 6.3 4 7.3M21 9c-.6 4-2 6.3-4 7.3",
  },
  "Enhanced Critical": {
    color: "#ffb48e",
    path: "M8.1 15.9 16 8l3.5-1-1 3.5-7.9 7.9m-4.4-4.4 6 6m-4.5-1.5-3 3M17 2.5v4m-2-2h4M7 6v3M5.5 7.5h3",
  },
  "Dragon Fire": {
    color: "#ffb48e",
    path: "M12 21a7.2 7.2 0 0 1-6-11.3c.3 1.8 1.2 2.6 2.4 3 0-4.6 3.8-6.1 4-10 3.5 2.3 5.1 6.4 4.3 10 .9-.2 1.5-.8 1.9-1.6A7.2 7.2 0 0 1 12 21Zm0 0c-2.8-1-3.2-3.6 0-6.5 3.2 2.9 2.8 5.5 0 6.5Z",
  },
  "Piercing Shot": {
    color: "#b6e4a2",
    path: "M2.3 12h19m-3.6-3.1 3.6 3.1-3.6 3.1M3.1 9.5 6 12l-2.9 2.5M12 3.3l.6 4.1-1.4 1.9 2.2 1.2m.5 2.9-2.2 1.7 1.3 1.7.3 3.9M16 6.8l1.4-1.6m-1.1 12.3 1.8 1.3",
  },
  "Provoke": {
    color: "#ffe0a0",
    path: "M4.3 5h15.4A1.8 1.8 0 0 1 21.5 6.8v8.3a1.8 1.8 0 0 1-1.8 1.8h-8.8l-4.1 3.2v-3.2H4.3a1.8 1.8 0 0 1-1.8-1.8V6.8A1.8 1.8 0 0 1 4.3 5ZM12 8.2v3.9m0 2.2h.01",
  },
  "Last Breath": {
    color: "#b2dafa",
    path: "M4.7 19.8v-8.9a7.3 7.3 0 0 1 14.6 0v8.9l-3.7-2.5-3.6 2.5-3.6-2.5-3.7 2.5ZM9 10.4v1.5m6-1.5v1.5m-4.2 2.5h2.4",
  },
  "Hunter's Mark": {
    color: "#ffb48e",
    path: "M12 4.2a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6Zm0 4a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6ZM12 2.2v3.9m0 11.8v3.9m-9.8-9.8h3.9m11.8 0h3.9",
  },
  "Nature's Blessing": {
    color: "#b6e4a2",
    path: "M4 20c4.7-4.6 8.4-8 13.8-13.8M9 15.2c-4.3-.4-6-3.3-6-7.3 4.2.2 7.1 2 7.5 5.7m1.5-2C12.3 6 15.5 3 21 3c-.1 5.5-3 8.7-8.8 9",
  },
  "Reality Swap": {
    color: "#dfbfff",
    path: "M3 7.5h17.5m-4.5-4.2 4.5 4.2-4.5 4.2m5 4.8H3.5m4.5-4.2-4.5 4.2 4.5 4.2M12 10v4m-2-2h4",
  },
  "Copycat": {
    color: "#dfbfff",
    path: "M15.2 5.1 19.3 6a1.5 1.5 0 0 1 1.1 1.8l-2.5 11.7M6.1 4.2h7.4a1.6 1.6 0 0 1 1.6 1.6v12.4a1.6 1.6 0 0 1-1.6 1.6H6.1a1.6 1.6 0 0 1-1.6-1.6V5.8a1.6 1.6 0 0 1 1.6-1.6Zm3.7 4 2.4 3.8-2.4 3.8L7.4 12Z",
  },
  "Guardian Shield": {
    color: "#ffe0a0",
    path: "M12 3.1c2.5 1.5 5.2 2.2 8 2.6v5c0 4.5-2.7 7.8-8 10.2-5.3-2.4-8-5.7-8-10.2v-5c2.8-.4 5.5-1.1 8-2.6Zm-3.8 8.8 2.5 2.5 5-5.2",
  },
  "Frost Prison": {
    color: "#b2dafa",
    path: "M12 2.7v18.6M4 7.4l16 9.2M4 16.6l16-9.2M9.5 5l2.5 2.5L14.5 5M9.5 19l2.5-2.5 2.5 2.5M4.8 10.7l3.4-.9-.9-3.4m11.9 6.9-3.4.9.9 3.4M4.8 13.3l3.4.9-.9 3.4m11.9-6.9-3.4-.9.9-3.4",
  },
  "Raise Dead": {
    color: "#dfbfff",
    path: "M3 20.3h18M9 20.3v-3.4l-3.3-3.5a1.2 1.2 0 0 1 1.7-1.7l2.2 2V7.6a1.1 1.1 0 0 1 2.2 0v3.1m0-1.1V5.5a1.1 1.1 0 0 1 2.2 0v5.2m0-1V7a1.1 1.1 0 0 1 2.2 0v4.4m0-.8V9.1a1 1 0 0 1 2 0v4.5c0 1.4-.8 2.6-1.9 3.5v3.2M4.8 6.2v3m-1.5-1.5h3",
  },
  "Soul Harvest": {
    color: "#dfbfff",
    path: "M12.3 20.8 9.4 5.3M9.4 5.3C12.4 2.7 17.1 3 21 5.9c-3.9-.2-7 1.2-9.9 3.1L9.4 5.3Zm7.6 7.7 1 2.3 2.3 1-2.3 1-1 2.3-1-2.3-2.3-1 2.3-1Z",
  },
  "Bleeding Strike": {
    color: "#ffa5a7",
    path: "M6.4 16.6 16.2 6.8 20 5.5l-1.2 3.8-9.8 9.9m-4.2-4.2 6.2 6.2m-4.6-1.7-2 2M17.6 21a2.3 2.3 0 0 1-2.3-2.3c0-1.3 1.1-2.5 2.3-4.1 1.2 1.6 2.3 2.8 2.3 4.1a2.3 2.3 0 0 1-2.3 2.3Z",
  },
  "Venomous Strike": {
    color: "#b6e4a2",
    path: "M12 7.5c1.7 0 3 1.2 3 2.8v2c0 1.7-1.3 2.9-3 2.9S9 14 9 12.3v-2c0-1.6 1.3-2.8 3-2.8ZM9 10 6.4 8m8.6 2 2.6-2M6.4 8a2.9 2.9 0 0 1-3-2.9V3.8l1.9 1.4 1.5-1.4.5 1.8c.3 1-.1 1.8-.9 2.4Zm11.2 0a2.9 2.9 0 0 0 3-2.9V3.8l-1.9 1.4-1.5-1.4-.5 1.8c-.3 1 .1 1.8.9 2.4ZM9 11.9l-2.6 1.4m3.4.9-2 1.8m7.2-4.1 2.6 1.4m-3.4.9 2 1.8M12 15.2v2.5a3.1 3.1 0 0 0 6.2 0v-.8m-1.3 1.4 1.3-1.4 1.3 1.4",
  },
  "Spirit Link": {
    color: "#dfbfff",
    path: "M8.7 15.3l6.6-6.6M7.4 11.5l-2.8 2.8a3.6 3.6 0 0 0 5.1 5.1l2.8-2.8m-1-9.2 2.8-2.8a3.6 3.6 0 0 1 5.1 5.1l-2.8 2.8M5.2 3.4v4m-2-2h4",
  },
  "Silence Song": {
    color: "#b2dafa",
    path: "M3 3l18 18M8.7 8.7V6.5L19 4.2v8.9M8.7 13v4.4m0 0c0 1.3-1.4 2.4-3.1 2.4-1.4 0-2.4-.7-2.4-1.7 0-1.2 1.4-2.3 3.1-2.3 1.4 0 2.4.7 2.4 1.6ZM19 13.1c0 1.3-1.4 2.4-3.1 2.4-1.4 0-2.4-.7-2.4-1.7 0-1.2 1.4-2.3 3.1-2.3 1.4 0 2.4.7 2.4 1.6Z",
  },
  "Life Drain": {
    color: "#ffa5a7",
    path: "M4.2 6.3c4.2 1.8 11.4 1.8 15.6 0l-2.4 6.4L15 8.3H9l-2.4 4.4-2.4-6.4ZM12 13.3c-1.5 2.2-3 3.7-3 5.3a3 3 0 0 0 6 0c0-1.6-1.5-3.1-3-5.3Z",
  },
  "Stoneborn Fury": {
    color: "#ffe0a0",
    path: "M4 19.5h16M5.8 16.6l3.1-7.2 5.9-2 3.4 9.2Zm3.1-7.2 4 3.6-2 3.6m4-9.2 1.3 4.3M12 2.7v2.5M6.1 4.1l1.6 2.1m10.2-2.1-1.6 2.1",
  },
  "Zombify": {
    color: "#b6e4a2",
    path: "M12 3.2a7.4 7.4 0 0 0-4.7 13.1v3.9h9.4v-3.9A7.4 7.4 0 0 0 12 3.2ZM7.7 10.7h2.5m3.6 0h2.5M12 13.5v1.2m-1.7 2.4v3.1m3.4-3.1v3.1",
  },
  "Purifying Grace": {
    color: "#b6e4a2",
    path: "M12 18.4C6.5 17.7 3.4 14.6 3 10c4.3.1 7.2 2.3 9 5.7 1.8-3.4 4.7-5.6 9-5.7-.4 4.6-3.5 7.7-9 8.4Zm0-2.7c-3.7-3.2-3.6-7.5 0-11.4 3.6 3.9 3.7 8.2 0 11.4ZM6 21h12",
  },
  "Veil of Light": {
    color: "#ffe0a0",
    path: "M12 5.5c.7 3.8 2.7 5.8 6.5 6.5-3.8.7-5.8 2.7-6.5 6.5-.7-3.8-2.7-5.8-6.5-6.5 3.8-.7 5.8-2.7 6.5-6.5ZM12 2.4v1.1m0 17v1.1M2.4 12h1.1m17 0h1.1M5 5l1.1 1.1m11.8 11.8L19 19m0-14-1.1 1.1M6.1 17.9 5 19",
  },
  "Borrowed Power": {
    color: "#b2dafa",
    path: "M12 3.1c3.4 0 5.7 3 5.7 6.6s-2.3 6.6-5.7 6.6-5.7-3-5.7-6.6 2.3-6.6 5.7-6.6Zm0 13.2v4.6m-2.2 0h4.4M9.7 10l3-3m-2 5 3.6-3.6",
  },
  "Shadow Flurry": {
    color: "#dfbfff",
    path: "M3 17.8c6.1-1.5 11.6-5.9 16.2-13.1-1.3 6.8-5.1 12.2-11 15.7m2.8-.7c3.8-1.5 7.1-4.4 10-8.6-.8 4.1-3.2 7.4-6.8 9.8M3 11.5l4-4m-.8 6.4 4.7-4.7",
  },
  "Ashes to Life": {
    color: "#ffb48e",
    path: "M12 19.8c-.7-3.2-2.3-5-5.1-6.9-2.3-1.6-3.8-4.4-4-7.4 2.1 2.5 4.8 3.7 7.3 3.5L12 4l1.8 5c2.5.2 5.2-1 7.3-3.5-.2 3-1.7 5.8-4 7.4-2.8 1.9-4.4 3.7-5.1 6.9Zm-2.8 1.7 2.8-1.7 2.8 1.7",
  },
  "Nullifying Strike": {
    color: "#d6b4fa",
    path: "M20.4 11.5A8.4 8.4 0 0 1 12 20c-4 0-7.1-2.7-7.1-6.4 0-3.5 2.4-6.1 5.8-6.1 3 0 5.3 2 5.3 4.9 0 2.2-1.3 3.8-3.4 3.8-1.5 0-2.6-1.1-2.6-2.6M4.7 7.3a8.5 8.5 0 0 1 7.2-3.8m3.4.7 1.8 1m2.2 2.2.8 1.6",
  },
};

export function renderAbilityTitle(heading: Element, name = "Special ability"): void {
  heading.textContent = name;
  const icon = abilityIcons[name];
  if (!icon) return;

  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  svg.classList.add("ability-title-icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", icon.color);
  svg.setAttribute("stroke-width", "1.55");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");

  const path = document.createElementNS(namespace, "path");
  path.setAttribute("d", icon.path);
  svg.append(path);
  heading.append(svg);
}
