import { Assets } from "pixi.js";
import { Characters, Environment } from "../shared/constants";

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

    await Assets.load(chars);
    await Assets.load(env);
  }
}