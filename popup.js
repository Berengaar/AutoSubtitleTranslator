// Popup JavaScript for Udemy Translation Extension

document.addEventListener('DOMContentLoaded', async () => {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const status = document.getElementById('status');
    const statusText = document.getElementById('statusText');
    const languageSelect = document.getElementById('languageSelect');

    // Mevcut durumu yükle
    const result = await chrome.storage.sync.get(['isActive', 'targetLanguage']);
    const isActive = result.isActive || false;
    const targetLanguage = result.targetLanguage || 'tr';
    
    updateUI(isActive);
    updateLanguageSelect(targetLanguage);

    // Toggle switch click event
    toggleSwitch.addEventListener('click', async () => {
        const newState = !isActive;
        await chrome.storage.sync.set({ isActive: newState });
        
        // Content script'e mesaj gönder
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url.includes('udemy.com')) {
            try {
                await chrome.tabs.sendMessage(tab.id, { action: 'toggleTranslation', isActive: newState });
                console.log('✅ Content script\'e mesaj gönderildi');
            } catch (error) {
                console.log('⚠️ Content script\'e mesaj gönderilemedi:', error.message);
            }
        }
        
        updateUI(newState);
    });

    // Dil seçimi event listener
    languageSelect.addEventListener('change', async () => {
        const selectedLanguage = languageSelect.value;
        await chrome.storage.sync.set({ targetLanguage: selectedLanguage });
        
        // Content script'e dil değişikliği mesajı gönder
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url.includes('udemy.com')) {
            try {
                await chrome.tabs.sendMessage(tab.id, { 
                    action: 'changeLanguage', 
                    targetLanguage: selectedLanguage 
                });
                console.log('✅ Dil değişikliği content script\'e gönderildi');
            } catch (error) {
                console.log('⚠️ Dil değişikliği mesajı gönderilemedi:', error.message);
            }
        }
    });

    function updateLanguageSelect(language) {
        languageSelect.value = language;
    }

    function updateUI(active) {
        if (active) {
            toggleSwitch.classList.add('active');
            status.classList.remove('inactive');
            status.classList.add('active');
            statusText.textContent = 'Translation Active';
        } else {
            toggleSwitch.classList.remove('active');
            status.classList.remove('active');
            status.classList.add('inactive');
            statusText.textContent = 'Translation Off';
        }
    }

    // Check page status
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && !tab.url.includes('udemy.com')) {
        statusText.textContent = 'Not on Udemy page';
        status.classList.remove('active', 'inactive');
        status.classList.add('inactive');
        toggleSwitch.style.opacity = '0.5';
        toggleSwitch.style.pointerEvents = 'none';
    }
});


