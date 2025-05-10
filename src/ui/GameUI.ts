import { Application, Container, Text } from "pixi.js";
import { Game } from "../game/Game";
import { Player } from "../game/Player";
import { Deck } from "../game/Deck";
import { Card, LeaderCard, Faction, Rarity, Ability, Color } from "../game/Card";
import { HandRenderer } from "./HandRenderer";
import { FieldRenderer } from "./FieldRenderer";
import { LeaderRenderer } from "./LeaderRenderer";
import { EndGameRenderer } from "./EndGameRenderer";

// Yetenekler ve deste oluşturma fonksiyonları buraya taşındı
const commonDeathAbility: Ability = {
  name: "Death Transfer",
  description: "Öldüğünde elindeki rastgele bir karta saldırı gücünün %20'sini aktarır.",
  activate(card: Card, owner: Player) {
    if (owner.hand.length > 0) {
      const randomCard = owner.hand[Math.floor(Math.random() * owner.hand.length)];
      randomCard.Attack += Math.floor(card.Attack * 0.2);
    }
  },
};

const legendaryEntryAbility: Ability = {
  name: "Legendary Entry",
  description: "Oyuna girdiğinde tüm kartların canını kendi canının %50'si kadar arttırır.",
  activate(card: Card, owner: Player) {
    owner.hand.forEach((c: Card) => {
      c.Health += Math.floor(card.Health * 0.5);
    });
  },
};

const leaderBoostAbility: Ability = {
  name: "Leader Boost",
  description: "Tüm takım arkadaşlarının statlarını 1 arttırır.",
  activate(card: Card, owner: Player) {
    owner.hand.forEach((c: Card) => {
      if (c !== card) {
        c.Attack += 1;
        c.Health += 1;
      }
    });
  },
};

function createTestDeck(isBot: boolean = false): Deck {
  const deck = new Deck();
  const leader = new LeaderCard(
    isBot ? "Bot Lider" : "Oyuncu Lider",
    5,
    10,
    Faction.Empire,
    Rarity.Legendary,
    Color.Leader,
    leaderBoostAbility,
    "assets/knight.png"
  );
  deck.setLeader(leader);
  deck.addCard(new Card("Common Savaşçı", 3, 4, Faction.Forest, Rarity.Common, Color.Common, "assets/assassin.png", commonDeathAbility));
  deck.addCard(new Card("Rare Okçu", 4, 3, Faction.Empire, Rarity.Rare, Color.Rare, "assets/elf.png"));
  deck.addCard(new Card("Legendary Mage", 6, 5, Faction.Forest, Rarity.Legendary, Color.Legendary, "assets/mage.png", legendaryEntryAbility));
  deck.addCard(new Card("Common Shield", 2, 6, Faction.Empire, Rarity.Common, Color.Common, "assets/siren.png"));
  return deck;
}

export class GameUI {
  app: Application;
  game!: Game;
  player!: Player;
  bot!: Player;
  playerField: Card[] = [];
  botField: Card[] = [];
  playerLeaderView: any = null;
  botLeaderView: any = null;
  fieldContainer: Container | null = null;
  winnerText: Text | null = null;
  handRenderer: HandRenderer;
  fieldRenderer: FieldRenderer;
  leaderRenderer: LeaderRenderer;
  endGameRenderer: EndGameRenderer;

  constructor(app: Application) {
    this.app = app;
    this.handRenderer = new HandRenderer(this.app);
    this.fieldRenderer = new FieldRenderer(this.app);
    this.leaderRenderer = new LeaderRenderer(this.app);
    this.endGameRenderer = new EndGameRenderer(this.app);
    (globalThis as any).__PIXI_APP__ = this.app;
  }

  async init() {
    (window as any).gameUI = this;
    this.setupGameLogic();
    this.renderAll();
  }

