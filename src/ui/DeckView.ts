import { Container } from "pixi.js";
import { CardView } from "./CardView";
import { ScrollBox } from "@pixi/ui";
import { CharacterList } from "../shared/constants";
import { Card } from "../game/Card";
import { Rarity, UnitType } from "../shared/enums";
import gsap from "gsap";

const ALLOWED_LEADER: number = 1; // Maximum number of leader cards allowed in the deck
const ALLOWED_LEGENDARY: number = 2; // Maximum number of legendary cards allowed in the deck
const ALLOWED_RARE: number = 3; // Maximum number of rare cards allowed in the deck
const ALLOWED_COMMON: number = 4; // Maximum number of common cards allowed in the deck

export class DeckView extends Container {
    private _poolContainer: Container; // Container for the pool cards
    private _deckContainer: Container; // Container for the deck cards
    private _poolCards: CardView[] = []; // Array to hold pool cardviews
    private _deckCards: CardView[] = []; // Array to hold deck cardviews
    private _poolCount: number = 0; // Count of pool cards
    private _deckCount: number = 0; // Count of deck cards
    private _poolScrollBox!: ScrollBox;
    private _deckScrollBox!: ScrollBox;
    private _isSBMoving: boolean = false;
    private _isCardClicked: boolean = false;
    private _maxDeckCards: number = 10; // Maximum number of cards in the deck
    private _leaderCount: number = 0; // Count of leader cards in the deck
    private _legendaryCount: number = 0; // Count of legendary cards in the deck
    private _rareCount: number = 0; // Count of rare cards in the deck
    private _commonCount: number = 0; // Count of common cards in the deck

    constructor() {
        super();
        this._poolContainer = new Container({ label: "PoolContainer" });
        this.addChild(this._poolContainer);

        this._deckContainer = new Container({ label: "DeckContainer" });
        this.addChild(this._deckContainer);

        this.init();
    }

    public init(): void {
        this._deckScrollBox = new ScrollBox({
            width: 900,
            height: 920,
            background: 0xffffff,
            radius: 15,
            elementsMargin: 50,
            leftPadding: 175,
            rightPadding: -80,
            topPadding: 170,
            bottomPadding: -60,
            globalScroll: false,
            dragTrashHold: 10,
        });
        this._deckScrollBox.label = "DeckScrollBox";
        this._deckScrollBox.position.set(40, 80);
        this._deckContainer.addChild(this._deckScrollBox);

        this._poolScrollBox = new ScrollBox({
            width: 900,
            height: 920,
            background: 0xffffff,
            radius: 15,
            elementsMargin: 50,
            leftPadding: 175,
            rightPadding: -80,
            topPadding: 170,
            bottomPadding: -60,
            globalScroll: false,
            dragTrashHold: 10,

        });
        this._poolScrollBox.label = "PoolScrollBox";
        this._poolScrollBox.position.set(980, 80);
        this._poolContainer.addChild(this._poolScrollBox);

        for (const character of Object.values(CharacterList)) {
            const card = new Card(character);
            const cardView = new CardView(card);
            cardView.scale.set(0.8, 0.8);
            this.addCardToPool(cardView);

            cardView.on("pointerdown", () => {
                this._isCardClicked = true;
            });
            cardView.on("pointermove", () => {
                if (this._isCardClicked) {
                    this._isSBMoving = true;
                }
            });
            cardView.on("pointerup", () => {
                if (!this._isSBMoving && this._isCardClicked) {
                    if (this._poolCards.includes(cardView)) {
                        if (this._deckCount < this._maxDeckCards) {
                                
                            cardView.card.unitType === UnitType.Leader && this._leaderCount++;

                            if (this._leaderCount === ALLOWED_LEADER) {
                                for (const c of this._poolCards) {
                                    if (c.card.unitType === UnitType.Leader) {
                                        c.interactive = false;
                                        c.alpha = 0.5;
                                    }
                                }
                            }

                            switch (cardView.card.rarity) {
                                case Rarity.Legendary:
                                    this._legendaryCount++;

                                    if (this._legendaryCount === ALLOWED_LEGENDARY) {
                                        for (const c of this._poolCards) {
                                            if (c.card.rarity === Rarity.Legendary) {
                                                c.interactive = false;
                                                c.alpha = 0.5;
                                            }
                                        }
                                    }
                                    break;
                                case Rarity.Rare:
                                    this._rareCount++;

                                    if (this._rareCount === ALLOWED_RARE) {
                                        for (const c of this._poolCards) {
                                            if (c.card.rarity === Rarity.Rare) {
                                                c.interactive = false;
                                                c.alpha = 0.5;
                                            }
                                        }
                                    }
                                    break;
                                case Rarity.Common:
                                    this._commonCount++;

                                    if (this._commonCount === ALLOWED_COMMON) {
                                        for (const c of this._poolCards) {
                                            if (c.card.rarity === Rarity.Common) {
                                                c.interactive = false;
                                                c.alpha = 0.5;
                                            }
                                        }
                                    }
                                    break;
                            }

                            this._deckCards.push(cardView);
                            this._deckCount++;
                            this._deckScrollBox.addItem(cardView);

                            this._poolCards = this._poolCards.filter(c => c !== cardView);
                            this._poolCount--;
                        } else {
                            this._isCardClicked = this._isSBMoving = false;
                            return;
                        }
                    } else {
                        this._poolCards.push(cardView);
                        this._poolCount++;
                        this._poolScrollBox.addItem(cardView);

                        this._deckCards = this._deckCards.filter(c => c !== cardView);
                        this._deckCount--;
                    }

                    this.orderPool();
                    this.orderDeck();

                    gsap.fromTo(cardView.scale, {
                        x: 0.7,
                        y: 0.7
                    }, {
                        x: 0.8,
                        y: 0.8,
                        duration: 0.2,
                        ease: "back.out(1.7)"
                    });

                    this._isCardClicked = this._isSBMoving = false;
                } else {
                    this._isCardClicked = this._isSBMoving = false;
                }
            });
        }

        this._poolScrollBox.resize(true);
        this._deckScrollBox.resize(true);
    }

    public addCardToPool(cardView: CardView): void {
        this._poolCards.push(cardView);
        this._poolCount++;
        this._poolScrollBox.addItem(cardView);

        this.orderPool();
    }

    public addCardToDeck(cardView: CardView): void {
        this._deckCards.push(cardView);
        this._deckCount++;
        this._deckScrollBox.addItem(cardView);

        this.orderDeck();
    }

    private orderPool(): void {
        const order = [Rarity.Legendary, Rarity.Rare, Rarity.Common];

        this._poolCards.sort((a, b) => {
            return order.indexOf(a.card.rarity) - order.indexOf(b.card.rarity);
        });

        this._poolScrollBox.removeItems();
        for (const cardView of this._poolCards) {
            this._poolScrollBox.addItem(cardView);
        }

        this._deckScrollBox.resize(true);
    }

    public orderDeck(): void {
        const order = [Rarity.Legendary, Rarity.Rare, Rarity.Common];

        this._deckCards.sort((a, b) => {
            return order.indexOf(a.card.rarity) - order.indexOf(b.card.rarity);
        });

        this._deckScrollBox.removeItems();
        for (const cardView of this._deckCards) {
            this._deckScrollBox.addItem(cardView);
        }

        this._poolScrollBox.resize(true);
    }
}