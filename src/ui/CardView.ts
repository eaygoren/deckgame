import { Container, Graphics, Sprite, Text, Texture } from "pixi.js";
import { Card } from "../game/Card";
import { AttackType, ClassType, UnitType } from "../shared/enums";
import { EFFECT_FILTERS, Environment } from "../shared/constants/gameConfig";
import { AdjustmentFilter } from "pixi-filters";
import { EffectType } from "../shared/interfaces/skillInterfaces";

export class CardView extends Container {
  private _cardContainer!: Container; // Container for the card
  private _skillContainer!: Container; // Container for the skill text area
  private _descriptionContainer!: Container; // Container for the description text area
  private _card: Card;
  private _cover!: Sprite; // Cover image
  private _effectCover!: Sprite; // Effect image
  private _skillText!: Text; // Skill text reference
  private _statText!: Text; // Stat text reference
  private _attackType!: Sprite; // Attack type icon
  private _descriptionText!: Text; // Skill description text

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
    this._skillContainer = new Container({ label: "SkillContainer" });
    this.addChild(this._skillContainer);

    // Create a container for the card
    this._cardContainer = new Container({ label: "CardContainer" });
    this.addChild(this._cardContainer);

    const skillTextArea = new Graphics();
    skillTextArea.beginPath();
    skillTextArea.roundRect(-105, 230, 210, 45, 10);
    skillTextArea.stroke({ color: /*this._card instanceof LeaderCard ? Color.Leader :*/ this._card.color, width: 3 });
    skillTextArea.fill({ color: /*this._card instanceof LeaderCard ? Color.Leader :*/ this._card.color, alpha: 0.5 });
    skillTextArea.closePath();
    skillTextArea.label = "SkillTextArea";
    this._skillContainer.addChild(skillTextArea);

    let text = this.card.skill ? this.card.skill.name : "No Skill";
    this._skillText = new Text({ text: text, style: { fontSize: 20, fill: 0x000000 } });
    this._skillText.anchor.set(0.5);
    this._skillText.position.set(0, 260);
    this._skillText.label = "Skill";
    this._skillContainer.addChild(this._skillText);

    const mask = new Graphics();
    mask.beginPath();
    mask.roundRect(-130, -125, 260, 370, 20);
    mask.fill({ color: 0x000000, alpha: 0.75 });
    mask.closePath();
    mask.label = "Mask";
    this._cardContainer.addChild(mask);

    this._cover = Sprite.from(this._card.cover);
    this._cover.anchor.set(0.5, 1);
    this._cover.scale.set(1);
    this._cover.position.set(0, 245);
    this._cover.label = "Cover";
    this._cardContainer.addChild(this._cover);

    this._effectCover = Sprite.from(Texture.EMPTY);
    this._effectCover.anchor.set(0.5, 0.5);
    this._effectCover.scale.set(1);
    this._effectCover.position.set(0, 50);
    this._effectCover.label = "EffectCover";
    this._effectCover.visible = false; // Initially hidden
    this._cardContainer.addChild(this._effectCover);

    const seperator = new Graphics();
    seperator.beginPath();
    seperator.rect(-130, 155, 260, 120);
    // seperator.stroke({ color: this._card instanceof LeaderCard ? Color.Leader : this._card.color, width: 8 });
    seperator.fill({ color: 0x000000, alpha: 0.5 });
    seperator.closePath();
    seperator.label = "Seperator";
    this._cardContainer.addChild(seperator);

    this._descriptionContainer = new Container({ label: "DescriptionContainer" });
    this._cardContainer.addChild(this._descriptionContainer);
    this._descriptionContainer.visible = false;
    this._descriptionContainer.alpha = 0;

    const background = new Graphics();
    background.beginPath();
    background.roundRect(-130, -125, 260, 370, 20);
    background.stroke({ color: /*this._card instanceof LeaderCard ? Color.Leader :*/ this._card.color, width: 10 });
    background.closePath();
    background.label = "Background";
    this._cardContainer.addChild(background);

