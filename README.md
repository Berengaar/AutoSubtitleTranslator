# Udemy Türkçe Çeviri Extension

Bu Chrome extension, Udemy videolarının altyazılarını gerçek zamanlı olarak Türkçeye çevirir.

## 🚀 Özellikler

- **Gerçek Zamanlı Çeviri**: Video altyazıları otomatik olarak Türkçeye çevrilir
- **Akıllı Tespit**: Udemy video sayfalarını otomatik tespit eder
- **Cache Sistemi**: Çeviriler önbelleğe alınır, hızlı yanıt süresi
- **Modern UI**: Şık popup arayüzü ve kullanıcı dostu tasarım
- **Mobil Uyumlu**: Responsive tasarım ile tüm cihazlarda çalışır

## 📦 Kurulum

1. Bu projeyi bilgisayarınıza indirin
2. Chrome'da `chrome://extensions/` adresine gidin
3. "Geliştirici modu"nu aktif edin
4. "Paketlenmemiş uzantı yükle" butonuna tıklayın
5. Bu klasörü seçin

## 🎯 Kullanım

1. Udemy'de bir video sayfasına gidin
2. Video altyazılarını açın
3. Miraç extension'ı aktif edin (popup'ta toggle switch)
4. İngilizce altyazıların altında Türkçe çeviriler görünecek

## 🛠️ Teknik Detaylar

### Dosya Yapısı
```
udemy-translate-ext/
├── manifest.json          # Extension manifest
├── content.js             # Ana çeviri scripti
├── popup.html             # Popup arayüzü
├── popup.js               # Popup JavaScript
├── styles.css             # Çeviri stilleri
├── icons/                 # Extension ikonları
│   └── icon.svg          # SVG ikon
└── README.md             # Bu dosya
```

### Kullanılan Teknolojiler
- **Chrome Extensions API**: Extension yönetimi
- **Google Translate API**: Çeviri servisi
- **MutationObserver**: DOM değişikliklerini izleme
- **CSS3**: Modern stil ve animasyonlar

### API Entegrasyonu
Extension, Google Translate API'sini kullanarak İngilizce metinleri Türkçeye çevirir. API yanıt vermediğinde fallback çeviri sistemi devreye girer.

## 🔧 Geliştirme

### Gereksinimler
- Chrome 88+ (Manifest V3 desteği)
- Modern web tarayıcısı

### Özelleştirme
- `styles.css` dosyasından çeviri görünümünü değiştirebilirsiniz
- `content.js` dosyasından çeviri mantığını özelleştirebilirsiniz
- `popup.html` dosyasından arayüzü değiştirebilirsiniz

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 🐛 Sorun Bildirimi

Herhangi bir sorunla karşılaştığınızda:
1. Chrome Developer Tools'u açın (F12)
2. Console sekmesinde hata mesajlarını kontrol edin
3. Sorunu detaylı bir şekilde açıklayarak issue oluşturun

## 📞 İletişim

Proje hakkında sorularınız için GitHub issues kullanabilirsiniz.

---

**Not**: Bu extension eğitim amaçlı geliştirilmiştir. Ticari kullanım için gerekli izinleri almayı unutmayın.


