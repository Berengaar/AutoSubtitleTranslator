// Popup JavaScript for Udemy Translation Extension

document.addEventListener('DOMContentLoaded', async () => {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const status = document.getElementById('status');
    const statusText = document.getElementById('statusText');

    // Mevcut durumu yükle
    const result = await chrome.storage.sync.get(['isActive']);
    const isActive = result.isActive || false;
    
    updateUI(isActive);

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

    function updateUI(active) {
        if (active) {
            toggleSwitch.classList.add('active');
            status.classList.remove('inactive');
            status.classList.add('active');
            statusText.textContent = 'Çeviri Aktif';
        } else {
            toggleSwitch.classList.remove('active');
            status.classList.remove('active');
            status.classList.add('inactive');
            statusText.textContent = 'Çeviri Kapalı';
        }
    }

    // Sayfa durumunu kontrol et
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && !tab.url.includes('udemy.com')) {
        statusText.textContent = 'Udemy sayfasında değil';
        status.classList.remove('active', 'inactive');
        status.classList.add('inactive');
        toggleSwitch.style.opacity = '0.5';
        toggleSwitch.style.pointerEvents = 'none';
    }
});


