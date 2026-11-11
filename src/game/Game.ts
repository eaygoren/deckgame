import { Card, LeaderCard } from "./Card";
import { Deck } from "./Deck";
import { Player } from "./Player";
import { BattleField } from "../ui/BattleField";
import { CardView } from "../ui/CardView";
import { ClassType, Rarity, Turn, UnitType } from "../shared/enums";
import { CombatManager } from "../managers/CombatManager";
import { AnimationManager } from "../managers/AnimationManager";
import { Broadcast } from "../utils/Broadcast";
import { BroadcastEvents } from "../shared/constants/events";
import { CharacterList } from "../shared/constants/characters";
import { Environment } from "../shared/constants/gameConfig";
import { CombatContext, EffectType, SkillTiming } from "../shared/interfaces/skillInterfaces";
import { BotAI } from "./BotAI";
import { AvailabilityType } from "../shared/interfaces";

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
  private _attacker: CardView | null = null;
  private _turn: Turn = Turn.Player;
  private _phase: "ready" | "attacking" | "resolving" | "finished" = "ready";
  private stopped = false;
  private botTimer?: ReturnType<typeof setTimeout>;
  private readonly turnHint = document.getElementById("battle-hint")!;
  private readonly preview = document.querySelector<HTMLElement>("#battle-preview")!;
  private previewTarget: CardView | null = null;

  constructor(playerDeck: Deck, private readonly onMatchEnded: (won: boolean) => void) {
    this._broadcast = new Broadcast();
    this._battlefield = new BattleField(this._broadcast);
    this._combatManager = new CombatManager(this._broadcast);
    this._animationManager = new AnimationManager(this._broadcast);
    this._botAI = new BotAI(this._combatManager);
    this._player = this.createPlayer(playerDeck);
    this._bot = this.createBot();
    this._combatManager.player = this._player;
    this._combatManager.opponent = this._bot;
  }

  public start(): void {
    this._playerCardViews = this.mountHand(this._player, Turn.Player);
    this._botCardViews = this.mountHand(this._bot, Turn.Bot);
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

  private canTarget(card: Card, opponent: Player): boolean {
    return card.health > 0 && (card.unitType !== UnitType.Leader
      || !opponent.hand.some(ally => ally.health > 0 && ally.unitType !== UnitType.Leader));
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
    const { normal, critical, counter } = this._combatManager.previewCombat(attacker, target.card);
    const parts = [target.card.name + " · Hasar " + normal];
    if (critical !== null) parts.push("Kritik " + critical);
    parts.push("Karşı hasar " + counter);
    if (attacker.skill?.triggerTiming === SkillTiming.BeforeAttack) parts.push("Yetenek değerleri değiştirebilir");
    if (confirmWithTap) parts.push("Saldırmak için tekrar dokun");
    this.clearDamagePreview();
    this.preview.textContent = parts.join(" · ");
    this.preview.hidden = false;
    this.previewTarget = target;
    target.action.setAttribute("aria-describedby", this.preview.id);
    const bounds = target.action.getBoundingClientRect();
    this.positionDamagePreview(pointer?.clientX ?? bounds.left + bounds.width / 2, pointer?.clientY ?? bounds.bottom);
  }

  private updateBattleHud(): void {
    this.clearDamagePreview();
    const playerTurn = this._turn === Turn.Player;
    const choosingTarget = playerTurn && this._phase === "ready" && this._attacker !== null;
    this.turnHint.textContent = this._phase === "finished" ? "Maç bitti"
      : this._phase !== "ready" ? "Hamle sonuçlanıyor…"
      : !playerTurn ? "Rakip düşünüyor…"
      : choosingTarget ? "Bir hedef seç" : "Saldıracak kartı seç";

    const ready = playerTurn && this._phase === "ready";
    this._battlefield.setActiveSide(this._phase === "finished" ? null : this._turn);
    for (const view of this._playerCardViews) {
      const frozen = view.card.hasEffect(EffectType.Freeze);
      const state = view === this._attacker && choosingTarget ? "attacker" : frozen ? "frozen" : "idle";
      view.setState(state, ready && !frozen);
    }
    for (const view of this._botCardViews) {
      const targetable = this.canTarget(view.card, this._bot);
      view.setState(choosingTarget && targetable ? "target" : targetable ? "idle" : "locked", choosingTarget && targetable);
    }
  }

  private handlePlayerCardClick(view: CardView): void {
    if (this._turn !== Turn.Player || this._phase !== "ready" || view.card.hasEffect(EffectType.Freeze)) return;
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

  private botTurn(): void {
    if (this._turn !== Turn.Bot || this._phase !== "ready") return;
    const attackers = this._botCardViews.filter(view => !view.card.hasEffect(EffectType.Freeze));
    const targets = this._playerCardViews.filter(view => this.canTarget(view.card, this._player));
    const move = this._botAI.findBestMove(attackers, targets);
    const attacker = attackers.find(view => view.card === move?.attacker);
    const defender = targets.find(view => view.card === move?.defender);
    if (attacker && defender) void this.attack(attacker, defender, this._playerCardViews);
  }

  private async attack(attacker: CardView, defender: CardView, opponents: CardView[]): Promise<void> {
    this._phase = "attacking";
    this.updateBattleHud();
    const result = await this._combatManager.resolveCombat(attacker, defender);
    if (this.stopped) return;
    if (result) {
      const animation = this._animationManager.playAttack(result);
      if (attacker.card.classType === ClassType.Mage) {
        this._broadcast.emit(BroadcastEvents.CHECK_ARCANE_BLAST, { attacker, opponentCardViews: opponents });
      }
      await animation;
    }
    await this.onTurnCompleted();
  }

  // Effect damage
  private async applyEffectDamage(card: Card): Promise<void> {
    if (!card.activeEffects) return;

    for (const effect of card.activeEffects) {
      const previousHealth = card.health;
      switch (effect.type) {
        case EffectType.Bleed:
          const bleedDamage = effect.value || 1;
          card.health = Math.max(0, card.health - bleedDamage);

          const cardView = this.findCardView(card);
          if (cardView) {
            cardView.updateStats();
          }

          this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
            targetView: cardView,
            message: `Kanama · ${previousHealth - card.health} hasar`,
            color: "#ff0000"
          });
          break;
        case EffectType.Burn:
          const burnDamage = effect.value || 1;
          card.health = Math.max(0, card.health - burnDamage);

          if (card.hasEffect(EffectType.WarriorRage)) {
            const warriorRage = card.activeEffects.filter(e => e.type === EffectType.WarriorRage);
            warriorRage.forEach(e => (e.duration = 0) && (e.value = undefined));
          }

          const burnCardView = this.findCardView(card);
          if (burnCardView) {
            burnCardView.updateStats();
          }

          this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
            targetView: burnCardView,
            message: `Yanma · ${previousHealth - card.health} hasar`,
            color: "#ff4500"
          });
          break;
        case EffectType.Poison:
          const poisonDamage = effect.value || 1;
          card.health = Math.max(0, card.health - poisonDamage);

          const poisonCardView = this.findCardView(card);
          if (poisonCardView) {
            poisonCardView.updateStats();
          }

          this._broadcast.emit(BroadcastEvents.SHOW_ABILITY_MESSAGE, {
            targetView: poisonCardView,
            message: `Zehir · ${previousHealth - card.health} hasar`,
            color: "#008000"
          });
          break;
      }
    };
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
      void view.updateCover();
    }

    if (activeViews.every(view => view.card.hasEffect(EffectType.Freeze))) {
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

    activeCardViews.forEach(view => {
      if (view.card.skill?.triggerTiming === SkillTiming.StartOfTurn && view.card.health > 0) {
        const context: CombatContext = {
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
    const allDeadCards = [...this._playerCardViews, ...this._botCardViews].filter(view => view.card.health <= 0);

    allDeadCards.forEach(deadCardView => {
      if (deadCardView.card.skill?.triggerTiming === SkillTiming.OnDeath) {
        const result = deadCardView.card.useSkill(deadCardView.card.skill.target, {
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

    for (const cardView of cardViews) {
      if (cardView.card.activeEffects) {
        await this.applyEffectDamage(cardView.card);
        await cardView.card.updateEffects();
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
    const playerDead = this._playerCardViews.filter(view => view.card.health <= 0);
    const botDead = this._botCardViews.filter(view => view.card.health <= 0);
    const fallen = [...playerDead, ...botDead];
    for (const view of fallen) {
      view.card.clearEffects();
      view.updateStats();
    }
    await this._animationManager.removeCards(fallen);
    if (this.stopped) return;
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
    this.onMatchEnded(playerAlive);
    return true;
  }

  private replaceDeadCards(player: Player, side: Turn, views: CardView[], dead: CardView[]): CardView[] {
    const survivors = views.filter(view => !dead.includes(view));
    player.hand = survivors.map(view => view.card);
    for (const view of dead) {
      const card = player.deck.drawRandomCard();
      if (!card) break;
      player.hand.push(card);
      const replacement = this.mountCard(card, side, view.slot);
      survivors.push(replacement);
      this._animationManager.showNewCard(replacement);
    }
    return survivors;
  }

}
