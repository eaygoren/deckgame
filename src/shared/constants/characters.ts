import { AttackType, ClassType, Color, Rarity, UnitType } from "../enums";
import { AvailabilityType, CharacterListType } from "../interfaces";

export const Characters = {
    Aerwyn: "Aerwyn", // %25 ihtimalle saldırıdan kaçar ve menzilli karşı saldırı yapar. Elf'in Delici Atış'ı kaçınmayı aşar.
    Alien: "Alien", // Hasar alıp hayatta kalırsa sonraki rakip turunun sonuna kadar görünmez olur ve karşı hasar almaz. Son normal kartsa veya yanında yalnızca aktif Luxen ve lider varken rakip sadece menzilli saldırabiliyorsa hedef alınabilir.
    Archangel: "Archangel", // Saldırı sonrası kendisi hariç en düşük mevcut cana sahip müttefiki, kendi mevcut saldırısının yarısı kadar iyileştirir. Karşı saldırıda ölse de çalışır.
    Archmage: "Archmage",
    Assassin: "Assassin", // Normal saldırıda %50, yakın dövüş karşı saldırısında %25 kritik şansına sahiptir.
    Banshee: "Banshee",
    Cerberus: "Cerberus",
    Cyborg: "Cyborg", // saldırmadığı her tur, saldırı gücünü kalıcı olarak 1 artırır //TODO
    Cyclop: "Cyclop",
    Deathknight: "Deathknight", // dost birim öldüğünde desteye 1 adet skeleton ekler //TODO
    Dragon: "Dragon", // Saldırı sonrası hedefi 1 hasarlık yakar ve hedefin saldırısını 1 tur boyunca %50 düşürür.
    // Dwarf: "Dwarf",
    Elf: "Elf", // Saldırıları kaçınmayı, hasar azaltmayı ve hasar paylaşımını aşar.
    Ent: "Ent", // Saldırı sonrası yalnızca vurduğu rakip 1 tur boyunca ancak Ent'e saldırabilir.
    Ganesha: "Ganesha", // Sahada bir rakip turu geçirdikten sonra kendi turunun başında, diğer tur başı yeteneklerinden önce, rastgele bir yaşayan müttefikin tüm negatif etkilerini temizler. Kendisi ve lider seçilebilir. Enfeksiyonu temizler, tamamlanan zombileşmeyi geri almaz.
    Gargoyle: "Gargoyle", // saldırmadığı her tur sonrası 1 tur boyunca taşlaşır ve 2 saldırı gücü kazanır, taşlaştığı tur saldırı yapamaz //TODO
    Ghost: "Ghost", // Öldüğünde yaşayan müttefik Reaper'a maksimum canı aşabilen 1 can verir.
    Gunslinger: "Gunslinger", // Saldırı sonrası hedefi işaretler. Hedef, işaretleyenin sonraki kendi turunun sonuna kadar normal saldırılardan %50 fazla hasar alır.
    Hathor: "Hathor", // takımındaki Ra ile birlikte saldırır //TODO
    Herbalist: "Herbalist", // Sahada bir rakip turu geçirdikten sonra kendi turunun başında en düşük mevcut cana sahip müttefike 1 can verir.
    Hunter: "Hunter",
    Hydra: "Hydra", // 3 kez olmak üzere, öldüğünde %50 can ve saldırı gücü ile yeniden doğar ve her doğuşunda ekstradan rastgele 1 rakibe daha saldırı yapacak şekilde kesilen baş için yerine 2 yeni baş ekler //TODO
    Illusionist: "Illusionist", // Maçta bir kez, saldırı öncesinde hedefin görünen saldırısını ve mevcut canını takas eder.
    Joker: "Joker", // Saldırı öncesinde hedefin saldırısı daha yüksekse kendi saldırısını kalıcı olarak o değere yükseltir.
    Knight: "Knight", // Kendi turunun başında rastgele başka bir lider olmayan müttefiki, sonraki kendi turunun başına kadar korur. Gelen hasarın yarısına kadarını kalan canı ölçüsünde üstlenir. Kalan hasarı asıl hedef alır.
    Lich: "Lich", // Saldırı ve karşı saldırı hasarı çözüldükten sonra hedefi 1 tur dondurur. Donmuş kart saldıramaz ve karşı saldırı yapamaz.
    Luxen: "Luxen", // Pasifi aktifken menzilli rakipler onu hedefleyemez. Susturulursa veya son normal kartken ona saldırabilecek yakın dövüşçü yoksa hedef alınabilir.
    // Medusa: "Medusa",
    Mimic: "Mimic", // İsabet eden normal saldırıda hedefin saldırı öncesi, saldırı sonrası veya öldürmede çalışan yeteneğini kopyalar. Kopya sonraki kendi turundaki normal saldırıda koşulu sağlanınca çalışır ve kullanıldığında ya da tur sonunda silinir.
    // Minotaur: "Minotaur",
    Monk: "Monk",
    // Mummy: "Mummy",
    // Naga: "Naga",
    Necromancer: "Necromancer", // Bir rakibi öldürdüğünde, maçta bir kez, rastgele ölü bir müttefiki 1 canla desteye geri koyar ve o kartın tur bazlı yetenek kullanımını sıfırlar.
    Ninja: "Ninja", // İsabet eden her kritik vuruştan sonra aynı hamlede aynı hedefe yeniden saldırır. Normal vuruşta, kaçınmada veya hedef düşünce zincir biter.
    Phoenix: "Phoenix", // Maçta bir kez, ölümcül hasar alınca hedeflenebilen bir yumurtaya dönüşür. Yumurta saldıramaz ve karşı saldırı yapamaz. Kendi takımının ikinci turunun sonunda hayattaysa Phoenix yeniden doğar.
    // Pirate: "Pirate",
    Ra: "Ra", // takımındaki Hathor ile birlikte saldırır //TODO
    Reaper: "Reaper", // Bir rakibi öldürdüğünde kendi destesine Ghost ekler.
    Reikist: "Reikist", // her tur, rasgele bir takım arkadaşının 1 tur boyunca saldırı gücünü 2 artırır //TODO
    Samurai: "Samurai", // Saldırı sonrası hedefi 2 tur boyunca tur başına 1 hasar verecek şekilde kanatır.
    // Scarecrow: "Scarecrow", // saldıran rakibini korkutur, korkutulan rakibin saldırı gücü 1 tur boyunca 0 olur
    Scorpion: "Scorpion", // Saldırı sonrası hedefi kalıcı olarak zehirler. Karşı saldırıda ölse de çalışır. Zehir her tur 1 hasar verir ve aktifken tekrar uygulanamaz.
    Shaman: "Shaman", // Saldırı sonrası rastgele başka bir müttefike kalıcı +1 mevcut can, +1 maksimum can ve +1 saldırı verir.
    Siren: "Siren", // Saldırı sonrası hedefi 1 tur susturur ve özel yeteneğini kullanmasını engeller.
    Skeleton: "Skeleton",
    Vampire: "Vampire", // Saldırıdan sağ çıkarsa kendi mevcut saldırısının yarısı kadar can yeniler.
    Void: "Void", // İsabet eden saldırı sonrası hayatta kalan hedefin stat güçlendirmelerini kaldırır. Etki temizlenene kadar hedef can yenileyemez veya yeni stat güçlendirmesi alamaz.
    Werewolf: "Werewolf",
    Wukong: "Wukong", // Tank ve Warrior sınıf yeteneklerinin ikisini de taşır.
    Zeus: "Zeus", // saldırdığı rakip ve leader dışındaki tüm kartlara 1 hasar verir //TODO
    Zombie: "Zombie" // Saldırı sonrası hedefi enfekte eder. Hedef iki kendi turu sonra temel Zombie'nin yarı saldırısı ve yarı canıyla kalıcı olarak zombileşir. Dönüşüm kart ve sınıf yeteneklerini kapatır. Liderler ve Zombieler bağışıktır.
};

