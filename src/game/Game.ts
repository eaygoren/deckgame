import { Card, LeaderCard } from "./Card";
import { Deck } from "./Deck";
import { Player } from "./Player";
import { BattleField } from "../ui/BattleField";
import { CardView } from "../ui/CardView";
import { Rarity, Turn, UnitType } from "../shared/enums";
import { CombatManager } from "../managers/CombatManager";
import { AnimationManager } from "../managers/AnimationManager";
import { Broadcast } from "../utils/Broadcast";
import { BroadcastEvents } from "../shared/constants/events";
import { CharacterList } from "../shared/constants/characters";
import { Environment } from "../shared/constants/gameConfig";
import { CombatContext, EffectType, SkillTiming } from "../shared/interfaces/skillInterfaces";
import { BattleMove, BattlePosition, BotAI } from "./BotAI";
import { cloneBattleState, seededBattleRandom } from "./BattleSnapshot";
import { AvailabilityType } from "../shared/interfaces";

export type MatchOutcome = "win" | "loss" | "draw";

const reserveCandidates = Object.values(CharacterList).filter(card =>
  card.availabilityType === AvailabilityType.Playable && card.unitType === UnitType.Regular);

export class Game {
  private _broadcast: Broadcast;
  private _battlefield: BattleField;
  private _combatManager: CombatManager;
  private _animationManager: AnimationManager;
  private _botAI: BotAI;
  private _player: Player;
  private _bot: Player;
  private _playerCardViews: CardView[] = [];
  private _botCardViews: CardView[] = [];
  private readonly cardsReadyForTurnStartSkill = new WeakSet<CardView>();
  private _attacker: CardView | null = null;
  private _turn: Turn = Turn.Player;
  private _phase: "ready" | "attacking" | "resolving" | "finished" = "ready";
  private stopped = false;
  private simulation = false;
  private botTimer?: ReturnType<typeof setTimeout>;
  private readonly turnHint = document.getElementById("battle-hint")!;
  private readonly preview = document.querySelector<HTMLElement>("#battle-preview")!;
  private previewTarget: CardView | null = null;

  constructor(playerDeck: Deck, private readonly onMatchEnded: (outcome: MatchOutcome) => void) {
    this._broadcast = new Broadcast();
    this._battlefield = new BattleField(this._broadcast);
    this._animationManager = new AnimationManager(this._broadcast);
    this._combatManager = new CombatManager(this._broadcast, undefined,
      (source, target, impact) => this._animationManager.playAttack(source, target, impact),
      defender => this._animationManager.playBlockedCounter(defender));
    this._botAI = new BotAI(this._combatManager);
    this._player = this.createPlayer(playerDeck);
    this._bot = this.createBot();
    this._combatManager.player = this._player;
    this._combatManager.opponent = this._bot;
  }

  public start(): void {
    this._playerCardViews = this.mountHand(this._player, Turn.Player);
    this._botCardViews = this.mountHand(this._bot, Turn.Bot);
    for (const view of [...this._playerCardViews, ...this._botCardViews]) {
      if (view.card.name === CharacterList.Ganesha.name || view.card.name === CharacterList.Knight.name) {
        this.cardsReadyForTurnStartSkill.add(view);
      }
    }
    this._battlefield.updateCardPanels(this._player, this._bot);
    this.startTurn();
  }

  public stop(): void {
    this.stopped = true;
    this._phase = "finished";
    clearTimeout(this.botTimer);
    this.clearDamagePreview();
  }

  private createPlayer(deck: Deck): Player {
    const leader = deck.leader;

    const nonLeaderCards = deck.cards.filter(c => c.unitType !== UnitType.Leader);
    const randomSelectedCards = this.getRandomUniqueItems(nonLeaderCards, 4);

    const handCards: Card[] = [leader, ...randomSelectedCards];

    const remainingCards = nonLeaderCards.filter(card => !randomSelectedCards.includes(card));
    const team: Card[] = deck.cards;

    if (leader) {
      deck.cards = [...remainingCards];
    }

    const player = new Player("Player", deck);
    player.hand = handCards;
    player.team = team;

    return player;
  }

