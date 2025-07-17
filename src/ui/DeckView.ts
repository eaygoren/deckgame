import { Application, Container } from "pixi.js";
import { CardView } from "./CardView";
import { ScrollBox } from "@pixi/ui";
import { CharacterList } from "../shared/constants";
import { Card, LeaderCard } from "../game/Card";
import { Rarity, UnitType } from "../shared/enums";
import gsap from "gsap";
import { Deck } from "../game/Deck";

const ALLOWED_LEADER: number = 1; // Maximum number of leader cards allowed in the deck
const ALLOWED_LEGENDARY: number = 2; // Maximum number of legendary cards allowed in the deck
const ALLOWED_RARE: number = 4; // Maximum number of rare cards allowed in the deck
const ALLOWED_COMMON: number = 10; // Maximum number of common cards allowed in the deck

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

    constructor(app: Application) {
        super();
        this._poolContainer = new Container({ label: "PoolContainer" });
        this.addChild(this._poolContainer);

        this._deckContainer = new Container({ label: "DeckContainer" });
        this.addChild(this._deckContainer);

        this.init();

        app.stage.addChild(this);
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

            this._poolCards.push(cardView);
            this._poolCount++;
            this._poolScrollBox.addItem(cardView);

            this.orderPool();

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
                    const isInPool = this._poolCards.includes(cardView);
                    const isLeader = cardView.card.unitType === UnitType.Leader;
                    const rarity = cardView.card.rarity;

                    const canAddToDeck = this._deckCount < this._maxDeckCards
                        && (!isLeader || this._leaderCount < ALLOWED_LEADER)
                        && (
                            (rarity === Rarity.Legendary && this._legendaryCount < ALLOWED_LEGENDARY) ||
                            (rarity === Rarity.Rare && this._rareCount < ALLOWED_RARE) ||
                            (rarity === Rarity.Common && this._commonCount < ALLOWED_COMMON)
                        );

                    if (isInPool) {
                        if (canAddToDeck) {
                            this._deckCards.push(cardView);
                            this._deckCount++;
                            this._deckScrollBox.addItem(cardView);

                            this._poolCards = this._poolCards.filter(c => c !== cardView);
                            this._poolCount--;

                            this._deckCount === this._maxDeckCards && this.emit("DeckReady"); // Emit event when deck is ready

                            this.updateSelectableCards();
                        } else {
                            this.applySelectAnimation(cardView);

                            this._isCardClicked = this._isSBMoving = false;
                            return;
                        }
                    } else {
                        this._poolCards.push(cardView);
                        this._poolCount++;
                        this._poolScrollBox.addItem(cardView);

                        this._deckCards = this._deckCards.filter(c => c !== cardView);
                        this._deckCount--;

                        this._deckCount === this._maxDeckCards - 1 && this.emit("DeckUnready"); // Emit event when deck is unready

                        this.updateSelectableCards();
                    }

                    this.orderPool();
                    this.orderDeck();
                    this.applySelectAnimation(cardView);

                    this._isCardClicked = this._isSBMoving = false;
                } else {
                    this._isCardClicked = this._isSBMoving = false;
                }
            });
        }

        this._poolScrollBox.resize(true);
        this._deckScrollBox.resize(true);
    }

    private updateSelectableCards(): void {
        this._deckCount = this._deckCards.length;
        this._leaderCount = this._deckCards.filter(cardView => cardView.card.unitType === UnitType.Leader).length;
        this._legendaryCount = this._deckCards.filter(cardView => cardView.card.rarity === Rarity.Legendary).length;
        this._rareCount = this._deckCards.filter(cardView => cardView.card.rarity === Rarity.Rare).length;
        this._commonCount = this._deckCards.filter(cardView => cardView.card.rarity === Rarity.Common).length;

        this._poolCards.forEach(cardView => {
            const isDisabled = this._deckCount >= this._maxDeckCards
                || (cardView.card.unitType === UnitType.Leader && this._leaderCount >= ALLOWED_LEADER)
                || (cardView.card.rarity === Rarity.Legendary && this._legendaryCount >= ALLOWED_LEGENDARY)
                || (cardView.card.rarity === Rarity.Rare && this._rareCount >= ALLOWED_RARE)
                || (cardView.card.rarity === Rarity.Common && this._commonCount >= ALLOWED_COMMON);

            if (isDisabled) {
                cardView.tint = 0x444444;
            } else {
                cardView.tint = 0xFFFFFF;
            }
        });
    }

    private applySelectAnimation(cardView: CardView): void {
        gsap.fromTo(cardView.scale, {
            x: 0.7,
            y: 0.7
        }, {
            x: 0.8,
            y: 0.8,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
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

    private orderDeck(): void {
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

    public getDeckCards(): Deck {
        const deck = new Deck();
        const leaderCard = this._deckCards.find(cardView => cardView.card.unitType === UnitType.Leader);
        
        if (leaderCard) {
            deck.setLeader(leaderCard.card as LeaderCard);
        }

        for (const cardView of this._deckCards.filter(c => c !== leaderCard)) {
            deck.addCard(cardView.card);
        }
        return deck;
    }
}