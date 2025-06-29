import { Assets, Container, Graphics, Sprite, Text, Texture } from "pixi.js";
import { Card, LeaderCard } from "../game/Card";
import { AttackType, ClassType, Color } from "../shared/enums";
import { Environment } from "../shared/constants/gameConfig";

export class CardView extends Container {
  private _cardContainer!: Container; // Container for the card
  private _skillContainer!: Container; // Container for the skill text area
  private _card: Card;
  private _cover!: Sprite; // Cover image path
  private _skillText!: Text; // Skill text reference
  private _statText!: Text; // Stat text reference
  private _attackType!: Sprite; // Attack type icon

  constructor(card: Card) {
    super();
    this._card = card;
    this.label = card.name;
    this.interactive = true;

    this.drawCard();
  }

  public get card(): Card {
    return this._card;
  }

  private drawCard() {
    this._skillContainer = new Container();
    this._skillContainer.label = "SkillContainer";
    this.addChild(this._skillContainer);

    const skillTextArea = new Graphics();
    skillTextArea.beginPath();
    skillTextArea.roundRect(-90, 230, 180, 45, 10);
    skillTextArea.stroke({ color: 0x000000, width: 3 });
    skillTextArea.fill({ color: 0x000000, alpha: 0.5 });
    skillTextArea.closePath();
    skillTextArea.label = "SkillTextArea";
    this._skillContainer.addChild(skillTextArea);

    let text = this.card.skill ? this.card.skill.name : "No Skill";
    this._skillText = new Text({ text: text, style: { fontSize: 20, fill: 0xfafafa } });
    this._skillText.anchor.set(0.5);
    this._skillText.position.set(0, 260);
    this._skillText.label = "Skill";
    this._skillContainer.addChild(this._skillText);

    // Create a container for the card
    this._cardContainer = new Container({ label: "CardContainer" });
    this.addChild(this._cardContainer);

    const mask = new Graphics();
    mask.beginPath();
    mask.roundRect(-125, -125, 250, 370, 20);
    mask.fill({ color: 0x000000, alpha: 0.75 });
    mask.closePath();
    mask.label = "Mask";
    this._cardContainer.addChild(mask);
    this._cardContainer.mask = mask;

    this._cover = Sprite.from(this._card.cover);
    this._cover.anchor.set(0.5, 1);
    this._cover.scale.set(1);
    this._cover.position.set(0, 245);
    this._cover.label = "Cover";
    this._cardContainer.addChild(this._cover);

    const background = new Graphics();
    background.beginPath();
    background.roundRect(-125, -125, 250, 370, 20);
    background.stroke({ color: 0x000000, width: 6 });
    background.fill({ color: this._card instanceof LeaderCard ? Color.Leader : this._card.color, alpha: 0 });
    background.closePath();
    background.label = "Background";
    this._cardContainer.addChild(background);

    const seperator = new Graphics();
    seperator.beginPath();
    seperator.rect(-130, 170, 260, 80);
    seperator.stroke({ color: 0x000000, width: 3 });
    seperator.fill({ color: 0x000000, alpha: 0.5 });
    seperator.closePath();
    seperator.label = "Seperator";
    this._cardContainer.addChild(seperator);

    let attackTypeIcon: string = "";
    switch (this._card.attackType) {
      case AttackType.Melee:
        attackTypeIcon = Environment.melee;
        break;
      case AttackType.Ranged:
        attackTypeIcon = Environment.ranged;
        break;
    }

    if (attackTypeIcon) {
      this._attackType = Sprite.from(attackTypeIcon);
      this._attackType.anchor.set(0.5, 0.5);
      this._attackType.scale.set(1);
      this._attackType.position.set(-90, 207);
      this._attackType.label = "AttackTypeIcon";
      this._cardContainer.addChild(this._attackType);
    }

    let classTypeIcon: string = "";
    switch (this._card.classType) {
      case ClassType.Tank:
        classTypeIcon = Environment.tank;
        break;
      case ClassType.Warrior:
        classTypeIcon = Environment.warrior;
        break;
      case ClassType.Mage:
        classTypeIcon = Environment.mage;
        break;
      case ClassType.Rogue:
        classTypeIcon = Environment.rogue;
        break;
    }

    if (classTypeIcon) {
      const classTypeSprite = Sprite.from(classTypeIcon);
      classTypeSprite.anchor.set(0.5, 0.5);
      classTypeSprite.scale.set(1);
      classTypeSprite.position.set(90, 207);
      classTypeSprite.label = "ClassTypeIcon";
      this._cardContainer.addChild(classTypeSprite);
    }

    const nameText = new Text({ text: this._card.name, style: { fontSize: 20, fill: 0xfafafa } });
    nameText.anchor.set(0.5);
    nameText.position.set(0, 190);
    nameText.label = "Name";
    this._cardContainer.addChild(nameText);

    if (this._card instanceof LeaderCard) {
      const crown = Sprite.from(this._card.crown);
      crown.anchor.set(0.5, 0);
      crown.scale.set(0.1);
      crown.position.set(105, -187);
      crown.angle = 15;
      crown.label = "Crown";
      this.addChild(crown);
    }

    this.updateStats();
  }

  // Update method to refresh stats
  public updateStats() {
    if (this._statText) {
      this._statText.destroy();
    }

    // Stats text güncelleme
    let attackText = `A: ${this._card.attack}`;
    if (this._card.classType === ClassType.Warrior && this._card.WarriorRageActivated) {
      const originalAttack = Math.floor(this._card.attack / 1.5);
      const bonus = this._card.attack - originalAttack;
      attackText = `A: ${originalAttack} + (${bonus})`;
    }

    this._statText = new Text({
      text: `${attackText} H: ${this._card.health}`,
      style: { fontSize: 20, fill: 0xfafafa }
    });
    this._statText.anchor.set(0.5);
    this._statText.position.set(0, 220);
    this._statText.label = "Stats";
    this._cardContainer.addChild(this._statText);
  }

  public async updateCover() {
    const targetCover = this._card.effectCover || this._card.cover;

    if (targetCover) {
      const newTexturePath = `assets/character/${targetCover.toLowerCase()}.png`;

      // Önce cache'den kontrol et
      let texture = Assets.cache.get(newTexturePath);

      if (!texture) {
        // Cache'de yoksa yükle
        texture = await Assets.load(newTexturePath);
      }

      this._cover.texture = texture;
    }
  }

  public updateAttackType(attackType: AttackType) {
    // this._card.attackType = attackType;
    // if (this._attackType) {
    //   this._attackType.texture = Sprite.from(Environment[attackType]).texture;
    // }
  }
}