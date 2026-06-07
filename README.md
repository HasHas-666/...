# 🧭 Karar Pusulası

Kararsız, içine kapanık biri için tasarlanmış **sakin ve şık bir karar verme aracı**.
Baskı yok, kayıt yok, kurulum yok — sadece aç ve kullan.

## Nasıl açılır?

`index.html` dosyasına çift tıkla. Hepsi bu. (İnternet sadece yazı tipleri için gerekir;
çevrimdışı da çalışır, sadece varsayılan yazı tipiyle.)

## İçindekiler

| Araç | Ne işe yarar |
|------|--------------|
| 🪙 **Hızlı Karar** | İki seçenek arasında sıkıştığında animasyonlu yazı-tura + içgörü ipucu |
| 🎡 **Karar Çarkı** | Kendi seçeneklerini ekle (8'e kadar), çarkı çevir, rastgele seç |
| ⚖️ **Karar Tartısı** | Büyük kararlar için artı/eksi maddeleri 1–5 ağırlıkla tart, puanlı tavsiye al |
| 🍽️ **Mini Kararlar** | "Ne yesem / ne yapsam / kendine iyilik" için hazır öneriler |
| 🌬️ **Sakinleş** | Karar öncesi 4-4-6 nefes egzersizi (sosyal kaygıyı yatıştırır) |

## Tasarım

- Tek sayfa, bağımlılık yok — saf HTML + CSS + Vanilla JS
- Cam efektli (glassmorphism) sakin koyu tema, yumuşak hareketli arka plan
- Mobil uyumlu, `prefers-reduced-motion` desteği
- Hiçbir veri sunucuya gönderilmez; her şey tarayıcında kalır

## Dosyalar

```
index.html   · yapı ve içerik
style.css    · tema ve animasyonlar
app.js       · tüm etkileşim mantığı
```
