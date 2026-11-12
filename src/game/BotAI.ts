import { CombatManager } from "../managers/CombatManager";
import { AttackType, UnitType, ClassType } from "../shared/enums";
import { MoveOption } from "../shared/interfaces";
import { CardView } from "../ui/CardView";
import { Card } from "./Card";

export interface BattleMove {
    attacker: Card;
    defender: Card;
}

export interface BattlePosition {
    fork(seed: number, hideEnemyDeck?: boolean): BattlePosition;
    moves(): BattleMove[];
    play(move: BattleMove | undefined): Promise<void>;
    score(): number;
    finished(): boolean;
    leaderAtRisk(): boolean;
    replyPriority(move: BattleMove): number;
}

export class BotAI {
    constructor(
        private readonly _combatManager: CombatManager,
        private readonly adaptiveSampling = true,
    ) {}

    public async plan(position: BattlePosition, seed: number): Promise<BattleMove | null> {
        const moves = position.moves();
        if (moves.length <= 1) return moves[0] ?? null;

        // Common random samples make candidate moves comparable.
        const seeds = [0x139f93a1, 0x52fb2d13, 0xcfa12659].map(salt => seed ^ salt);
        const candidates = [];
        for (const move of moves) {
            const outcomes = [];
            for (const seed of seeds) {
                const sample = position.fork(seed, true);
                await sample.play(move);
                outcomes.push(sample);
            }
            const score = outcomes.reduce((sum, outcome) => sum + outcome.score(), 0) / seeds.length;
            candidates.push({ move, outcomes, score });
        }
        candidates.sort((left, right) => right.score - left.score);
        const finalists = candidates.slice(0, 3);
        // Two points are roughly one reserve card in the board evaluation.
        const close = finalists[0].score - finalists[1].score <= 2;
        const leaderRisk = this.adaptiveSampling && (
            position.leaderAtRisk() ||
            finalists.some(candidate => candidate.outcomes.some(outcome =>
                outcome.finished() || outcome.leaderAtRisk()))
        );
        if (this.adaptiveSampling && (close || leaderRisk)) {
            const extraSeeds = [0x381fc715, 0xa66c713b, 0x946bdaef, 0x06dcbef9, 0xf72348ab]
                .map(salt => seed ^ salt);
            seeds.push(...extraSeeds);
            for (const candidate of finalists) {
                for (const sampleSeed of extraSeeds) {
                    const sample = position.fork(sampleSeed, true);
                    await sample.play(candidate.move);
                    candidate.outcomes.push(sample);
                }
                candidate.score = candidate.outcomes.reduce((sum, outcome) => sum + outcome.score(), 0) / seeds.length;
            }
        }

        let best = candidates[0].move;
        let bestScore = -Infinity;
        for (const candidate of finalists) {
            let replyScore = 0;
            for (const [index, outcome] of candidate.outcomes.entries()) {
                if (outcome.finished()) {
                    replyScore += outcome.score();
                    continue;
                }

                const replies = outcome.moves().sort((left, right) =>
                    outcome.replyPriority(right) - outcome.replyPriority(left)).slice(0, 2);
                let worstScore = Infinity;
                for (const reply of replies.length ? replies : [undefined]) {
                    const response = outcome.fork(seeds[index] ^ 0x6d2b79f5);
                    await response.play(reply);
                    worstScore = Math.min(worstScore, response.score());
                }
                replyScore += worstScore;
            }
            const score = 0.3 * candidate.score + 0.7 * replyScore / seeds.length;
            if (score > bestScore) {
                best = candidate.move;
                bestScore = score;
            }
        }
        return best;
    }

    public findBestMove(attackers: CardView[], defenders: CardView[], canTarget: (attacker: Card, target: Card) => boolean): { attacker: Card; defender: Card } | null {
        const moves: MoveOption[] = [];

        // Tüm olası hamleleri değerlendir
        for (const attackerView of attackers) {
            for (const defenderView of defenders) {
                if (!canTarget(attackerView.card, defenderView.card)) continue;
                const score = this.calculateMoveScore(attackerView.card, defenderView.card);

                moves.push({
                    attacker: attackerView.card,
                    defender: defenderView.card,
                    score
                });
            }
        }

        // Eğer hiç hamle yoksa null döndür
        if (moves.length === 0) return null;

        // En yüksek skora sahip hamleyi seç
        moves.sort((a, b) => b.score - a.score);
        const bestMove = moves[0];

        //console.log(`Best move selected: ${bestMove.attacker.Name} -> ${bestMove.defender.Name} (Score: ${bestMove.score})`);

        return {
            attacker: bestMove.attacker,
            defender: bestMove.defender
        };
    }