    let attackTypeIcon: string;
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
      this._attackType.position.set(-95, 185);
      this._attackType.label = "AttackTypeIcon";
      this._cardContainer.addChild(this._attackType);
    }

    let classTypeIcon: string;
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
      classTypeSprite.position.set(95, 185);
      classTypeSprite.label = "ClassTypeIcon";
      this._cardContainer.addChild(classTypeSprite);
    }

    const nameText = new Text({ text: this._card.name, style: { fontFamily: "Arial", fontSize: 25, fill: 0xfafafa } });
    nameText.anchor.set(0.5);
    nameText.position.set(0, 185);
    nameText.label = "Name";
    this._cardContainer.addChild(nameText);

    const crown = Sprite.from(Environment.crown);
    crown.anchor.set(0.5, 0);
    crown.scale.set(0.1);
    crown.position.set(110, -185);
    crown.angle = 15;
    crown.label = "Crown";
    crown.alpha = this._card.unitType === UnitType.Leader ? 1 : 0; // Only show crown for Leader cards
    this.addChild(crown);

    const descriptionBg = new Graphics();
    descriptionBg.beginPath();
    descriptionBg.rect(-125, -120, 250, 275);
    descriptionBg.fill({ color: 0x000000, alpha: 0.5 });
    descriptionBg.closePath();
    descriptionBg.label = "DescriptionBackground";
    this._descriptionContainer.addChild(descriptionBg);

    this._descriptionText = new Text({
      text: this._card.skill?.description,
      style: {
        fontFamily: "Arial",
        align: "center",
        fontSize: 25,
        fill: 0xfafafa,
        wordWrap: true,
        wordWrapWidth: 230
      }
    });
    this._descriptionText.anchor.set(0.5, 0);
    this._descriptionText.position.set(0, -100);
    this._descriptionText.label = "Description";
    this._descriptionContainer.addChild(this._descriptionText);

    this._cardContainer.mask = mask;

    this.updateStats();
  }

  // Update method to refresh stats
  public updateStats() {
    if (this._statText) {
      this._statText.destroy();
    }

    // Stats text güncelleme
    let attackText = `⚔️ ${this._card.attack}`;

    // Effect sisteminden bonus değerini al
    if (this._card.classType === ClassType.Warrior && this._card.hasEffect(EffectType.WarriorRage)) {
      const warriorRageEffect = this._card.activeEffects?.find(effect => effect.type === EffectType.WarriorRage);

      if (warriorRageEffect && warriorRageEffect.value) {
        const bonus = warriorRageEffect.value;
        const originalAttack = this._card.attack - bonus;
        attackText = `⚔️ ${originalAttack} + (${bonus})`;
      }
    }

    this._statText = new Text({
      text: `${attackText}  ❤️ ${this._card.health}`,
      style: { fontSize: 25, fill: 0xfafafa }
    });
    this._statText.anchor.set(0.5);
    this._statText.position.set(0, 225);
    this._statText.label = "Stats";
    this._cardContainer.addChild(this._statText);
  }

  public async updateCover() {
    if (this._card.activeEffects && this._card.activeEffects.length > 0 && this._card.effectCover) {
      for (const activeEffect of this._card.activeEffects) {
        const effectType = activeEffect.type;

        this._effectCover.texture = Texture.from(this._card.effectCover);
        this._effectCover.visible = true;

        // Filter uygula (her effect için)
        const filterConfig = effectType in EFFECT_FILTERS ? EFFECT_FILTERS[effectType as keyof typeof EFFECT_FILTERS] : null;
        this._cover.filters = filterConfig ? [new AdjustmentFilter(filterConfig)] : [];
      }
    } else {
      this._effectCover.texture = Texture.EMPTY;
      this._effectCover.visible = false;
      this._cover.filters = [];
    }
  }

  public get descriptionContainer(): Container {
    return this._descriptionContainer;
  }

  // public updateAttackType(attackType: AttackType) {
  //   if (this._attackType) {
  //     this._card.attackType = attackType;
  //     this._attackType.texture = Sprite.from(Environment[attackType]).texture;
  //   }
  // }
}