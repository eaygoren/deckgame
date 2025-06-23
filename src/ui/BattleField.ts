import { Container, Sprite, Text } from "pixi.js";

export class BattleField extends Container {
    private static instance: BattleField;
    private playerDeckText: Text | null = null;
    private botDeckText: Text | null = null;

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
        // Remove old texts if they exist
        if (this.playerDeckText) this.removeChild(this.playerDeckText);
        if (this.botDeckText) this.removeChild(this.botDeckText);

        // Player indicators
        let playerDeckIcon = Sprite.from("deck");
        playerDeckIcon.position.set(1845, 802);
        playerDeckIcon.scale.x = -1;
        playerDeckIcon.angle = 7;
        playerDeckIcon.anchor.set(0.5, 0.5);
        this.addChild(playerDeckIcon);

        this.playerDeckText = new Text({ text: playerCount, style: { fontSize: 45, fill: 0x000000, fontWeight: "bold" } });
        this.playerDeckText.position.set(1843, 800);
        this.playerDeckText.anchor.set?.(0.5, 0.5);
        this.addChild(this.playerDeckText);

        // Bot indicators
        let botDeckIcon = Sprite.from("deck");
        botDeckIcon.position.set(1845, 250);
        botDeckIcon.scale.x = -1;
        botDeckIcon.angle = 7;
        botDeckIcon.anchor.set(0.5, 0.5);
        this.addChild(botDeckIcon);

        this.botDeckText = new Text({ text: botCount, style: { fontSize: 45, fill: 0x000000, fontWeight: "bold" } });
        this.botDeckText.position.set(1843, 250);
        this.botDeckText.anchor.set?.(0.5, 0.5);
        this.addChild(this.botDeckText);
    }

    public updateDeckCounts(playerCount: number, botCount: number) {
        if (this.playerDeckText) {
            this.playerDeckText.text = playerCount.toString();
        }
        if (this.botDeckText) {
            this.botDeckText.text = botCount.toString();
        }
    }
}