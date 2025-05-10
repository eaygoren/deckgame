import { Card, LeaderCard, Rarity } from "../game/Card";
import { Graphics, Text, Sprite } from "pixi.js";
import { Color } from "../shared/enums";

const CARD_WIDTH = 100;
const CARD_HEIGHT = 150;
const CARD_GAP = 110;

export function getCardColor(card: Card) {
  if (card instanceof LeaderCard) return Color.Leader;
  if (card.Rarity === Rarity.Legendary) return Color.Legendary;
  if (card.Rarity === Rarity.Rare) return Color.Rare;
  return Color.Common;
}

export class CardView extends Graphics {
  card: Card;
  isDragging = false;
  dragOffset = { x: 0, y: 0 };
  _originalX = 0;
  _originalY = 0;

  constructor(card: Card) {
    super();
    this.card = card;
    this.interactive = true;
    this.drawCard();
    // Kartın ilk konumunu sakla
    this._originalX = 0;
    this._originalY = 0;
    this.on("pointerdown", this.onDragStart, this);
    this.on("pointerup", this.onDragEnd, this);
    this.on("pointerupoutside", this.onDragEnd, this);
    this.on("pointermove", this.onDragMove, this);
  }

  setOriginalPosition(x: number, y: number) {
    this._originalX = x;
    this._originalY = y;
  }

  drawCard() {
    this.clear();
    this.removeChildren();
    // Border ve dolgu ayarı
    if (this.card instanceof LeaderCard) {
      this.lineStyle(6, 0x006600, 1); // Kalın yeşil border
    } else {
      this.lineStyle(3, 0x222222, 1); // Diğer kartlar için ince border
    }
    this.beginFill(getCardColor(this.card));
    this.drawRoundedRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 12);
    this.endFill();
    // Kart görseli ekle (varsa)
    if (this.card.ImagePath) {
      try {
        const sprite = Sprite.from(this.card.ImagePath);
        sprite.width = CARD_WIDTH - 16;
        sprite.height = CARD_HEIGHT / 2;
        sprite.x = 8;
        sprite.y = 18;
        this.addChild(sprite);
      } catch (e) {
        // Görsel yüklenemezse hata verme, sadece devam et
      }
    }
    // Sadece nadirlik ve isim, ortalı ve alt alta
    const cleanName = this.card.Name.replace(/\b(Bot|Oyuncu)\b/gi, "").trim();
    const nameText = new Text(
      `${this.card.Rarity}\n${cleanName}`,
      {
        fontSize: 20,
        fill: 0x000000,
        fontWeight: "bold",
        align: "center"
      }
    );
    nameText.style.fontWeight = "bold";
    nameText.x = CARD_WIDTH / 2 - nameText.width / 2;
    nameText.y = CARD_HEIGHT / 2 - nameText.height / 2 - 18;
    this.addChild(nameText);
    // Atak ve HP değerleri alt kısımda ortalı
    const statText = new Text(
      `A:${this.card.Attack}  H:${this.card.Health}`,
      {
        fontSize: 18,
        fill: 0x000000,
        fontWeight: "bold",
        align: "center"
      }
    );
    statText.style.fontWeight = "bold";
    statText.x = CARD_WIDTH / 2 - statText.width / 2;
    statText.y = CARD_HEIGHT - 32;
    this.addChild(statText);
  }

  onDragStart(event: any) {
    this.isDragging = true;
    this.dragOffset.x = event.data.global.x - this.x;
    this.dragOffset.y = event.data.global.y - this.y;
    this.alpha = 0.7;
    this.zIndex = 1000;
  }

  onDragEnd() {
    this.isDragging = false;
    this.alpha = 1;
    this.zIndex = 0;
    // Kartı eski konumuna döndür
    this.x = this._originalX;
    this.y = this._originalY;
  }

  onDragMove(event: any) {
    if (this.isDragging) {
      this.x = event.data.global.x - this.dragOffset.x;
      this.y = event.data.global.y - this.dragOffset.y;
    }
  }
}

export { CARD_WIDTH, CARD_HEIGHT, CARD_GAP };
