import { Container, Graphics, Sprite, Text } from "pixi.js";
import { Card, AttackType, Color, LeaderCard } from "../game/Card";
import { Environment } from "../shared/constants";
import { ClassType } from "../shared/enums";

export class CardView extends Container {
  private _card: Card;
  private _statText: Text | undefined; // Stat text reference

  constructor(card: Card) {
    super();
    this._card = card;
    this.label = card.Name;
    this.interactive = true;
    this.drawCard();
  }

  public get card(): Card {
    return this._card;
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
    }    let attackTypeIcon: string = "";
    switch (this._card.AttackType) {
      case AttackType.Melee:
        attackTypeIcon = Environment.melee;
        break;
      case AttackType.Ranged:
        attackTypeIcon = Environment.ranged;
        break;
    }
    if (attackTypeIcon) {
      const attackTypeSprite = Sprite.from(attackTypeIcon);
      attackTypeSprite.anchor.set(0.5, 0.5);
      attackTypeSprite.scale.set(0.075);
      attackTypeSprite.position.set(-90, -90);
      attackTypeSprite.label = "AttackTypeIcon";
      this.addChild(attackTypeSprite);
    }

    // Add ClassType text indicator
    const classTypeText = new Text({ 
      text: this._card.ClassType, 
      style: { 
        fontSize: 12, 
        fill: 0xFFFFFF,
        fontWeight: "bold"
      } 
    });
    classTypeText.anchor.set(0.5);
    classTypeText.position.set(90, -90);
    classTypeText.label = "ClassType";
    this.addChild(classTypeText);    const nameText = new Text({ text: this._card.Name, style: { fontSize: 20, fill: (this._card instanceof LeaderCard) ? 0x000000 : 0x555555 } });
    nameText.anchor.set(0.5);
    nameText.position.set(0, 190);
    nameText.style.fontWeight = "bold";
    nameText.label = "Name";
    this.addChild(nameText);

    this.update();
  }
    // Update method to refresh stats
  public update() {
    if (this._statText) {
      this._statText.destroy(); // Remove old stat text
    }    // Special display for warrior with rage bonus
    let attackText = `A: ${this._card.Attack}`;
    if (this._card.ClassType === ClassType.Warrior && this._card.WarriorRageActivated) {
      // Calculate the original attack value (before rage bonus)
      const originalAttack = Math.floor(this._card.Attack / 1.5);
      const bonus = this._card.Attack - originalAttack;
      attackText = `A: ${originalAttack} + (${bonus})`;
    }

    this._statText = new Text({ text: `${attackText} H: ${this._card.Health}`, style: { fontSize: 20, fill: (this.card instanceof LeaderCard) ? 0x000000 : 0x555555 } });
    this._statText.anchor.set(0.5);
    this._statText.position.set(0, 220);
    this._statText.style.fontWeight = "bold";
    this._statText.label = "Stats";
    this.addChild(this._statText);
  }
}