  setupGameLogic() {
    const playerDeck = createTestDeck(false);
    const botDeck = createTestDeck(true);
    this.player = new Player("Oyuncu", playerDeck);
    this.bot = new Player("Bot", botDeck);
    this.game = new Game(this.player, this.bot);
    this.game.start();
    this.playerField = this.player.hand.filter(c => !(c instanceof LeaderCard));
    this.botField = this.bot.hand.filter(c => !(c instanceof LeaderCard));
  }

  renderAll() {
    this.app.stage.removeChildren();
    // Liderler
    const leaders = this.leaderRenderer.renderLeaders(this.player.leader, this.bot.leader);
    this.playerLeaderView = leaders.playerLeaderView;
    this.botLeaderView = leaders.botLeaderView;
    // Oyun alanı
    this.fieldContainer = this.fieldRenderer.renderField(this.playerField, this.botField, (card: Card, isPlayer: boolean) => this.selectAttack(card, isPlayer), true);
    // Elleri
    this.handRenderer.renderHand(this.player.hand, 500, true, (card: Card) => this.playCardToField(card));
    this.handRenderer.renderHand(this.bot.hand, 50, false, () => {});
    // Kazanan varsa göster
    if (this.winnerText) this.app.stage.addChild(this.winnerText);
  }

  playCardToField(card: Card) {
    const idx = this.player.hand.indexOf(card);
    if (idx !== -1) {
      this.player.hand.splice(idx, 1);
      this.playerField.push(card);
      this.renderAll();
      setTimeout(() => this.selectAttack(card, true), 500);
    }
  }

  selectAttack(attacker: Card, isPlayer: boolean) {
    if (!isPlayer) return;
    this.fieldContainer?.children.forEach((view, i) => {
      if (i >= this.playerField.length && i < this.playerField.length + this.botField.length) {
        const defender = this.botField[i - this.playerField.length];
        if (!(defender instanceof LeaderCard)) {
          view.interactive = true;
          view.on("pointerup", () => {
            this.attackCard(attacker, defender, true);
          });
        }
      }
    });
  }

  attackCard(attacker: Card, defender: Card, isPlayer: boolean) {
    defender.Health -= attacker.Attack;
    attacker.Health -= defender.Attack;
    // Silinmesi gereken kartları alanlardan çıkar
    if (defender.Health <= 0) {
      if (defender instanceof LeaderCard) {
        this.endGame(isPlayer ? "Oyuncu Kazandı!" : "Bot Kazandı!");
        return;
      }
      if (isPlayer) {
        this.botField = this.botField.filter(c => c !== defender);
        this.bot.drawCard();
        const newCard = this.bot.hand.find(c => !this.botField.includes(c));
        if (newCard) this.botField.push(newCard);
      } else {
        this.playerField = this.playerField.filter(c => c !== defender);
        this.player.drawCard();
        const newCard = this.player.hand.find(c => !this.playerField.includes(c));
        if (newCard) this.playerField.push(newCard);
      }
    }
    if (attacker.Health <= 0) {
      if (isPlayer) {
        this.playerField = this.playerField.filter(c => c !== attacker);
      } else {
        this.botField = this.botField.filter(c => c !== attacker);
      }
    }
    this.renderAll();
    if (isPlayer && this.botField.some(c => !(c instanceof LeaderCard))) {
      setTimeout(() => this.botAttack(), 800);
    }
  }

  botAttack() {
    const possibleAttackers = this.botField;
    const possibleDefenders = this.playerField.filter(c => !(c instanceof LeaderCard));
    if (possibleAttackers.length === 0 || possibleDefenders.length === 0) return;
    const attacker = possibleAttackers[Math.floor(Math.random() * possibleAttackers.length)];
    const defender = possibleDefenders[Math.floor(Math.random() * possibleDefenders.length)];
    this.attackCard(attacker, defender, false);
  }

  endGame(winner: string) {
    this.endGameRenderer.showWinner(winner);
  }
}
