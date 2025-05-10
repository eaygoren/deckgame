import { Card } from "../game/Card";
import { Game } from "../game/Game";
import { Player } from "../game/Player";

export interface Ability {
  name: string;
  description: string;
  activate(card: Card, owner: Player, game?: Game): void;
}