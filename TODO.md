# TODO

## Etiket bonusları

- [ ] İlk prototipte Fae deste bonusunu ve Martial saha bonusunu dene. Deste seçimlerine ve maç içindeki hamlelere etkisini karşılaştır.
- [ ] Deste eşiklerini maç başındaki 10 kart üzerinden bir kez hesapla. Sonradan çağrılan kartlar bu eşikleri değiştirmesin.
- [ ] Saha eşiklerini tetikleme anında yaşayan kartlardan hesapla. Liderleri sayıma dahil et. Ölüm tetikleyicilerinde ölümcül hasardan hemen önceki sahayı say.
- [ ] Her etiket bonusunu takım başına maçta bir kez uygula. Saha eşiği sonradan bozulursa kazanılmış canı geri alma. Aynı vuruşa denk gelen Martial ve Primal bonuslarını toplam +1 hasarla sınırla.

### 14 etiket için bonus taslağı

| Etiket | Kart sayısı | Sayım | Tetikleyici | Bonus |
|---|---:|---|---|---|
| Arcane | 2 | Saha | Bir Arcane kartın normal saldırısı isabet eder ve hedef sağ kalır. | Hedefteki süreli Bleed veya Burn efektlerinden kalan süresi en kısa olanı 1 tur uzatır. Uygun efekt yoksa bonus harcanmaz. |
| Celestial | 2 | Deste | Kendi turunun başında sahada canı eksik bir Celestial vardır. | En düşük mevcut canlı Celestial 1 can yeniler. |
| Construct | 2 | Deste | Bir Construct normal saldırıya başlarken sahada başka bir dost Construct vardır. | O saldırının doğurduğu ilk karşı saldırıdan 1 daha az hasar alır. İkinci Construct eklendiğinde denenebilir. |
| Creature | 3 | Saha | Bir Creature ölümcül olmayan normal saldırı hasarı alır. | Vuruş çözüldükten sonra 1 can yeniler. |
| Fae | 2 | Deste | İlk Fae sahaya yerleşir. Açılışta birden fazla Fae varsa maksimum canı en düşük olan seçilir. | Seçilen Fae +1 mevcut ve maksimum can kazanır. |
| Human | 4 | Deste | Düşen bir Human müttefikin yerine bir Human çekilir. | Gelen kart +1 mevcut ve maksimum can kazanır. Başka bir kart gelirse bonus sonraki uygun ölüme kalır. |
| Infernal | 2 | Saha | Bir Infernal normal saldırısıyla rakibi düşürür ve sağ kalır. | Saldıran kart 1 can yeniler. |
| Lord | 2 | Deste | Bir Lord normal saldırıyla bir rakibi düşürür. | Canı eksik diğer müttefikler arasında mevcut canı en düşük olan 1 can yeniler. Uygun hedef yoksa bonus harcanmaz. |
| Martial | 2 | Saha | Bir Martial kart normal saldırıya başlar. | Vuruş +1 hasar verir. Hedef kaçınsa da bonus harcanır. |
| Mythic | 2 | Deste | Bir Mythic kart normal saldırısıyla rakibi düşürür ve sağ kalır. | Saldıran kart kalıcı +1 saldırı kazanır. |
| Primal | 2 | Saha | Bir Primal kart mevcut maksimum canının yarısında veya altında normal saldırıya başlar. | Vuruş +1 hasar verir. |
| Shapeshifter | 2 | Deste | Bir Shapeshifter ilk kez negatif etki alır ve sağ kalır. | Yeni uygulanan efekt hemen temizlenir. Yetenek kopyaları ve form değişimleri temizliğin dışında kalır. |
| Spirit | 2 | Saha | Bir Spirit ölür ve sahada yaşayan başka bir Spirit vardır. | Yaşayan Spirit 1 can yeniler. Ghost ölürse Banshee bu bonusu, Reaper da Last Breath’ten gelen canı alabilir. |
| Undead | 2 | Saha | Bir Undead ölürken sahada başka bir yaşayan Undead vardır. | Desteye bir Skeleton eklenir. Çağrılan Skeleton bonusu tetikleyemez. |

Fae eşiğini ilk denemede 2 tut. Üç kartlık eşik mevcut kadroda Aerwyn, Elf ve Ent’in tamamını gerektiriyor. Human ve Martial gibi örtüşen etiketlerde, sürekli stat artışları yerine tek karta veya tek vuruşa uygulanan bonusları dene.

### Eşikler için ilk örnekler

- **Destede 3 Fae** ile ilk sahaya çıkan Fae’ye maçta bir kez +1 mevcut ve maksimum can. Yukarıdaki 2 kartlık eşik, bu örneğin daha esnek sürümü.
- **Sahada 2 Martial** ile bir Martial kartın normal saldırısına maçta bir kez +1 hasar. Rakip bir Martial kartı düşürerek eşiği kapatabilir.
- **Sahada 2 Undead** ile ileride Deathknight, yanında başka bir Undead varken ilk Undead müttefik ölünce desteye Skeleton ekleyebilir. Bu, saha eşiğinin bir kahramanın özel yeteneğine bağlanması için ayrı bir taslak.
