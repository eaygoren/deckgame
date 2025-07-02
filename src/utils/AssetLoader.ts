import { Assets } from "pixi.js";
import { Characters } from "../shared/constants/characters";
import { Effects, Environment } from "../shared/constants/gameConfig";

export class AssetLoader {
  public static async loadAll(): Promise<void> {
    const chars = Object.values(Characters).map((alias) => ({
      alias: alias.toLowerCase(),
      src: `assets/character/${alias.toLowerCase()}.png`
    }));

    const env = Object.values(Environment).map((alias) => ({
      alias,
      src: `assets/environment/${alias}.png`
    }));

    const effects = Object.values(Effects).map((alias) => ({
      alias,
      src: `assets/effects/${alias}.png`
    }));

    await Assets.load(chars);
    await Assets.load(env);
    await Assets.load(effects);
  }
}