// Udemy Video Subtitle Translator
class UdemySubtitleTranslator {
    constructor() {
        this.isActive = false;
        this.translationCache = new Map();
        this.observer = null;
        this.currentSubtitle = null;
        this.translationContainer = null;
        this.init();
    }

    async init() {
        // Extension'ın aktif olup olmadığını kontrol et
        const result = await chrome.storage.sync.get(['isActive']);
        this.isActive = result.isActive || false;

        if (this.isActive) {
            this.startTranslation();
        }

        // Storage değişikliklerini dinle
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'sync' && changes.isActive) {
                this.isActive = changes.isActive.newValue;
                if (this.isActive) {
                    this.startTranslation();
                } else {
                    this.stopTranslation();
                }
            }
        });
    }

    startTranslation() {
        console.log('Udemy çeviri başlatılıyor...');
        this.findAndTranslateSubtitles();
        this.observeSubtitleChanges();
    }

    stopTranslation() {
        console.log('Udemy çeviri durduruluyor...');
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.removeTranslationContainer();
    }

    findAndTranslateSubtitles() {
        console.log('🔍 Altyazı elementleri aranıyor...');
        
        // Udemy video player'ındaki altyazı elementlerini bul - güncel selector'lar
        const subtitleSelectors = [
            '.well--text--J1-Qi',       // Altyazı metni (öncelikli)
            '.well--container--afdWD',  // Gerçek altyazı elementi
            '[data-purpose="captions-display"]',
            '.captions-display',
            '.ud-component--video-viewer--captions-display',
            '.video-viewer--captions-display',
            '.captions-text',
            '.caption-text',
            '.subtitle-text',
            '.video-captions',
            '.ud-captions',
            '[class*="caption"]',
            '[class*="subtitle"]'
        ];

        let subtitleElement = null;
        for (const selector of subtitleSelectors) {
            subtitleElement = document.querySelector(selector);
            if (subtitleElement) {
                console.log(`✅ Altyazı elementi bulundu: ${selector}`, subtitleElement);
                break;
            }
        }

        // Eğer hiçbir selector çalışmazsa, tüm text içeren elementleri kontrol et
        if (!subtitleElement) {
            console.log('⚠️ Standart selector\'lar çalışmadı, genel arama yapılıyor...');
            const allElements = document.querySelectorAll('*');
            for (const element of allElements) {
                const text = element.textContent?.trim();
                if (text && text.length > 20 && text.length < 500 && 
                    element.offsetHeight > 0 && element.offsetWidth > 0 &&
                    element.style.position !== 'absolute' &&
                    !text.match(/[çğıöşüÇĞİÖŞÜ]/)) { // Türkçe metinleri atla
                    
                    // Video player içinde mi kontrol et
                    const videoPlayer = element.closest('[class*="video"]') || 
                                      element.closest('[class*="player"]') ||
                                      element.closest('[data-purpose*="video"]') ||
                                      element.closest('[class*="well"]');
                    if (videoPlayer) {
                        subtitleElement = element;
                        console.log('🎯 Potansiyel altyazı elementi bulundu:', element, 'Text:', text.substring(0, 50));
                        break;
                    }
                }
            }
        }

        if (subtitleElement) {
            this.currentSubtitle = subtitleElement;
            this.createTranslationContainer();
        } else {
            console.log('❌ Altyazı elementi bulunamadı, 3 saniye sonra tekrar denenecek...');
            setTimeout(() => this.findAndTranslateSubtitles(), 3000);
        }
    }

    createTranslationContainer() {
        if (this.translationContainer) {
            this.translationContainer.remove();
        }

        this.translationContainer = document.createElement('div');
        this.translationContainer.className = 'udemy-turkish-translation';
        this.translationContainer.id = 'udemy-turkish-translation';
        this.translationContainer.style.cssText = `
            position: fixed !important;
            bottom: 100px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            background: rgba(0, 0, 0, 0.95) !important;
            color: #00ff00 !important;
            padding: 12px 20px !important;
            border-radius: 8px !important;
            font-size: 16px !important;
            font-family: 'Segoe UI', Arial, sans-serif !important;
            text-align: center !important;
            max-width: 80% !important;
            word-wrap: break-word !important;
            z-index: 999999 !important;
            pointer-events: none !important;
            opacity: 1 !important;
            border: 3px solid #00ff00 !important;
            box-shadow: 0 6px 30px rgba(0, 255, 0, 0.5) !important;
            font-weight: bold !important;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 1) !important;
            display: block !important;
            visibility: visible !important;
        `;

        // Çeviri container'ını body'ye ekle (kesinlikle görünsün)
        document.body.appendChild(this.translationContainer);
        
        // Test mesajı göster
        this.translationContainer.textContent = '🎯 Çeviri Extension Aktif - Altyazılar aranıyor...';
        console.log('✅ Çeviri container body\'ye eklendi');
        
        // Hemen çeviri işlemini başlat ve periyodik kontrol başlat
        setTimeout(() => {
            this.translateCurrentSubtitle();
        }, 500);
        
        // Altyazı değişikliklerini izlemeye başla
        this.observeSubtitleChanges();
    }

    observeSubtitleChanges() {
        if (!this.currentSubtitle) return;

        console.log('👁️ Altyazı değişiklikleri izleniyor...');

        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                console.log('🔄 Altyazı değişikliği tespit edildi:', mutation.type);
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    console.log('📝 Yeni çeviri başlatılıyor...');
                    setTimeout(() => {
                        this.translateCurrentSubtitle();
                    }, 100);
                }
            });
        });

        this.observer.observe(this.currentSubtitle, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Ayrıca periyodik kontrol ekle (daha sık kontrol et)
        this.intervalId = setInterval(() => {
            if (this.currentSubtitle) {
                let currentText = this.currentSubtitle.textContent.trim();
                
                // Eğer container bulunduysa, içindeki text elementini ara
                if (!currentText && this.currentSubtitle.querySelector) {
                    const textElement = this.currentSubtitle.querySelector('.well--text--J1-Qi');
                    if (textElement) {
                        currentText = textElement.textContent.trim();
                    }
                }
                
                // Eğer hala metin yoksa, span elementinin parent'ını kontrol et
                if (!currentText && this.currentSubtitle.parentNode) {
                    const parentSpan = this.currentSubtitle.parentNode.querySelector('.well--text--J1-Qi');
                    if (parentSpan) {
                        currentText = parentSpan.textContent.trim();
                    }
                }
                
                if (currentText && currentText !== this.lastTranslatedText && currentText.length > 10) {
                    console.log('⏰ Periyodik kontrol: Yeni metin bulundu:', currentText);
                    this.translateCurrentSubtitle();
                }
            }
        }, 500); // 2 saniye yerine 500ms
    }

    async translateCurrentSubtitle() {
        console.log('🔄 translateCurrentSubtitle fonksiyonu çağrıldı');
        
        if (!this.currentSubtitle || !this.translationContainer) {
            console.log('⚠️ Altyazı elementi veya çeviri container bulunamadı');
            console.log('📍 currentSubtitle:', this.currentSubtitle);
            console.log('📍 translationContainer:', this.translationContainer);
            return;
        }

        let subtitleText = this.currentSubtitle.textContent.trim();
        console.log('📄 Ham altyazı metni:', subtitleText);
        
        // Eğer container bulunduysa, içindeki text elementini ara
        if (!subtitleText && this.currentSubtitle.querySelector) {
            const textElement = this.currentSubtitle.querySelector('.well--text--J1-Qi');
            if (textElement) {
                subtitleText = textElement.textContent.trim();
                console.log('📄 Text elementinden alınan metin:', subtitleText);
                console.log('📄 Text element HTML:', textElement.outerHTML);
            }
        }
        
        // Eğer hala metin yoksa, span elementinin parent'ını kontrol et
        if (!subtitleText && this.currentSubtitle.parentNode) {
            const parentSpan = this.currentSubtitle.parentNode.querySelector('.well--text--J1-Qi');
            if (parentSpan) {
                subtitleText = parentSpan.textContent.trim();
                console.log('📄 Parent span\'den alınan metin:', subtitleText);
            }
        }
        
        if (!subtitleText || subtitleText === this.lastTranslatedText) {
            console.log('⚠️ Metin boş veya daha önce çevrilmiş:', subtitleText);
            return;
        }
        
        // Kısa metinleri veya tek kelimeleri atla (dil seçimi vs.)
        if (subtitleText.length < 10) {
            console.log('⚠️ Çok kısa metin atlandı:', subtitleText);
            return;
        }
        
        // Türkçe metinleri atla (sadece gerçek Türkçe karakterler)
        if (subtitleText.match(/[çğıöşüÇĞİÖŞÜ]/)) {
            console.log('⚠️ Türkçe metin atlandı:', subtitleText);
            return;
        }

        this.lastTranslatedText = subtitleText;
        console.log('📝 Çevrilecek metin:', subtitleText);

        // Çeviri başladığını göster
        this.translationContainer.textContent = '🔄 Çevriliyor...';
        this.translationContainer.style.display = 'block';

        try {
            const translatedText = await this.translateText(subtitleText);
            if (translatedText && translatedText !== subtitleText) {
                this.translationContainer.textContent = translatedText;
                this.translationContainer.style.display = 'block';
                this.translationContainer.style.background = 'rgba(0, 0, 0, 0.9)';
                this.translationContainer.style.color = '#00ff00';
                console.log('✅ Çeviri tamamlandı:', translatedText);
            } else {
                this.translationContainer.textContent = `⚠️ Çeviri bulunamadı: ${subtitleText}`;
                this.translationContainer.style.display = 'block';
                this.translationContainer.style.background = 'rgba(255, 165, 0, 0.9)';
                this.translationContainer.style.color = 'white';
            }
        } catch (error) {
            console.error('❌ Çeviri hatası:', error);
            this.translationContainer.textContent = `❌ Çeviri hatası`;
            this.translationContainer.style.display = 'block';
            this.translationContainer.style.background = 'rgba(220, 53, 69, 0.9)';
            this.translationContainer.style.color = 'white';
        }
    }

    async translateText(text) {
        console.log('🌐 translateText fonksiyonu çağrıldı:', text);
        
        // Cache kontrolü
        if (this.translationCache.has(text)) {
            console.log('📦 Cache\'den çeviri bulundu:', this.translationCache.get(text));
            return this.translationCache.get(text);
        }

        try {
            console.log('🔗 Google Translate API\'ye istek gönderiliyor...');
            const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(text)}`;
            console.log('📍 API URL:', apiUrl);
            
            // Google Translate API kullanarak çeviri yap
            const response = await fetch(apiUrl);
            console.log('📡 API yanıtı alındı:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📊 API yanıt verisi:', data);
            
            const translatedText = data[0] && data[0][0] && data[0][0][0] ? data[0][0][0] : text;
            console.log('✅ Çeviri tamamlandı:', translatedText);

            // Cache'e kaydet
            this.translationCache.set(text, translatedText);

            return translatedText;
        } catch (error) {
            console.error('❌ Çeviri API hatası:', error);
            console.log('🔄 Fallback çeviri kullanılıyor...');
            // Fallback olarak basit bir çeviri tablosu kullan
            return this.simpleTranslate(text);
        }
    }

    simpleTranslate(text) {
        // Basit kelime çevirileri (fallback)
        const translations = {
            'hello': 'merhaba',
            'world': 'dünya',
            'thank you': 'teşekkürler',
            'please': 'lütfen',
            'yes': 'evet',
            'no': 'hayır',
            'good': 'iyi',
            'bad': 'kötü',
            'very': 'çok',
            'and': 've',
            'or': 'veya',
            'but': 'ama',
            'the': 'bu',
            'is': 'dir',
            'are': 'dır',
            'was': 'idi',
            'were': 'idiler',
            'have': 'var',
            'has': 'var',
            'will': 'olacak',
            'would': 'olurdu',
            'can': 'yapabilir',
            'could': 'yapabilirdi',
            'should': 'yapmalı',
            'must': 'zorunda',
            'may': 'olabilir',
            'might': 'olabilirdi'
        };

        let translated = text.toLowerCase();
        Object.keys(translations).forEach(english => {
            const regex = new RegExp(`\\b${english}\\b`, 'gi');
            translated = translated.replace(regex, translations[english]);
        });

        return translated !== text.toLowerCase() ? translated : text;
    }

    removeTranslationContainer() {
        if (this.translationContainer) {
            this.translationContainer.remove();
            this.translationContainer = null;
        }
    }
}

// Extension yüklendiğinde çalıştır
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new UdemySubtitleTranslator();
    });
} else {
    new UdemySubtitleTranslator();
}

// Sayfa değişikliklerini dinle (SPA navigation için)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        if (url.includes('/learn/lecture/')) {
            setTimeout(() => {
                new UdemySubtitleTranslator();
            }, 1000);
        }
    }
}).observe(document, { subtree: true, childList: true });
