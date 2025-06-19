import { Container, Graphics, Sprite, Text } from "pixi.js";
import { Card, Class, Color, LeaderCard } from "../game/Card";
import { Environment } from "../shared/constants";

export class CardView extends Container {
  private _card: Card;
  private statText: Text | undefined; // Stat text reference

  constructor(card: Card) {
    super();
    this._card = card;
    this.label = card.Name;
    this.interactive = true;
    this.drawCard();
  }

  private drawCard() {
    const background = new Graphics();
    background.beginPath();
    background.roundRect(-125, -125, 250, 370, 10);
    background.stroke({ color: 0x000000, width: 6 });
    background.fill({ color: this._card instanceof LeaderCard ? Color.Leader : this._card.Color, alpha: 0.75 });
    background.closePath();
    background.label = "Background";
    this.addChild(background);

    const seperator = new Graphics();
    seperator.beginPath();
    seperator.moveTo(-125, 170);
    seperator.lineTo(125, 170);
    seperator.stroke({ color: 0x000000, width: 4, alpha: 0.75 });
    seperator.closePath();
    seperator.label = "Sperator";
    this.addChild(seperator);

    if (this._card.Cover) {
      const sprite = Sprite.from(this._card.Cover);
      sprite.anchor.set(0.5, 1);
      sprite.scale.set(0.2);
      sprite.position.set(0, 160);
      sprite.label = "Cover";
      this.addChild(sprite);
    }
    
    if (this._card instanceof LeaderCard) {
      const crown = Sprite.from(this._card.Crown);
      crown.anchor.set(0.5, 0);
      crown.scale.set(0.1);
      crown.position.set(130, -173);
      crown.angle = 30;
      crown.label = "Crown";
      this.addChild(crown);
    }

    let classIcon: string;
    switch (this._card.Class) {
      case Class.Melee:
        classIcon = Environment.melee;
        break;
      case Class.Ranged:
        classIcon = Environment.ranged;
        break;
    }
    if (classIcon) {
      const classSprite = Sprite.from(classIcon);
      classSprite.anchor.set(0.5, 0.5);
      classSprite.scale.set(0.075);
      classSprite.position.set(-90, -90);
      classSprite.label = "ClassIcon";
      this.addChild(classSprite);
    }

    const nameText = new Text({ text: this._card.Name, style: { fontSize: 20, fill: (this._card instanceof LeaderCard) ? 0x000000 : 0x555555 } });
    nameText.anchor.set(0.5);
    nameText.position.set(0, 190);
    nameText.style.fontWeight = "bold";
    nameText.label = "Name";
    this.addChild(nameText);
    
    this.statText = new Text({ text: `A:${this._card.Attack} H:${this._card.Health}`, style: { fontSize: 20, fill: (this._card instanceof LeaderCard) ? 0x000000 : 0x555555 } });
    this.statText.anchor.set(0.5);
    this.statText.position.set(0, 220);
    this.statText.style.fontWeight = "bold";
    this.statText.label = "Stats";
    this.addChild(this.statText);
  }

  // Update method to refresh stats
  public update(attack?: number, health?: number) {
    if (this.statText) {
      this.statText.text = `A:${attack !== undefined ? attack : this.card.Attack} H:${health !== undefined ? health : this.card.Health}`;
    }
  }

  public get card(): Card {
    return this._card;
  }
}