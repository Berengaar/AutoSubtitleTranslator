class UdemySubtitleTranslator {
    constructor() {
        this.isActive = false;
        this.lastTargetText = null;
        this.targetElementInterval = null;
        this.targetObserver = null;
        this.isTranslating = false;
        this.init();
    }
    async init() {
        const result = await chrome.storage.sync.get(['isActive']);
        this.isActive = result.isActive || false;

        this.injectCustomText();

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
            }
        });
    }

    startTranslation() {
        if (this.targetElementInterval) {
            clearInterval(this.targetElementInterval);
        }

        this.targetElementInterval = setInterval(() => {
            const targetElement = document.querySelector('.captions-display--captions-cue-text--TQ0DQ:not(.udemy-translation):not(.turkish-translation)');
            if (targetElement) {
                const currentText = targetElement.textContent.trim();
                if (currentText && currentText !== this.lastTargetText && currentText.length > 5) {
                    this.updateTranslation();
                }
            }
        }, 500);

        this.observeTargetElement();
    }

    stopTranslation() {
        if (this.targetElementInterval) {
            clearInterval(this.targetElementInterval);
            this.targetElementInterval = null;
        }
        
        if (this.targetObserver) {
            this.targetObserver.disconnect();
            this.targetObserver = null;
        }
        
        document.querySelectorAll('.captions-display--captions-cue-text--TQ0DQ.udemy-translation').forEach(el => el.remove());
    }

    async translateText(text) {
        try {
            const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data[0]?.[0]?.[0] || text;
        } catch (error) {
            console.error('Çeviri hatası:', error);
            throw error;
        }
    }

    injectCustomText() {
        this.findTargetElement();
        this.observeTargetElement();
    }

    findTargetElement() {
        const targetElement = document.querySelector('.captions-display--captions-cue-text--TQ0DQ');
        if (targetElement && targetElement.offsetHeight > 0 && targetElement.offsetWidth > 0) {
            this.addCustomTextBelow(targetElement);
        } else {
            setTimeout(() => this.findTargetElement(), 3000);
        }
    }

    async addCustomTextBelow(targetElement) {
        if (targetElement.parentNode.querySelector('.captions-display--captions-cue-text--TQ0DQ.udemy-translation')) {
            return;
        }

        const subtitleText = targetElement.textContent.trim();
        const customTextElement = document.createElement('div');
        customTextElement.className = 'captions-display--captions-cue-text--TQ0DQ udemy-translation turkish-translation';
        customTextElement.setAttribute('data-purpose', 'captions-cue-text');
        customTextElement.textContent = '🔄 Çevriliyor...';
        
        // Udemy'nin orijinal stillerini kopyala
        const computedStyle = window.getComputedStyle(targetElement);
        customTextElement.style.cssText = `
            font-size: ${computedStyle.fontSize};
            font-family: ${computedStyle.fontFamily};
            font-weight: ${computedStyle.fontWeight};
            line-height: ${computedStyle.lineHeight};
            text-align: ${computedStyle.textAlign};
            opacity: ${computedStyle.opacity};
            color: ${computedStyle.color};
            background: ${computedStyle.background};
            text-shadow: ${computedStyle.textShadow};
            margin-top: 8px;
            display: block !important;
            width: 100% !important;
            clear: both !important;
            float: none !important;
            flex: none !important;
            position: relative !important;
        `;

        targetElement.parentNode.appendChild(customTextElement);

        if (subtitleText && subtitleText.length > 5) {
            try {
                const translatedText = await this.translateText(subtitleText);
                customTextElement.textContent = translatedText || '⚠️ Çeviri bulunamadı';
                customTextElement.style.color = translatedText ? 'white' : '#ffa500';
            } catch (error) {
                customTextElement.textContent = '❌ Çeviri hatası';
                customTextElement.style.color = '#dc3545';
            }
        }
    }

    observeTargetElement() {
        if (this.targetObserver) {
            this.targetObserver.disconnect();
        }

        const targetObserver = new MutationObserver(() => {
            const targetElement = document.querySelector('.captions-display--captions-cue-text--TQ0DQ:not(.udemy-translation):not(.turkish-translation)');
            if (targetElement) {
                this.updateTranslation();
            }
        });

        this.targetObserver = targetObserver;

        const targetElement = document.querySelector('.captions-display--captions-cue-text--TQ0DQ:not(.udemy-translation)');
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

        const targetElement = document.querySelector('.captions-display--captions-cue-text--TQ0DQ:not(.udemy-translation)');
        let customTextElement = document.querySelector('.captions-display--captions-cue-text--TQ0DQ.udemy-translation');
        
        if (!targetElement) {
            return;
        }

        if (!customTextElement) {
            await this.addCustomTextBelow(targetElement);
            customTextElement = document.querySelector('.captions-display--captions-cue-text--TQ0DQ.udemy-translation');
            if (!customTextElement) {
                return;
            }
        }

        const currentText = targetElement.textContent.trim();

        if (currentText && currentText !== this.lastTargetText && currentText.length > 5) {
            this.isTranslating = true;

            const computedStyle = window.getComputedStyle(targetElement);
            customTextElement.style.fontSize = computedStyle.fontSize;
            customTextElement.style.fontFamily = computedStyle.fontFamily;
            customTextElement.style.fontWeight = computedStyle.fontWeight;
            customTextElement.style.lineHeight = computedStyle.lineHeight;
            customTextElement.style.textAlign = computedStyle.textAlign;
            customTextElement.style.opacity = computedStyle.opacity;
            customTextElement.style.color = computedStyle.color;
            customTextElement.style.background = computedStyle.background;
            customTextElement.style.textShadow = computedStyle.textShadow;
            
            // Alt alta gelmesi için gerekli stiller
            customTextElement.style.display = 'block';
            customTextElement.style.width = '100%';
            customTextElement.style.clear = 'both';
            customTextElement.style.float = 'none';
            customTextElement.style.flex = 'none';
            customTextElement.style.position = 'relative';

            try {
                customTextElement.textContent = '🔄 Çevriliyor...';
                const translatedText = await this.translateText(currentText);
                
                if (translatedText && translatedText !== currentText) {
                    customTextElement.textContent = translatedText;
                    customTextElement.style.color = 'white';
                }
            } catch (error) {
                customTextElement.textContent = '❌ Çeviri hatası';
                customTextElement.style.color = '#dc3545';
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
            setTimeout(initializeTranslator, 1000);
        }
    }
}).observe(document, { subtree: true, childList: true });
