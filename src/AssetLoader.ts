import { Assets } from "pixi.js";

export class AssetLoader {
  static async loadAll(): Promise<void> {
    // Kart görselleri burada listelenir
    const images = [
      "assets/assassin.png",
      "assets/cerberus.png",
      "assets/elf.png",
      "assets/knight.png",
      "assets/mage.png",
      "assets/ra.png",
      "assets/siren.png",
      "assets/werewolf.png"
    ];
    await Assets.load(images);
  }
}
