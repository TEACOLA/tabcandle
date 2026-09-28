# tabCandle — Chrome Tab Auto-Close Extension

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-tabCandle-orange?logo=googlechrome)](https://chromewebstore.google.com/detail/tabcandle/eghieefcaocdlamkpefmemmbepdgkdac)
[![GitHub Pages](https://img.shields.io/badge/Privacy_Policy-GitHub_Pages-blue)](https://teacola.github.io/tabcandle/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)

> 🕯 **Let your inactive tabs burn down gracefully.**  
> Automatically closes unpinned tabs after 240 minutes (4 hours) in the background. Clean, lightweight, and memory-friendly.

🛒 **Official Store Page**: [Install tabCandle from Chrome Web Store](https://chromewebstore.google.com/detail/tabcandle/eghieefcaocdlamkpefmemmbepdgkdac)

---

## Key Features

### 1. ⏰ Automatic 240-Minute Tab Cleanup
- Prevents browser slowdown and memory hoarding by automatically closing unpinned tabs left open for 240 minutes (4 hours).
- **Two Built-in Protection Guards**:
  1. 📌 **Pinned Tab Protection**: Any tab you pin is strictly protected and will **never** be closed automatically.
  2. 🔊 **Active Media Protection**: Tabs playing audio or video (YouTube, Spotify, Google Meet, Zoom, podcasts) are protected until playback ends.
- **Independent Tab Timers**: Every tab tracks its own lifecycle based on when it was opened.

### 2. 🕯 Minimalist Candle Countdown Popup
- **Live Countdown List**: Click the toolbar icon to view all active tabs with remaining time indicators and candle icons (🕯).
- **Instant Tab Switching**: Click any tab in the list to jump straight to it.
- 🎨 **Web-Safe 3-Color Design**: Tailored with an elegant Black, Gray, and Orange palette (strict 216-color Web-Safe standard). High contrast, dark mode native.

### 3. 🌐 Internationalization (i18n)
- **Automatic Language Switching**: Built-in native support for English (`en`) and Japanese (`ja`). The extension matches your browser's language automatically.

### 4. 🔒 100% Private & Local
- **Zero Data Collection**: No browsing history, no URLs, no personal data tracked or stored.
- **Zero External Network Requests**: Operates 100% locally on your machine with no third-party SDKs, ads, or analytics.

---

## Installation

### Option A: Install from Chrome Web Store (Recommended)
👉 [Click here to install tabCandle on the Chrome Web Store](https://chromewebstore.google.com/detail/tabcandle/eghieefcaocdlamkpefmemmbepdgkdac)

### Option B: Load Unpacked (Development)
1. Clone this repository:
   ```bash
   git clone https://github.com/TEACOLA/tabcandle.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** in the top-right corner.
4. Click **"Load unpacked"** and select the `tabcandle` folder.
5. Pin `tabCandle` from the Extensions puzzle icon in the toolbar.

---

## File Structure

```
tabcandle/
├── _locales/             # Internationalization dictionaries
│   ├── en/messages.json  # English (default)
│   └── ja/messages.json  # Japanese
├── manifest.json         # Manifest V3 extension configuration
├── background.js         # Service worker (tab timer tracking & alarms sweep)
├── icons/                # Extension icons (16px, 32px, 48px, 128px, SVG)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   ├── icon128.png
│   └── candle.svg
├── popup/
│   ├── popup.html        # Popup interface
│   ├── popup.css         # Styling (Web-Safe black/gray/orange theme)
│   └── popup.js          # Countdown renderer & tab switching
├── docs/
│   └── index.html        # GitHub Pages landing & privacy policy
├── CHROMEWEBSTORE.md     # Store listing references & justifications
└── README.md             # Documentation
```

---

## Permissions

| Permission | Purpose |
| :--- | :--- |
| `tabs` | Used to inspect tab creation timestamps, check pinned / audio playing states, and close inactive tabs after 240 minutes. |
| `storage` | Used solely to save tab timestamps locally across service worker lifecycles. |
| `alarms` | Used to schedule background sweep checks without keeping processes awake continuously. |

---

<details>
<summary>🇯🇵 日本語での説明 (Japanese Description)</summary>

### tabCandle - Chrome タブ自動クローズ拡張機能
固定（ピン留め）されていない開きっぱなしのタブを、**240分（4時間）経過後にバックグラウンドで静かに自動クローズ**する軽量なChrome拡張機能です。

- **安心の2大保護ガード**: ピン留めされた固定タブ、および音声・動画再生中のタブは絶対に自動クローズされません。
- **ミニマルUI**: 蝋燭アイコン（🕯）付きの残り時間リストから、クリック1つで目的のタブへジャンプ可能。
- **3色パレット**: 「黒」「グレー」「オレンジ」のWebセーフカラーで統一されたシックなデザイン。
- **多言語（i18n）対応**: 英語環境と日本語環境でUI表示が自動的に切り替わります。
- **完全ローカル動作**: 外部通信なし・個人データ収集ゼロ。

</details>

---

## License
MIT License. Open source and privacy first.
