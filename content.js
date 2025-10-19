class UdemySubtitleTranslator {
    constructor() {
        this.isActive = false;
        this.targetLanguage = 'tr';
        this.lastTargetText = null;
        this.targetObserver = null;
        this.isTranslating = false;
        this.init();
    }
    async init() {
        const result = await chrome.storage.sync.get(['isActive', 'targetLanguage']);
        this.isActive = result.isActive || false;
        this.targetLanguage = result.targetLanguage || 'tr';

        this.observeTargetElement();

        if (this.isActive) {
            this.startTranslation();
        }

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

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'toggleTranslation') {
                this.isActive = message.isActive;
                if (this.isActive) {
                    this.startTranslation();
                } else {
                    this.stopTranslation();
                }
                sendResponse({ success: true });
            } else if (message.action === 'changeLanguage') {
                this.targetLanguage = message.targetLanguage;
                // Mevcut çevirileri yenile
                if (this.isActive) {
                    this.updateTranslation();
                }
                sendResponse({ success: true });
            }
        });
    }

    startTranslation() {
        this.observeTargetElement();
    }

    stopTranslation() {
        if (this.targetObserver) {
            this.targetObserver.disconnect();
            this.targetObserver = null;
        }
    }

    async translateText(text) {
        try {
            const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${this.targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data[0]?.[0]?.[0] || text;
        } catch (error) {
            console.error('Translation error:', error);
            throw error;
        }
    }

    observeTargetElement() {
        if (this.targetObserver) {
            this.targetObserver.disconnect();
        }

        const targetObserver = new MutationObserver(() => {
            const targetElement = document.querySelector('.captions-display--captions-cue-text--TQ0DQ');
            if (targetElement) {
                this.updateTranslation();
            }
        });

        this.targetObserver = targetObserver;

        const targetElement = document.querySelector('.captions-display--captions-cue-text--TQ0DQ');
        if (targetElement) {
            targetObserver.observe(targetElement, {
                childList: true,
                subtree: true,
                characterData: true
            });
        } else {
            setTimeout(() => this.observeTargetElement(), 2000);
        }
    }

    async updateTranslation() {
        if (this.isTranslating) {
            return;
        }

        const targetElement = document.querySelector('.captions-display--captions-cue-text--TQ0DQ');
        
        if (!targetElement) {
            return;
        }

        // Eğer çeviri zaten varsa, orijinal metni innerHTML'den al
        let currentText;
        if (targetElement.innerHTML.includes('<br>') && targetElement.innerHTML.includes('</span>')) {
            // Çeviri varsa, sadece orijinal metni al
            currentText = targetElement.innerHTML.split('<br>')[0];
            // Eğer metin değişmemişse, tekrar çevirme
            if (currentText === this.lastTargetText) {
                return;
            }
        } else {
            // Çeviri yoksa, normal textContent kullan
            currentText = targetElement.textContent.trim();
        }

        if (currentText && currentText !== this.lastTargetText && currentText.length > 5) {
            this.isTranslating = true;

            try {
                const translatedText = await this.translateText(currentText);
                
                if (translatedText && translatedText !== currentText) {
                    targetElement.innerHTML = currentText + '<br><span style="color: white;">' + translatedText + '</span>';
                }
            } catch (error) {
                targetElement.innerHTML = currentText + '<br><span style="color: #dc3545;">❌ Translation error</span>';
            } finally {
                this.isTranslating = false;
                this.lastTargetText = currentText;
            }
        }
    }
}

let udemyTranslator = null;

function initializeTranslator() {
    if (udemyTranslator) {
        udemyTranslator.stopTranslation();
        udemyTranslator = null;
    }
    udemyTranslator = new UdemySubtitleTranslator();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTranslator);
} else {
    initializeTranslator();
}

let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        if (url.includes('/learn/lecture/')) {
            setTimeout(initializeTranslator, 5000);
        }
    }
}).observe(document, { subtree: true, childList: true });