  private createBot(): Player {
    // Select a random leader card
    const keys = Object.keys(CharacterList) as Array<keyof typeof CharacterList>;
    const leaderKeys = keys.filter(key => CharacterList[key].unitType === UnitType.Leader);
    const randomLeaderKey = leaderKeys[Math.floor(Math.random() * leaderKeys.length)];
    const leaderData = CharacterList[randomLeaderKey];
    const leader = new LeaderCard({ ...leaderData }, Environment.crown);

    const deck = new Deck();
    deck.setLeader(leader);

    // Set remaining card limits
    let remainingLegendary = 2;
    let remainingRare = 4;
    let remainingCommon = 4; // 10 total - 1 leader = 9, flexible

    // Set limits based on leader's rarity
    switch (leader.rarity) {
      case Rarity.Legendary:
        remainingLegendary = Math.max(0, remainingLegendary - 1);
        break;
      case Rarity.Rare:
        remainingRare = Math.max(0, remainingRare - 1);
        break;
      case Rarity.Common:
        remainingCommon = Math.max(0, remainingCommon - 1);
        break;
    }

    // Select the remaining 9 cards in a balanced way
    const otherCards = this.getFlexibleBalancedCards(
      remainingLegendary,
      remainingRare,
      remainingCommon
    );

    // Hand and deck separation
    const openingCards = this.getRandomUniqueItems(otherCards, 4);
    const handCards = [leader, ...openingCards];
    const deckCards = otherCards.filter(card => !openingCards.includes(card));
    const team: Card[] = [...handCards, ...deckCards];
    deck.cards = [...deckCards];
    const player = new Player("Bot", deck);
    player.hand = handCards;
    player.team = team;

    return player;
  }

  private getFlexibleBalancedCards(maxLegendary: number, maxRare: number, maxCommon: number): Card[] {
    const keys = Object.keys(CharacterList) as Array<keyof typeof CharacterList>;
    const playableKeys = keys.filter(key => CharacterList[key].unitType !== UnitType.Leader && CharacterList[key].availabilityType === AvailabilityType.Playable);

    // Separate cards by rarity
    const legendaryKeys = playableKeys.filter(key => CharacterList[key].rarity === Rarity.Legendary);
    const rareKeys = playableKeys.filter(key => CharacterList[key].rarity === Rarity.Rare);
    const commonKeys = playableKeys.filter(key => CharacterList[key].rarity === Rarity.Common);

    const selectedKeys: (keyof typeof CharacterList)[] = [];

    // First, select legendary cards (up to maxLegendary)
    const legendarySelected = this.getRandomUniqueItems(legendaryKeys, maxLegendary);
    selectedKeys.push(...legendarySelected);

    // Next, select rare cards (up to maxRare)
    const rareSelected = this.getRandomUniqueItems(rareKeys, maxRare);
    selectedKeys.push(...rareSelected);

    // Then, fill the rest with common cards
    const remainingSlots = 9 - selectedKeys.length;
    const commonSelected = this.getRandomUniqueItems(commonKeys, Math.min(remainingSlots, maxCommon));
    selectedKeys.push(...commonSelected);

    // If we still have slots left, fill with more rare cards
    const stillRemaining = 9 - selectedKeys.length;
    if (stillRemaining > 0) {
      const extraRare = this.getRandomUniqueItems(
        rareKeys.filter(key => !selectedKeys.includes(key)),
        stillRemaining
      );
      selectedKeys.push(...extraRare);
    }

    return selectedKeys.map(key => {
      const data = CharacterList[key];
      return new Card({
        name: data.name,
        cover: data.cover,
        attack: data.attack,
        health: data.health,
        rarity: data.rarity,
        color: data.color,
        attackType: data.attackType,
        classType: data.classType,
        unitType: data.unitType,
      });
    });
  }

