import { AttackType, ClassType, Color, Rarity } from "../enums";

export const Characters = {
    Aerwyn: "Aerwyn", // %25 ihtimalle saldırılardan kaçınır
    Alien: "Alien", // hasar aldıktan sonra görünmez olur, görünmezken rakipler counter saldırı yapamaz
    Archangel: "Archangel", // saldırı yaptığı tur sonrası, takımındaki en düşük canı olan kartı (kendisi hariç), verdiği hasarın %50'si kadar iyileştirir
    Archmage: "Archmage",
    Assassin: "Assassin", // kritik ihtimalini 2 katına çıkarır, %25 ihtimalle counter saldırı ile kritik hasar verebilir
    Cerberus: "Cerberus",
    Cyclop: "Cyclop",
    Dragon: "Dragon", // hasar verdiği rakipleri 1 tur yakar, yanan rakipler 1 tur boyunca %50 saldırı gücü kaybeder
    // Dwarf: "Dwarf",
    Elf: "Elf", // tüm hasar düşürme etkilerini yok sayar
    Ent: "Ent", // saldırdığı rakibi, bir tur boyunca sadece Ent'e saldırabilir
    Gunslinger: "Gunslinger", // saldırdığı rakip işaretlenir, işaretli rakip 1 tur boyunca %50 daha fazla hasar alır
    Illusionist: "Illusionist", // oyun başına bir kez olmak üzere, rakibin canı ile saldırı gücünü değiştirir
    Joker: "Joker", // saldırdığı rakibin hasarı kendi hasarından yüksekse, rakibin hasarını kendi hasarına eşitler
    Knight: "Knight", // tur başında 1 takım arkadaşını korur, koruduğu kart hasarın yarısını alır ve hasarın diğer yarısını kendisi alır
    Lich: "Lich", // rakibi 1 tur dondurur, donan kart bir 1 tur saldırı yapamaz
    // Medusa: "Medusa",
    // Minotaur: "Minotaur",
    Monk: "Monk",
    // Mummy: "Mummy",
    // Naga: "Naga",
    Ra: "Ra",
    // Phoenix: "Phoenix", // yumurta formuna geçer, 1 tur sonra yeniden doğar
    // Pirate: "Pirate",
    Reaper: "Reaper", // rakip öldürdüğünde takımın destesine hayalet ekler
    // Robot: "Robot",
    Samurai: "Samurai", // rakibi 1 tur kanatır, kanayan rakip bir sonraki tur 1 hasar alır
    Siren: "Siren", // rakibi susturur, susturulan kart bir 1 tur skill kullanamaz
    // Skeleton: "Skeleton",
    Vampire: "Vampire", // verdiği hasarın %50'si kadarını can çalar
    Werewolf: "Werewolf",
    // Witch: "Witch",
    Wukong: "Wukong",
    Zeus: "Zeus",
    Zombie: "Zombie" //rakibi 1 tur zombie yapar, zombie olan kart 1 tur boyunca skill kullanamaz
};

export const CharacterList = {
    Aerwyn: {
        name: Characters.Aerwyn,
        cover: Characters.Aerwyn.toLowerCase(),
        attack: 6,
        health: 8,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue
    },
    Alien: {
        name: Characters.Alien,
        cover: Characters.Alien.toLowerCase(),
        attack: 4,
        health: 5,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Rogue
    },
    Archangel: {
        name: Characters.Archangel,
        cover: Characters.Archangel.toLowerCase(),
        attack: 9,
        health: 7,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Melee,
        classType: ClassType.Mage
    },
    Archmage: {
        name: Characters.Archmage,
        cover: Characters.Archmage.toLowerCase(),
        attack: 5,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage
    },
    Assassin: {
        name: Characters.Assassin,
        cover: Characters.Assassin.toLowerCase(),
        attack: 8,
        health: 5,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Rogue
    },
    Cerberus: {
        name: Characters.Cerberus,
        cover: Characters.Cerberus.toLowerCase(),
        attack: 6,
        health: 7,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Mage
    },
    Cyclop: {
        name: Characters.Cyclop,
        cover: Characters.Cyclop.toLowerCase(),
        attack: 5,
        health: 6,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank
    },
    Dragon: {
        name: Characters.Dragon,
        cover: Characters.Dragon.toLowerCase(),
        attack: 7,
        health: 4,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage
    },
    Elf: {
        name: Characters.Elf,
        cover: Characters.Elf.toLowerCase(),
        attack: 3,
        health: 7,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue
    },
    Ent: {
        name: Characters.Ent,
        cover: Characters.Ent.toLowerCase(),
        attack: 4,
        health: 10,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank
    },
    Gunslinger: {
        name: Characters.Gunslinger,
        cover: Characters.Gunslinger.toLowerCase(),
        attack: 8,
        health: 6,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue
    },
    Illusionist: {
        name: Characters.Illusionist,
        cover: Characters.Illusionist.toLowerCase(),
        attack: 6,
        health: 7,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage
    },
    Joker: {
        name: Characters.Joker,
        cover: Characters.Joker.toLowerCase(),
        attack: 7,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Rogue
    },
    Knight: {
        name: Characters.Knight,
        cover: Characters.Knight.toLowerCase(),
        attack: 5,
        health: 10,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank
    },
    Lich: {
        name: Characters.Lich,
        cover: Characters.Lich.toLowerCase(),
        attack: 6,
        health: 8,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Melee,
        classType: ClassType.Tank
    },
    Monk: {
        name: Characters.Monk,
        cover: Characters.Monk.toLowerCase(),
        attack: 5,
        health: 10,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior
    },
    Ra: {
        name: Characters.Ra,
        cover: Characters.Ra.toLowerCase(),
        attack: 10,
        health: 5,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior
    },
    Reaper: {
        name: Characters.Reaper,
        cover: Characters.Reaper.toLowerCase(),
        attack: 9,
        health: 6,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior
    },
    Samurai: {
        name: Characters.Samurai,
        cover: Characters.Samurai.toLowerCase(),
        attack: 8,
        health: 9,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior
    },
    Siren: {
        name: Characters.Siren,
        cover: Characters.Siren.toLowerCase(),
        attack: 4,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage
    },
    Vampire: {
        name: Characters.Vampire,
        cover: Characters.Vampire.toLowerCase(),
        attack: 8,
        health: 7,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank
    },
    Werewolf: {
        name: Characters.Werewolf,
        cover: Characters.Werewolf.toLowerCase(),
        attack: 7,
        health: 6,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior
    },
    Wukong: {
        name: Characters.Wukong,
        cover: Characters.Wukong.toLowerCase(),
        attack: 8,
        health: 9,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior
    },
    Zeus: {
        name: Characters.Zeus,
        cover: Characters.Zeus.toLowerCase(),
        attack: 9,
        health: 8,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage
    },
    Zombie: {
        name: Characters.Zombie,
        cover: Characters.Zombie.toLowerCase(),
        attack: 5,
        health: 9,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Tank
    },
};
