import { Container, ContainerChild, IRenderLayer, Sprite, Text } from "pixi.js";

export class BattleField extends Container {
    private static instance: BattleField;
    private _playerField!: Container;
    private _botField!: Container;
    private _battleLog!: Container;
    private _playerDeckText: Text | null = null;
    private _botDeckText: Text | null = null;

    private constructor() {
        super();
    }

    public static getInstance(): BattleField {
        if (!BattleField.instance) {
            BattleField.instance = new BattleField();
        }
        return BattleField.instance;
    }

    public showDeckCounts(playerCount: number, botCount: number) {
        // Player indicators
        if (!this._playerField) {
            this._playerField = new Container({ label: "PlayerField" });
            this.addChild(this._playerField);
        }
        if (!this._botField) {
            this._botField = new Container({ label: "BotField" });
            this.addChild(this._botField);
        }
        if (!this._battleLog) {
            this._battleLog = new Container({ label: "BattleLog" });
            this.addChild(this._battleLog);
        }

        let playerDeckIcon = Sprite.from("deck");
        playerDeckIcon.label = "PlayerDeckIcon";
        playerDeckIcon.position.set(1845, 802);
        playerDeckIcon.scale.x = -1;
        playerDeckIcon.angle = 7;
        playerDeckIcon.anchor.set(0.5, 0.5);
        this._playerField.addChild(playerDeckIcon);

        this._playerDeckText = new Text({ text: playerCount, style: { fontSize: 45, fill: 0x000000, fontWeight: "bold" } });
        this._playerDeckText.label = "PlayerDeckText";
        this._playerDeckText.position.set(1843, 800);
        this._playerDeckText.anchor.set?.(0.5, 0.5);
        this._playerField.addChild(this._playerDeckText);

        // Bot indicators
        let botDeckIcon = Sprite.from("deck");
        botDeckIcon.label = "BotDeckIcon";
        botDeckIcon.position.set(1845, 250);
        botDeckIcon.scale.x = -1;
        botDeckIcon.angle = 7;
        botDeckIcon.anchor.set(0.5, 0.5);
        this._botField.addChild(botDeckIcon);

        this._botDeckText = new Text({ text: botCount, style: { fontSize: 45, fill: 0x000000, fontWeight: "bold" } });
        this._botDeckText.label = "BotDeckText";
        this._botDeckText.position.set(1843, 250);
        this._botDeckText.anchor.set?.(0.5, 0.5);
        this._botField.addChild(this._botDeckText);
    }

    public updateDeckCounts(playerCount: number, botCount: number) {
        if (this._playerDeckText) {
            this._playerDeckText.text = playerCount.toString();
        }
        if (this._botDeckText) {
            this._botDeckText.text = botCount.toString();
        }
    }

    public addChildToPlayerField<U extends (ContainerChild | IRenderLayer)[]>(...children: U): void {
        if (!this._playerField) {
            this._playerField = new Container({ label: "PlayerField" });
            this.addChild(this._playerField);
        }
        this._playerField.addChild(...children);
    }

    public addChildToBotField<U extends (ContainerChild | IRenderLayer)[]>(...children: U): void {
        if (!this._botField) {
            this._botField = new Container({ label: "BotField" });
            this.addChild(this._botField);
        }
        this._botField.addChild(...children);
    }

    public get playerField(): Container {
        return this._playerField;
    }

    public get botField(): Container {
        return this._botField;
    }

    public get battleLog(): Container {
        return this._battleLog;
    }
}