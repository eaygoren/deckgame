import { AttackType, ClassType, Color, Rarity, UnitType } from "../enums";

export const Characters = {
    Aerwyn: "Aerwyn", // %25 ihtimalle saldırılardan kaçınır
    Alien: "Alien", // hasar aldıktan sonra 1 tur görünmez olur, görünmezken rakipler counter saldırı yapamaz
    Archangel: "Archangel", // saldırı yaptığı tur sonrası, takımındaki en düşük canı olan kartı, verdiği hasarın %50'si kadar iyileştirir
    Archmage: "Archmage",
    Assassin: "Assassin", // kritik ihtimalini 2 katına çıkarır, %25 ihtimalle counter saldırı ile kritik hasar verebilir
    Cerberus: "Cerberus",
    Cyborg: "Cyborg", // saldırmadığı her tur, saldırı gücünü 1 artırır, saldırdığı tur sonunda bu artışı kaybeder //TODO
    Cyclop: "Cyclop",
    Dragon: "Dragon", // hasar verdiği rakipleri 1 tur yakar, yanan rakipler 1 tur boyunca %50 saldırı gücü kaybeder
    // Dwarf: "Dwarf",
    Elf: "Elf", // tüm hasar düşürme etkilerini yok sayar
    Ent: "Ent", // saldırdığı rakibi, bir tur boyunca sadece Ent'e saldırabilir
    Gunslinger: "Gunslinger", // saldırdığı rakip işaretlenir, işaretli rakip 1 tur boyunca %50 daha fazla hasar alır
    Hathor: "Hathor", // takımındaki Ra ile birlikte saldırır //TODO
    Herbalist: "Herbalist", // her tur, takımındaki en düşük canı olan kartın canını 1 artırır //TODO
    Hydra: "Hydra", // 3 kez olmak üzere, öldüğünde %50 can ve saldırı gücü ile yeniden doğar ve her doğuşunda ekstradan rastgele 1 rakibe daha saldırı yapacak şekilde kesilen baş için yerine 2 yeni baş ekler //TODO
    Illusionist: "Illusionist", // oyun başına bir kez olmak üzere, rakibin canı ile saldırı gücünü değiştirir
    Joker: "Joker", // saldırdığı rakibin hasarı kendi hasarından yüksekse, rakibin hasarını kendi hasarına eşitler
    Knight: "Knight", // her turun başında 1 takım arkadaşını korur, koruduğu kart hasarın yarısını alır ve hasarın diğer yarısını kendisi alır //TODO
    Lich: "Lich", // saldırdığı rakibi 1 tur dondurur, donan kart bir 1 tur saldırı ve counter saldırı yapamaz, passive skill kullanılabilir
    // Medusa: "Medusa",
    Mimic: "Mimic", // saldırdığı rakibin skillini kopyalar, kopyalanan skill 1 tur boyunca kullanılabilir ve 1 tur sonra kaybolur //TODO
    // Minotaur: "Minotaur",
    Monk: "Monk",
    // Mummy: "Mummy",
    // Naga: "Naga",
    Ninja: "Ninja", // saldırdığı turda kritik vurma durumunda, kritik hasarı 3 katına çıkarır //TODO
    Phoenix: "Phoenix", // yumurta formuna geçer, 1 tur sonra yeniden doğar, yumurta formundayken saldırı yapamaz //TODO
    // Pirate: "Pirate",
    Ra: "Ra", // takımındaki Hathor ile birlikte saldırır //TODO
    Reaper: "Reaper", // rakip öldürdüğünde takımın destesine hayalet ekler //TODO
    Samurai: "Samurai", // rakibi 1 tur kanatır, kanayan rakip bir sonraki tur 1 hasar alır
    // Scarecrow: "Scarecrow", // saldıran rakibini korkutur, korkutulan rakibin saldırı gücü 1 tur boyunca 0 olur
    // Scorpion: "Scorpion", // saldırdığı rakibi zehirler, zehirli rakip her tur 1 hasar alır
    Shaman: "Shaman", // saldırdığı her tur rasgele bir takım arkadaşının canını ve saldırı gücünü 2 artırır //TODO
    Siren: "Siren", // rakibi susturur, susturulan kart bir 1 tur skill kullanamaz
    // Skeleton: "Skeleton",
    Vampire: "Vampire", // saldırdığı rakibe verdiği hasarın %50'si kadarını can çalar
    Void: "Void", // saldırdığı rakipler, eksik saldırı ve can değerlerini yenileyemez //TODO
    Werewolf: "Werewolf",
    // Witch: "Witch",
    Wukong: "Wukong",
    Zeus: "Zeus", // saldırdığı rakip ve leader dışındaki tüm kartlara 1 hasar verir //TODO
    Zombie: "Zombie" //rakibi 1 tur zombie yapar, zombie olan kart 1 tur boyunca ability kullanamaz
};

