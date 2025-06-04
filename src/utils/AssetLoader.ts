import { Assets } from "pixi.js";
import { CharacterSource, Environment } from "../shared/constants";

export class AssetLoader {
  static async loadAll(): Promise<void> {
    const chars = Object.values(CharacterSource).map((alias) => ({
      alias,
      src: `assets/${alias}.png`
    }));

    const env = Object.values(Environment).map((alias) => ({
      alias,
      src: `assets/${alias}.png`
    }));

    await Assets.load(chars);
    await Assets.load(env);
  }
}