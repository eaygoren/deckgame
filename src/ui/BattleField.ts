import { Container, Text } from "pixi.js";

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
        // Player indicator
        this.playerDeckText = new Text({ text: `Destede: ${playerCount} kart`, style: { fontSize: 24, fill: 0x000000, fontWeight: "bold" } });
        this.playerDeckText.x = 1800;
        this.playerDeckText.y = 750;
        this.playerDeckText.anchor.set?.(0.5, 0.5);
        this.addChild(this.playerDeckText);
        // Bot indicator
        this.botDeckText = new Text({ text: `Destede: ${botCount} kart`, style: { fontSize: 24, fill: 0x000000, fontWeight: "bold" } });
        this.botDeckText.x = 1800;
        this.botDeckText.y = 200;
        this.botDeckText.anchor.set?.(0.5, 0.5);
        this.addChild(this.botDeckText);
    }
}