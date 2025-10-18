# Udemy Turkish Translation Extension

A Chrome extension that translates Udemy video subtitles to Turkish in real-time.

## 🚀 Features

- **Real-time Translation**: Video subtitles are automatically translated to Turkish
- **Smart Detection**: Automatically detects Udemy video pages
- **Cache System**: Translations are cached for faster response times
- **Modern UI**: Sleek popup interface with user-friendly design
- **Mobile Compatible**: Responsive design that works on all devices

## 📦 Installation

1. Download this project to your computer
2. Go to `chrome://extensions/` in Chrome
3. Enable "Developer mode"
4. Click "Load unpacked extension"
5. Select this folder

## 🎯 Usage

1. Go to a Udemy video page
2. Enable video subtitles
3. Activate the extension (toggle switch in popup)
4. Turkish translations will appear below English subtitles

## 🛠️ Technical Details

### File Structure
```
udemy-translate-ext/
├── manifest.json          # Extension manifest
├── content.js             # Main translation script
├── popup.html             # Popup interface
├── popup.js               # Popup JavaScript
├── styles.css             # Translation styles
├── icons/                 # Extension icons
│   └── icon.svg          # SVG icon
└── README.md             # This file
```

### Technologies Used
- **Chrome Extensions API**: Extension management
- **Google Translate API**: Translation service
- **MutationObserver**: DOM change monitoring
- **CSS3**: Modern styling and animations

### API Integration
The extension uses Google Translate API to translate English text to Turkish. When the API doesn't respond, a fallback translation system is activated.

## 🔧 Development

### Requirements
- Chrome 88+ (Manifest V3 support)
- Modern web browser

### Customization
- Modify translation appearance in `styles.css`
- Customize translation logic in `content.js`
- Change interface in `popup.html`

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork this repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push your branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 📞 Contact

For questions about this project, you can use GitHub issues.

---

**Note**: This extension is developed for educational purposes. Please obtain necessary permissions for commercial use.