export const CharacterList: CharacterListType = {
    Aerwyn: {
        name: Characters.Aerwyn,
        cover: Characters.Aerwyn.toLowerCase(),
        attack: 4,
        health: 6,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Alien: {
        name: Characters.Alien,
        cover: Characters.Alien.toLowerCase(),
        attack: 4,
        health: 7,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Rogue,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Leader,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Assassin: {
        name: Characters.Assassin,
        cover: Characters.Assassin.toLowerCase(),
        attack: 7,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Rogue,
        unitType: UnitType.Leader,
        availabilityType: AvailabilityType.Playable
    },
    Banshee: {
        name: Characters.Banshee,
        cover: Characters.Banshee.toLowerCase(),
        attack: 5,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Deathknight: {
        name: Characters.Deathknight,
        cover: Characters.Deathknight.toLowerCase(),
        attack: 6,
        health: 8,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Dragon: {
        name: Characters.Dragon,
        cover: Characters.Dragon.toLowerCase(),
        attack: 3,
        health: 11,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Leader,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Leader,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Ganesha: {
        name: Characters.Ganesha,
        cover: Characters.Ganesha.toLowerCase(),
        attack: 4,
        health: 12,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Melee,
        classType: ClassType.Tank,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Gargoyle: {
        name: Characters.Gargoyle,
        cover: Characters.Gargoyle.toLowerCase(),
        attack: 2,
        health: 10,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Ghost: {
        name: Characters.Ghost,
        cover: Characters.Ghost.toLowerCase(),
        attack: 3,
        health: 5,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.SummonOnly
    },
    Gunslinger: {
        name: Characters.Gunslinger,
        cover: Characters.Gunslinger.toLowerCase(),
        attack: 6,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Hathor: {
        name: Characters.Hathor,
        cover: Characters.Hathor.toLowerCase(),
        attack: 3,
        health: 5,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Mage,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Hunter: {
        name: Characters.Hunter,
        cover: Characters.Hunter.toLowerCase(),
        attack: 4,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Illusionist: {
        name: Characters.Illusionist,
        cover: Characters.Illusionist.toLowerCase(),
        attack: 5,
        health: 7,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Leader,
        availabilityType: AvailabilityType.Playable
    },
    Luxen: {
        name: Characters.Luxen,
        cover: Characters.Luxen.toLowerCase(),
        attack: 4,
        health: 6,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Necromancer: {
        name: Characters.Necromancer,
        cover: Characters.Necromancer.toLowerCase(),
        attack: 5,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Ninja: {
        name: Characters.Ninja,
        cover: Characters.Ninja.toLowerCase(),
        attack: 6,
        health: 6,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Ranged,
        classType: ClassType.Rogue,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Phoenix: {
        name: Characters.Phoenix,
        cover: Characters.Phoenix.toLowerCase(),
        attack: 5,
        health: 7,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Ra: {
        name: Characters.Ra,
        cover: Characters.Ra.toLowerCase(),
        attack: 6,
        health: 4,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Reaper: {
        name: Characters.Reaper,
        cover: Characters.Reaper.toLowerCase(),
        attack: 9,
        health: 7,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior,
        unitType: UnitType.Leader,
        availabilityType: AvailabilityType.Playable
    },
    Reikist: {
        name: Characters.Reikist,
        cover: Characters.Reikist.toLowerCase(),
        attack: 3,
        health: 6,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Leader,
        availabilityType: AvailabilityType.Playable
    },
    Samurai: {
        name: Characters.Samurai,
        cover: Characters.Samurai.toLowerCase(),
        attack: 7,
        health: 8,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior,
        unitType: UnitType.Leader,
        availabilityType: AvailabilityType.Playable
    },
    Scorpion: {
        name: Characters.Scorpion,
        cover: Characters.Scorpion.toLowerCase(),
        attack: 2,
        health: 8,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Skeleton: {
        name: Characters.Skeleton,
        cover: Characters.Skeleton.toLowerCase(),
        attack: 2,
        health: 2,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.SummonOnly
    },
    Vampire: {
        name: Characters.Vampire,
        cover: Characters.Vampire.toLowerCase(),
        attack: 7,
        health: 7,
        rarity: Rarity.Common,
        color: Color.Common,
        attackType: AttackType.Melee,
        classType: ClassType.Tank,
        unitType: UnitType.Leader,
        availabilityType: AvailabilityType.Playable
    },
    Void: {
        name: Characters.Void,
        cover: Characters.Void.toLowerCase(),
        attack: 5,
        health: 6,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Wukong: {
        name: Characters.Wukong,
        cover: Characters.Wukong.toLowerCase(),
        attack: 7,
        health: 8,
        rarity: Rarity.Rare,
        color: Color.Rare,
        attackType: AttackType.Melee,
        classType: ClassType.Warrior,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
    Zeus: {
        name: Characters.Zeus,
        cover: Characters.Zeus.toLowerCase(),
        attack: 5,
        health: 7,
        rarity: Rarity.Legendary,
        color: Color.Legendary,
        attackType: AttackType.Ranged,
        classType: ClassType.Mage,
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
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
        unitType: UnitType.Regular,
        availabilityType: AvailabilityType.Playable
    },
};