    public calculateMoveScore(attacker: Card, defender: Card): number {
        // LİDER KORUMASI: Lider kartı ölecekse saldırıyı reddet
        const preview = this._combatManager.previewCombat(attacker, defender);
        const counterDamage = Math.floor((preview.counter + (preview.counterCritical === null ? 0 :
            (preview.counterCritical - preview.counter) * preview.counterCritChance)) * (1 - preview.counterDodgeChance));
        const attackerTakesCounterDamage = attacker.attackType === AttackType.Melee;
        const attackerWillDie = attackerTakesCounterDamage && !attacker.isOnLastHunt && attacker.health <= counterDamage;

        if (attacker.unitType === UnitType.Leader && attackerWillDie) {
            return -10000; // Çok düşük skor ver, asla seçilmesin
        }

        const attackDamage = Math.floor((preview.normal + (preview.critical === null ? 0 :
            (preview.critical - preview.normal) * preview.critChance)) * (1 - preview.dodgeChance));

        const attackerSurvives = !attackerWillDie;
        const defenderDies = !defender.isOnLastHunt && defender.health <= attackDamage;
        const damageDealt = Math.min(attackDamage, defender.health);

        let score = 0;
        //let moveType = "unknown";

        // 1. ÖNCELİK: Düşman kartını öldür, ölme (mükemmel)
        if (attackerSurvives && defenderDies) {
            score = 10000 + (defender.attack * 200) + (defender.health * 50);
            //moveType = "Kill without dying";

            // Ranged attack bonusu (counter damage yok)
            if (attacker.attackType === AttackType.Ranged) {
                score += 3000; // Ranged'a büyük bonus
            }

            // En yüksek attack'lı hedefi öldürmek için bonus
            score += (defender.attack * 100);

            // Class bonusları
            if (attacker.classType === ClassType.Rogue) {
                score += 800; // Crit şansı var
            }
            if (attacker.classType === ClassType.Mage) {
                score += 1200; // Area damage potansiyeli
            }
        }

        // 2. ÖNCELİK: Trading (düşman kartını öldür, ama sen de öl)
        else if (!attackerSurvives && defenderDies) {
            score = 5000 + (defender.attack * 150) + (defender.health * 30);
            //moveType = "Trading";

            // Düşük değerli saldırgan ile trading yapılırsa bonus
            if (attacker.health <= 2) {
                score += 1500; // Düşük can kartı ile trade
            }
            if (attacker.attack <= 3) {
                score += 1000; // Düşük attack kartı ile trade
            }

            // Melee mage bonus (ölecek ama area damage verecek)
            if (attacker.classType === ClassType.Mage && attacker.attackType === AttackType.Melee) {
                score += 2000; // Mage area damage çok değerli
            }

            // Yüksek attack'lı hedefi trade etmek için ekstra bonus
            if (defender.attack >= 6) {
                score += 1200;
            }
        }

        // 3. ÖNCELİK: Öleceksin ama öldüremeyeceksin - maksimum hasar ver veya en değersiz kartı kullan
        else if (!attackerSurvives && !defenderDies) {
            score = 1000 + (damageDealt * 50);
            //moveType = "Sacrifice for damage";

            // En değersiz kartı kullanma bonusu
            if (attacker.health <= 2 && attacker.attack <= 3) {
                score += 800; // En değersiz kart
            }

            // Melee mage bonusu (area damage verecek)
            if (attacker.classType === ClassType.Mage && attacker.attackType === AttackType.Melee) {
                score += 1500; // Area damage değerli
            }

            // Maksimum hasar bonus
            score += (damageDealt * 20);
        }

        // 4. ÖNCELİK: Güvenli hasar (hiç kimse ölmüyor)
        else if (attackerSurvives && !defenderDies) {
            score = 100 + (damageDealt * 10);
            //moveType = "Safe damage";

            // Ranged bonus (güvenli hasar)
            if (attacker.attackType === AttackType.Ranged) {
                score += 300;
            }

            // Rogue bonus (crit şansı)
            if (attacker.classType === ClassType.Rogue) {
                score += 200;
            }
        }

        //console.log(`Move: ${attacker.Name}(${attacker.Attack}/${attacker.Health}) -> ${defender.Name}(${defender.Attack}/${defender.Health}) | Type: ${moveType} | Score: ${score} | Damage: ${attackDamage} | Counter: ${attacker.AttackType === AttackType.Ranged ? 0 : counterDamage} | Survives: ${attackerSurvives} | Defender Dies: ${defenderDies}`);

        return score;
    }
}