  private getRandomUniqueItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array];
    const sampleSize = Math.min(count, shuffled.length);
    for (let index = 0; index < sampleSize; index++) {
      const randomIndex = index + Math.floor(Math.random() * (shuffled.length - index));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled.slice(0, sampleSize);
  }

  private mountHand(player: Player, side: Turn): CardView[] {
    const unitSlots = [0, 1, 3, 4];
    return player.hand.map(card => this.mountCard(card, side, card.unitType === UnitType.Leader ? 2 : unitSlots.shift()!));
  }

  private mountCard(card: Card, side: Turn, slot: number): CardView {
    if (this.simulation) {
      // Simulation views only supply the card and slot to the shared turn resolver.
      return { card, slot, element: { isConnected: false }, updateStats() {}, updateCover() {} } as CardView;
    }
    const view = new CardView(card, slot);
    this._battlefield.addCard(view, side);
    if (side === Turn.Player) {
      view.action.addEventListener("click", () => this.handlePlayerCardClick(view));
    } else {
      let touch = false;
      view.action.addEventListener("pointerdown", event => { touch = event.pointerType === "touch"; });
      view.action.addEventListener("click", event => {
        this.handleBotCardClick(view, touch && event.detail > 0);
        touch = false;
      });
      view.action.addEventListener("pointerenter", event => {
        if (event.pointerType !== "touch") {
          this.showDamagePreview(view, false, event);
        }
      });
      view.action.addEventListener("pointermove", event => {
        if (event.pointerType !== "touch" && this.previewTarget === view) {
          this.positionDamagePreview(event.clientX, event.clientY);
        }
      });
      view.action.addEventListener("pointerleave", event => {
        if (event.pointerType !== "touch") this.clearDamagePreview();
      });
      view.action.addEventListener("focus", () => {
        if (!touch && this.previewTarget !== view) this.showDamagePreview(view);
      });
      view.action.addEventListener("blur", () => this.clearDamagePreview());
    }
    return view;
  }

  private canTarget(card: Card, opponent: Player, attacker = this._attacker?.card ?? null): boolean {
    return this._combatManager.canAttackTarget(attacker, card, opponent.hand);
  }

  private clearDamagePreview(): void {
    this.previewTarget?.action.removeAttribute("aria-describedby");
    this.previewTarget = null;
    this.preview.hidden = true;
  }

  private positionDamagePreview(x: number, y: number): void {
    const gap = 28;
    const edge = 12;
    let width = document.documentElement.clientWidth;
    let height = window.innerHeight;
    const arena = this.preview.offsetParent;
    if (arena instanceof HTMLElement && arena.classList.contains("is-scaled")) {
      const bounds = arena.getBoundingClientRect();
      const scale = bounds.width / arena.offsetWidth;
      x = (x - bounds.left) / scale;
      y = (y - bounds.top) / scale;
      width = arena.clientWidth;
      height = arena.clientHeight;
    }
    const { offsetWidth, offsetHeight } = this.preview;
    const left = Math.min(x - offsetWidth / 2, width - offsetWidth - edge);
    const top = y + gap + offsetHeight <= height - edge ? y + gap : y - offsetHeight - gap;
    this.preview.style.left = Math.max(edge, left) + "px";
    this.preview.style.top = Math.max(edge, top) + "px";
  }

  private showDamagePreview(target: CardView, confirmWithTap = false, pointer?: PointerEvent): void {
    if (this._turn !== Turn.Player || this._phase !== "ready" || !this._attacker) return;
    if (!this.canTarget(target.card, this._bot)) return;

    const attacker = this._attacker.card;
    const { normal, critical, counter, counterAfterCritical, counterCritical, critChance,
      counterCritChance, dodgeChance, counterDodgeChance, dodgeCounter } = this._combatManager.previewCombat(attacker, target.card);
    const parts = [target.card.name + " · Damage " + normal];
    if (critical !== null) parts.push(`Critical ${critical} (${critChance * 100}%)`);
    if (dodgeChance > 0) parts.push(`Target dodge chance ${dodgeChance * 100}%`);
    if (dodgeCounter !== null) parts.push(`Ranged counter damage on dodge ${dodgeCounter}`);
    parts.push(counterAfterCritical !== null && counterAfterCritical !== counter
      ? `Counter damage ${counter} (normal hit) / ${counterAfterCritical} (critical hit)`
      : "Counter damage " + counter);
    if (counterCritical !== null) parts.push(`Critical counter ${counterCritical} (${counterCritChance * 100}%)`);
    if (counterDodgeChance > 0) parts.push(`Counter dodge chance ${counterDodgeChance * 100}%`);
    if (attacker.skill?.triggerTiming === SkillTiming.BeforeAttack) parts.push("An ability may change these values");
    if (confirmWithTap) parts.push("Tap again to attack");
    this.clearDamagePreview();
    this.preview.textContent = parts.join(" · ");
    this.preview.hidden = false;
    this.previewTarget = target;
    target.action.setAttribute("aria-describedby", this.preview.id);
    const bounds = target.action.getBoundingClientRect();
    this.positionDamagePreview(pointer?.clientX ?? bounds.left + bounds.width / 2, pointer?.clientY ?? bounds.bottom);
  }

  private updateBattleHud(): void {
    if (this.simulation) return;
    this.clearDamagePreview();
    const playerTurn = this._turn === Turn.Player;
    const choosingTarget = playerTurn && this._phase === "ready" && this._attacker !== null;
    this.turnHint.textContent = this._phase === "finished" ? "Match ended"
      : this._phase !== "ready" ? "Resolving the move…"
      : !playerTurn ? "Opponent is thinking…"
      : choosingTarget ? "Choose a target" : "Choose an attacker";

    const ready = playerTurn && this._phase === "ready";
    this._battlefield.setActiveSide(this._phase === "finished" ? null : this._turn);
    for (const view of this._playerCardViews) {
      const frozen = view.card.isPhoenixEgg || view.card.hasEffect(EffectType.Freeze);
      const state = view === this._attacker && choosingTarget ? "attacker" : frozen ? "frozen" : "idle";
      view.setState(state, ready && !frozen);
    }
    for (const view of this._botCardViews) {
      const targetable = this.canTarget(view.card, this._bot);
      view.setState(choosingTarget && targetable ? "target" : targetable ? "idle" : "locked", choosingTarget && targetable);
    }
  }

  private handlePlayerCardClick(view: CardView): void {
    if (this._turn !== Turn.Player || this._phase !== "ready" || view.card.isPhoenixEgg || view.card.hasEffect(EffectType.Freeze)) return;
    this._attacker = this._attacker === view ? null : view;
    this.updateBattleHud();
  }

  private handleBotCardClick(view: CardView, touch: boolean): void {
    if (this._turn !== Turn.Player || this._phase !== "ready" || !this._attacker) return;
    if (!this.canTarget(view.card, this._bot)) return;
    if (touch && this.previewTarget !== view) {
      this.showDamagePreview(view, true);
      return;
    }
    void this.attack(this._attacker, view, this._botCardViews);
  }

  private async botTurn(): Promise<void> {
    if (this._turn !== Turn.Bot || this._phase !== "ready") return;
    const move = await this.planBotMove();
    if (this.stopped || this._turn !== Turn.Bot || this._phase !== "ready") return;
    const attackers = this._botCardViews;
    const targets = this._playerCardViews;
    const attacker = attackers.find(view => view.card === move?.attacker);
    const defender = targets.find(view => view.card === move?.defender);
    if (attacker && defender) void this.attack(attacker, defender, this._playerCardViews);
  }

  public planBotMove(): Promise<BattleMove | null> {
    // Derive samples from public state without advancing the live combat RNG.
    const visibleCards = [...this._player.hand, ...this._bot.hand];
    const seed = visibleCards.reduce((hash, card) => {
      const key = `${card.name}/${card.attack}/${card.health}/${card.activeEffects.length}`;
      for (let index = 0; index < key.length; index++) {
        hash = Math.imul(hash ^ key.charCodeAt(index), 16777619);
      }
      return hash;
    }, 2166136261);
    return this._botAI.plan(this.battlePosition(this._turn), seed);
  }

  private battlePosition(perspective: Turn, copies?: Map<object, object>): BattlePosition {
    const active = () => this._turn === Turn.Player ? this._playerCardViews : this._botCardViews;
    const waiting = () => this._turn === Turn.Player ? this._botCardViews : this._playerCardViews;
    return {
      fork: (seed, hideEnemyDeck) => this.forkBattle(perspective, seed, Boolean(hideEnemyDeck)),
      moves: () => {
        const moves: BattleMove[] = [];
        const opponent = this._turn === Turn.Player ? this._bot : this._player;
        for (const { card: attacker } of active()) {
          for (const { card: defender } of waiting()) {
            if (attacker.isAlive && this.canTarget(defender, opponent, attacker)) moves.push({ attacker, defender });
          }
        }
        return moves;
      },
      play: async move => {
        if (!move) {
          this._phase = "attacking";
          await this.onTurnCompleted();
          return;
        }
        const attacker = active().find(view => view.card === copies?.get(move.attacker))!;
        const defender = waiting().find(view => view.card === copies?.get(move.defender))!;
        await this.attack(attacker, defender, waiting());
      },
      score: () => {
        const score = this.scoreTeam(this._player) - this.scoreTeam(this._bot);
        return perspective === Turn.Player ? score : -score;
      },
      finished: () => this._phase === "finished",
      leaderAtRisk: () => {
        const opponent = this._turn === Turn.Player ? this._bot : this._player;
        for (const { card: attacker } of active()) {
          for (const { card: defender } of waiting()) {
            if (!attacker.isAlive ||
                (attacker.unitType !== UnitType.Leader && defender.unitType !== UnitType.Leader) ||
                !this.canTarget(defender, opponent, attacker)) continue;
            if (defender.unitType === UnitType.Leader) return true;
            const preview = this._combatManager.previewCombat(attacker, defender);
            if (!attacker.isOnLastHunt &&
                Math.max(preview.counter, preview.counterCritical ?? 0, preview.dodgeCounter ?? 0) >= attacker.health) {
              return true;
            }
          }
        }
        return false;
      },
      replyPriority: ({ attacker, defender }) => {
        const preview = this._combatManager.previewCombat(attacker, defender);
        const lethal = !defender.isOnLastHunt &&
          (preview.normal >= defender.health || (preview.critical ?? 0) >= defender.health);
        const priority = lethal && defender.unitType === UnitType.Leader ? 20000 : 0;
        return priority + this._botAI.calculateMoveScore(attacker, defender);
      },
    };
  }

  private forkBattle(perspective: Turn, seed: number, hideEnemyDeck: boolean): BattlePosition {
    const copies = new Map<object, object>();
    const broadcast = new Broadcast();
    const combat = new CombatManager(broadcast, seededBattleRandom(seed));
    const fork: Game = Object.create(Game.prototype);
    Object.assign(fork, {
      simulation: true,
      _phase: this._phase,
      _turn: this._turn,
      _broadcast: broadcast,
      _combatManager: combat,
      _botAI: new BotAI(combat),
      _battlefield: { updateCardPanels() {} },
      _animationManager: { async removeCards() {}, showNewCard() {} },
      cardsReadyForTurnStartSkill: new WeakSet<CardView>(),
      onMatchEnded() {},
    });
    fork._player = cloneBattleState(this._player, copies);
    fork._bot = cloneBattleState(this._bot, copies);
    if (hideEnemyDeck) {
      const enemy = perspective === Turn.Player ? fork._bot : fork._player;
      fork.sampleEnemyReserve(enemy, seededBattleRandom(seed ^ 0x2b84d6d1));
    }

    const copyViews = (views: CardView[], side: Turn) => views.map(view => {
      const copy = fork.mountCard(cloneBattleState(view.card, copies), side, view.slot);
      if (this.cardsReadyForTurnStartSkill.has(view)) fork.cardsReadyForTurnStartSkill.add(copy);
      return copy;
    });
    fork._playerCardViews = copyViews(this._playerCardViews, Turn.Player);
    fork._botCardViews = copyViews(this._botCardViews, Turn.Bot);
    combat.player = fork._turn === Turn.Player ? fork._player : fork._bot;
    combat.opponent = fork._turn === Turn.Player ? fork._bot : fork._player;
    return fork.battlePosition(perspective, copies);
  }

  private sampleEnemyReserve(enemy: Player, random: () => number): void {
    const count = enemy.deck.cards.length;
    const known = enemy.team.filter(card => enemy.hand.includes(card) || !card.isAlive);
    const knownNames = new Set(known.map(card => card.name));
    const available = reserveCandidates.filter(card => !knownNames.has(card.name));
    const reserve: Card[] = [];
    for (let index = 0; index < count && available.length; index++) {
      const [stats] = available.splice(Math.floor(random() * available.length), 1);
      reserve.push(new Card(stats));
    }
    // Decks can exceed the deck builder limit after summons.
    enemy.deck.cards.length = 0;
    for (const card of reserve) enemy.deck.addCard(card);
    enemy.team = [...known, ...reserve];
  }

  private scoreTeam(player: Player): number {
    if (!player.hand.some(card => card.unitType === UnitType.Leader)) return -1000;
    return player.deck.cards.length * 2 + player.hand.reduce((score, card) => {
      if (card.unitType === UnitType.Leader) {
        return score + 2 * card.health - 8 / Math.max(1, card.health);
      }
      const poison = card.activeEffects.reduce((damage, effect) =>
        damage + ([EffectType.Bleed, EffectType.Burn, EffectType.Poison].includes(effect.type) ? (effect.value ?? 1) : 0), 0);
      const condition = Number(card.hasEffect(EffectType.Freeze)) * 2
        + Number(card.hasEffect(EffectType.ZombifyPending)) * 2
        + Number(card.hasEffect(EffectType.VoidLock)) * 0.75
        + Number(card.hasEffect(EffectType.Mark)) * 0.75;
      const attack = card.isPhoenixEgg ? CharacterList.Phoenix.attack * 0.55 : card.attack;
      return score + 5 + 0.75 * attack + 0.65 * Math.max(0, card.health - poison) - condition;
    }, 0);
  }

  private async attack(attacker: CardView, defender: CardView, opponents: CardView[]): Promise<void> {
    this._phase = "attacking";
    this.updateBattleHud();
    let followUp: boolean;
    do {
      const result = await this._combatManager.resolveCombat(attacker, defender, opponents);
      if (this.stopped) return;
      if (!result) break;

      await this._combatManager.resolveArcaneBlast(attacker, opponents);
      if (this.stopped) return;
      followUp = result.followUp;
      if (!followUp) await this._combatManager.resolveThunderMark(attacker, opponents);
      if (this.stopped) return;
    } while (followUp);
    await this.onTurnCompleted();
  }

  // Effect damage
  private async applyEffectDamage(card: Card): Promise<void> {
    if (card.isOnLastHunt) return;

    for (const effect of card.activeEffects) {
      const previousHealth = card.health;
      switch (effect.type) {
        case EffectType.Bleed:
          const bleedDamage = effect.value ?? 1;
          card.health = Math.max(0, card.health - bleedDamage);

          const cardView = this.findCardView(card);
          if (cardView) {
            cardView.updateStats();
          }

          this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
            targetView: cardView,
            message: `Bleed · ${previousHealth - card.health} damage`,
            color: "#ff0000"
          });
          break;
        case EffectType.Burn:
          const burnDamage = effect.value ?? 1;
          card.health = Math.max(0, card.health - burnDamage);

          const burnCardView = this.findCardView(card);
          if (burnCardView) {
            burnCardView.updateStats();
          }

          this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
            targetView: burnCardView,
            message: `Burn · ${previousHealth - card.health} damage`,
            color: "#ff4500"
          });
          break;
        case EffectType.Poison:
          const poisonDamage = effect.value ?? 1;
          card.health = Math.max(0, card.health - poisonDamage);

          const poisonCardView = this.findCardView(card);
          if (poisonCardView) {
            poisonCardView.updateStats();
          }

          this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
            targetView: poisonCardView,
            message: `Poison · ${previousHealth - card.health} damage`,
            color: "#008000"
          });
          break;
      }
      if (card.health > 0 && card.health < previousHealth && card.skill?.triggerTiming === SkillTiming.OnDamageReceived) {
        card.useSkill(undefined, { isCounterAttack: true, random: this._combatManager.random });
      }
    }
  }

  private findCardView(card: Card): CardView | null {
    // Player kartlarında ara
    const playerView = this._playerCardViews.find(view => view.card === card);
    if (playerView) return playerView;

    // Bot kartlarında ara
    const botView = this._botCardViews.find(view => view.card === card);
    if (botView) return botView;

    return null;
  }

  private startTurn(): void {
    const activeViews = this._turn === Turn.Player ? this._playerCardViews : this._botCardViews;
    for (const view of activeViews) {
      view.card.removeEffect(EffectType.Protection);
    }

    this.triggerStartOfTurnSkills();
    for (const view of activeViews) {
      view.updateStats();
    }

    if (this.simulation) {
      this._phase = "ready";
      return;
    }

    const opponent = this._turn === Turn.Player ? this._bot : this._player;
    const hasMove = activeViews.some(({ card }) => opponent.hand.some(target => this.canTarget(target, opponent, card)));
    if (!hasMove) {
      this._phase = "attacking";
      this.updateBattleHud();
      void this.onTurnCompleted();
      return;
    }

    this._phase = "ready";
    this.updateBattleHud();
    if (this._turn === Turn.Bot) this.botTimer = setTimeout(() => this.botTurn(), 2000);
  }

  // Start of turn skill'leri
  private triggerStartOfTurnSkills(): void {
    const isPlayerTurn = this._turn === Turn.Player;
    const activeCardViews = isPlayerTurn ? this._playerCardViews : this._botCardViews;
    const player = isPlayerTurn ? this._player : this._bot;
    const opponent = isPlayerTurn ? this._bot : this._player;

    const ganeshas = activeCardViews.filter(view => view.card.name === CharacterList.Ganesha.name);
    const otherCards = activeCardViews.filter(view => view.card.name !== CharacterList.Ganesha.name);
    [...ganeshas, ...otherCards].forEach(view => {
      const needsReadyView = view.card.name === CharacterList.Herbalist.name
        || view.card.name === CharacterList.Ganesha.name || view.card.name === CharacterList.Knight.name;
      if (needsReadyView && !this.cardsReadyForTurnStartSkill.has(view)) return;
      if (view.card.skill?.triggerTiming === SkillTiming.StartOfTurn && view.card.isAlive) {
        const context: CombatContext = {
          random: this._combatManager.random,
          attacker: view.card,
          defender: null,
          damage: 0,
          isCounterAttack: false,
          allPlayerCards: player.hand,
          allOpponentCards: opponent.hand,
          player,
          opponent,
        };

        const result = view.card.useSkill(undefined, context);
        if (result?.success && result.message) {
          this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
            targetView: view,
            abilityName: view.card.skill.name,
            message: result.message,
            color: "#9932cc"
          });
        }
      }
    });
  }

  private triggerDeathSkills(): void {
    const allDeadCards = [...this._playerCardViews, ...this._botCardViews].filter(view => !view.card.isAlive);

    allDeadCards.forEach(deadCardView => {
      if (this._combatManager.tryPhoenixRebirth(deadCardView)) return;
      if (deadCardView.card.skill?.triggerTiming === SkillTiming.OnDeath) {
        const result = deadCardView.card.useSkill(deadCardView.card.skill.target, {
          random: this._combatManager.random,
          player: this._player.team.includes(deadCardView.card) ? this._player : this._bot
        });

        if (result?.success && result.message) {
          this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
            targetView: deadCardView,
            abilityName: deadCardView.card.skill.name,
            message: result.message,
            color: "#a7d5b6"
          });
        }
      }
    });

    const allCardViews = [...this._playerCardViews, ...this._botCardViews];

    for (const cardView of allCardViews) {
      cardView.card.removeFearFromFallenSources();
      cardView.updateStats();
    }
  }

  private async checkActiveEffects(): Promise<void> {
    let cardViews: CardView[] = [];

    switch (this._turn) {
      case Turn.Player:
        cardViews = this._playerCardViews;
        break;
      case Turn.Bot:
        cardViews = this._botCardViews;
        break;
    }

    const inactiveViews = this._turn === Turn.Player ? this._botCardViews : this._playerCardViews;
    const activeTeam = (this._turn === Turn.Player ? this._player : this._bot).team;
    for (const view of inactiveViews) {
      view.card.tickSourceTurnEffects(activeTeam);
      view.card.tickOpponentTurnEffects();
      view.updateCover();
    }

    for (const cardView of cardViews) {
      if (cardView.card.activeEffects) {
        await this.applyEffectDamage(cardView.card);
        if (cardView.card.isAlive) {
          const wasEgg = cardView.card.isPhoenixEgg;
          await cardView.card.updateEffects();
          cardView.card.tickLastHunt();
          if (wasEgg && !cardView.card.isPhoenixEgg && !cardView.card.isZombified) {
            this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
              targetView: cardView, abilityName: cardView.card.skill?.name, message: "Phoenix was reborn!", color: "#ff6600"
            });
          }
        }
        await cardView.updateCover();
        cardView.updateStats();
      }
    }

  }

  private async onTurnCompleted(): Promise<void> {
    if (this._phase !== "attacking") return;
    this._phase = "resolving";

    await this.checkActiveEffects();
    if (this.stopped) return;
    this.triggerDeathSkills();

    this._attacker = null;

    this._combatManager.handleWarriorAbility(this._playerCardViews, this._botCardViews);
    const playerDead = this._playerCardViews.filter(view => !view.card.isAlive);
    const botDead = this._botCardViews.filter(view => !view.card.isAlive);
    const fallen = [...playerDead, ...botDead];
    for (const view of fallen) {
      view.card.clearEffects();
      view.updateStats();
    }
    await this._animationManager.removeCards(fallen);
    if (this.stopped) return;
    const waitingViews = this._turn === Turn.Player ? this._botCardViews : this._playerCardViews;
    for (const view of waitingViews) {
      if (view.card.isAlive) {
        this.cardsReadyForTurnStartSkill.add(view);
      }
    }
    this._playerCardViews = this.replaceDeadCards(this._player, Turn.Player, this._playerCardViews, playerDead);
    this._botCardViews = this.replaceDeadCards(this._bot, Turn.Bot, this._botCardViews, botDead);
    this._battlefield.updateCardPanels(this._player, this._bot);

    if (this.checkForWinner()) return;

    this._turn = this._turn === Turn.Player ? Turn.Bot : Turn.Player;
    const player = this._turn === Turn.Player ? this._player : this._bot;
    const opponent = this._turn === Turn.Player ? this._bot : this._player;
    this._combatManager.player = player;
    this._combatManager.opponent = opponent;
    this.startTurn();
  }

  private checkForWinner(): boolean {
    if (this._phase === "finished") return true;

    const playerAlive = this._player.hand.some(card => card.unitType === UnitType.Leader);
    const botAlive = this._bot.hand.some(card => card.unitType === UnitType.Leader);
    if (playerAlive && botAlive) return false;

    this._phase = "finished";
    this.updateBattleHud();
    this.onMatchEnded(playerAlive ? "win" : botAlive ? "loss" : "draw");
    return true;
  }

  private replaceDeadCards(player: Player, side: Turn, views: CardView[], dead: CardView[]): CardView[] {
    const survivors = views.filter(view => !dead.includes(view));
    player.hand = survivors.map(view => view.card);
    for (const view of dead) {
      const card = player.deck.drawRandomCard(this._combatManager.random);
      if (!card) break;
      player.hand.push(card);
      const replacement = this.mountCard(card, side, view.slot);
      survivors.push(replacement);
      this._animationManager.showNewCard(replacement);
    }
    return survivors;
  }

}
