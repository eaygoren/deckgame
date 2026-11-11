# TODO

## Tamamlananlar

- [x] **Yetenekler.** Gunslinger işareti normal saldırı hasarını artırıyor. Zombie dönüşümü yetenekleri kapatıyor. Alien’ın görünmezliği ve Ghost’un yaşayan Reaper’ı hedeflemesi düzeltildi.
- [x] **Stat ve iyileştirme.** Dragon’un geçici saldırı düşüşü Shaman’ın kalıcı bonusunu silmiyor. Illusionist takasında maksimum can güncelleniyor. Vampire ve Archangel iyileştirmeyi kendi saldırı değerleri üzerinden hesaplıyor.
- [x] **Kart dengesi.** Hasar/can değerleri Phoenix 5/7, Assassin 7/6, Alien 4/7, Reaper 9/7, Ninja 6/6 ve Knight 5/10. Phoenix’in yumurtası 7 canlı, yeniden doğuşu 5/7.
- [x] **Bot AI.** Bot savaş motoruyla saldırıyı ve rakibin cevabını deniyor. Hamleler yakınsa veya lider risk altındaysa ilk üç aday 3 örnekten 8’e çıkıyor.
- [x] **Bot karşılaştırması.** Tarafların değiştiği 320 maçta uyarlamalı bot 153, sabit 3 örnekli bot 140 galibiyet aldı. 27 beraberlik oldu. Kaçınılabilir lider kaybı 5’ten 2’ye düştü, p95 karar süresi 41,5 ms’den 80,8 ms’ye çıktı.

## Sıradakiler

- [ ] 8 örneğe çıkma oranını (%90) düşürmek için puan eşiğini ve lider riski koşulunu ayarla. Aynı destelerle galibiyeti, kaçınılabilir lider kaybını ve p95 süreyi tekrar ölç.
- [ ] Örnekleme eşiği netleşince bir hamle daha ileri bakmanın katkısını ayrı ölç.
- [ ] Güncel kartlarla denge simülasyonu yap. Yeteneksiz kartlar maçlara katılsın. Sonuç tablosunda özel yeteneği olan kartlar ve Phoenix’in yumurtadan çıkma oranı yer alsın.
