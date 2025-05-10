import { Card } from "../game/Card";
import { Player } from "../game/Player";
import { Ability } from "./interfaces";

export const commonDeathAbility: Ability = {
    name: "Death Transfer",
    description: "Öldüğünde elindeki rastgele bir karta saldırı gücünün %20'sini aktarır.",
    activate(card: Card, owner: Player) {
        if (owner.hand.length > 0) {
            const randomCard = owner.hand[Math.floor(Math.random() * owner.hand.length)];
            randomCard.Attack += Math.floor(card.Attack * 0.2);
        }
    },
};

export const legendaryEntryAbility: Ability = {
    name: "Legendary Entry",
    description: "Oyuna girdiğinde tüm kartların canını kendi canının %50'si kadar arttırır.",
    activate(card: Card, owner: Player) {
        owner.hand.forEach((c: Card) => {
            c.Health += Math.floor(card.Health * 0.5);
        });
    },
};

export const leaderBoostAbility: Ability = {
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