export const CharacterList = {
    Aerwyn: {
        name: Characters.Aerwyn,
        cover: Characters.Aerwyn.toLowerCase(),
        attack: 6,
        health: 8,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue,
        unitType: UnitType.Regular
    },
    Alien: {
        name: Characters.Alien,
        cover: Characters.Alien.toLowerCase(),
        attack: 4,
        health: 5,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Rogue,
        unitType: UnitType.Regular
    },
    Archangel: {
        name: Characters.Archangel,
        cover: Characters.Archangel.toLowerCase(),
        attack: 9,
        health: 7,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Melee,
        classType: ClassType.Mage,
        unitType: UnitType.Leader
    },
    Archmage: {
        name: Characters.Archmage,
        cover: Characters.Archmage.toLowerCase(),
        attack: 5,
        health: 6,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular
    },
    Assassin: {
        name: Characters.Assassin,
        cover: Characters.Assassin.toLowerCase(),
        attack: 8,
        health: 5,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Rogue,
        unitType: UnitType.Leader
    },
    Cerberus: {
        name: Characters.Cerberus,
        cover: Characters.Cerberus.toLowerCase(),
        attack: 6,
        health: 7,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Mage,
        unitType: UnitType.Regular
    },
    Cyborg: {
        name: Characters.Cyborg,
        cover: Characters.Cyborg.toLowerCase(),
        attack: 7,
        health: 7,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior,
        unitType: UnitType.Regular
    },
    Cyclop: {
        name: Characters.Cyclop,
        cover: Characters.Cyclop.toLowerCase(),
        attack: 5,
        health: 6,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank,
        unitType: UnitType.Regular
    },
    Dragon: {
        name: Characters.Dragon,
        cover: Characters.Dragon.toLowerCase(),
        attack: 7,
        health: 4,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Leader
    },
    Elf: {
        name: Characters.Elf,
        cover: Characters.Elf.toLowerCase(),
        attack: 3,
        health: 7,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue,
        unitType: UnitType.Leader
    },
    Ent: {
        name: Characters.Ent,
        cover: Characters.Ent.toLowerCase(),
        attack: 4,
        health: 10,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank,
        unitType: UnitType.Regular
    },
    Gunslinger: {
        name: Characters.Gunslinger,
        cover: Characters.Gunslinger.toLowerCase(),
        attack: 8,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue,
        unitType: UnitType.Regular
    },
    Hathor: {
        name: Characters.Hathor,
        cover: Characters.Hathor.toLowerCase(),
        attack: 7,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Mage,
        unitType: UnitType.Regular
    },
    Herbalist: {
        name: Characters.Herbalist,
        cover: Characters.Herbalist.toLowerCase(),
        attack: 4,
        health: 5,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular
    },
    Hydra: {
        name: Characters.Hydra,
        cover: Characters.Hydra.toLowerCase(),
        attack: 5,
        health: 8,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Melee,
        classType: ClassType.Tank,
        unitType: UnitType.Regular
    },
    Illusionist: {
        name: Characters.Illusionist,
        cover: Characters.Illusionist.toLowerCase(),
        attack: 6,
        health: 7,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular
    },
    Joker: {
        name: Characters.Joker,
        cover: Characters.Joker.toLowerCase(),
        attack: 3,
        health: 8,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Rogue,
        unitType: UnitType.Regular
    },
    Knight: {
        name: Characters.Knight,
        cover: Characters.Knight.toLowerCase(),
        attack: 5,
        health: 10,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Tank,
        unitType: UnitType.Regular
    },
    Lich: {
        name: Characters.Lich,
        cover: Characters.Lich.toLowerCase(),
        attack: 6,
        health: 8,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Tank,
        unitType: UnitType.Leader
    },
    Mimic: {
        name: Characters.Mimic,
        cover: Characters.Mimic.toLowerCase(),
        attack: 4,
        health: 5,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue,
        unitType: UnitType.Regular
    },
    Monk: {
        name: Characters.Monk,
        cover: Characters.Monk.toLowerCase(),
        attack: 5,
        health: 10,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior,
        unitType: UnitType.Leader
    },
    Ninja: {
        name: Characters.Ninja,
        cover: Characters.Ninja.toLowerCase(),
        attack: 7,
        health: 5,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue,
        unitType: UnitType.Regular
    },
    Phoenix: {
        name: Characters.Phoenix,
        cover: Characters.Phoenix.toLowerCase(),
        attack: 6,
        health: 8,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular
    },
    Ra: {
        name: Characters.Ra,
        cover: Characters.Ra.toLowerCase(),
        attack: 10,
        health: 5,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior,
        unitType: UnitType.Regular
    },
    Reaper: {
        name: Characters.Reaper,
        cover: Characters.Reaper.toLowerCase(),
        attack: 9,
        health: 6,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior,
        unitType: UnitType.Leader
    },
    Samurai: {
        name: Characters.Samurai,
        cover: Characters.Samurai.toLowerCase(),
        attack: 8,
        health: 9,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior,
        unitType: UnitType.Leader
    },
    Shaman: {
        name: Characters.Shaman,
        cover: Characters.Shaman.toLowerCase(),
        attack: 4,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular
    },
    Siren: {
        name: Characters.Siren,
        cover: Characters.Siren.toLowerCase(),
        attack: 4,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular
    },
    Vampire: {
        name: Characters.Vampire,
        cover: Characters.Vampire.toLowerCase(),
        attack: 8,
        health: 7,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank,
        unitType: UnitType.Leader
    },
    Void: {
        name: Characters.Void,
        cover: Characters.Void.toLowerCase(),
        attack: 4,
        health: 6,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular
    },
    Werewolf: {
        name: Characters.Werewolf,
        cover: Characters.Werewolf.toLowerCase(),
        attack: 7,
        health: 6,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior,
        unitType: UnitType.Regular
    },
    Wukong: {
        name: Characters.Wukong,
        cover: Characters.Wukong.toLowerCase(),
        attack: 8,
        health: 9,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior,
        unitType: UnitType.Regular
    },
    Zeus: {
        name: Characters.Zeus,
        cover: Characters.Zeus.toLowerCase(),
        attack: 9,
        health: 8,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular
    },
    Zombie: {
        name: Characters.Zombie,
        cover: Characters.Zombie.toLowerCase(),
        attack: 5,
        health: 9,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Tank,
        unitType: UnitType.Regular
    },
};
