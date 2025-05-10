import { Turn } from "../shared/enums";
import { Player } from "./Player";

export class Game {
  player: Player;
  bot: Player;
  turn: Turn = Turn.Player;

  constructor(player: Player, bot: Player) {
    this.player = player;
    this.bot = bot;
  }

  start() {
    // Lider kartların özel yeteneklerini başta aktive et
    this.player.leader.LeaderAbility.activate(this.player.leader, this.player, this);
    this.bot.leader.LeaderAbility.activate(this.bot.leader, this.bot, this);
  }

  nextTurn() {
    if (this.turn === Turn.Player) {
      this.player.playTurn(this, this.bot);
      this.player.drawCard();
      this.turn = Turn.Bot;
    } else {
      this.bot.playTurn(this, this.player);
      this.bot.drawCard();
      this.turn = Turn.Player;
    }
  }
}
