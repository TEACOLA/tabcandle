# Chrome Web Store Listing — tabCandle

> Last Updated: 2026-09-19  
> Target Version: 2.3.1

このドキュメントは、Chrome Web Store デベロッパーダッシュボードへの登録・審査申請に必要なすべての掲載情報、権限正当化理由（Permissions Justification）、プライバシー開示、およびパッケージング手順をまとめたリファレンスです。

---

## 1. ストア掲載情報 (Store Listing)

### 基本情報 (Basic Info)

**Extension Name** [REQUIRED]
```text
tabCandle
```
*(manifest.json の "name" と完全一致。75文字以内)*

**Short Description (短い説明)** [REQUIRED]
```text
固定タブ以外の開きっぱなしタブを、240分経過後に自動クローズするシンプルなタブ整理拡張機能
```
*(132文字以内。検索結果やタイルに表示)*

**Category (カテゴリ)** [REQUIRED]
```text
Productivity (生産性)
```

**Single Purpose (単一の目的)** [REQUIRED]
```text
未固定の開きっぱなしタブを開設から240分（4時間）経過後に自動クローズし、ブラウザのメモリとタブバーを整理します。
```
*(英語: Automatically closes unpinned tabs after 240 minutes to free up browser memory and reduce clutter.)*

**Primary Language (主言語)** [REQUIRED]
```text
Japanese (日本語) / English (英語)
```

---

### 詳細な説明 (Detailed Description)

Chrome Web Store の説明欄には Markdown がそのままレンダリングされないため、改行とプレーンテキストで構成しています。以下の枠内をそのままコピー＆ペーストしてください。

#### 【日本語版】(Japanese)
```text
【tabCandle - タブが燃え尽きる前に、自動でブラウザを身軽に】

調べ物や作業でタブを開きすぎて、気づけばブラウザが重くなっていませんか？
tabCandle（タブキャンドル）は、固定（ピン留め）されていない開きっぱなしのタブを、240分（4時間）経過後にバックグラウンドで自動クローズする軽量なタブ整理拡張機能です。

◆ 主な特徴

1. 240分の完全自動クローズ
開いてから4時間経過した不要なタブを自動で終了。メモリやタブバーの肥大化を未然に防ぎます。

2. 安心の2大保護ガード
・📌 固定タブの完全保護: ピン留め（固定）されたタブは絶対に終了しません。残しておきたいタブは右クリックして「タブを固定」するだけで安全に保護されます。
・🔊 音声・動画再生中の保護: YouTube、音楽配信、Google MeetやZoomなどの通話・音声再生中タブは、再生が止まるまで自動終了しません。

3. タブごとの個別タイマー維持
途中で設定に振り回されることなく、すべてのタブが「開いた時刻」を基準にした正確なカウントダウンを維持します。

4. 蝋燭（🕯）が灯るミニマルなポップアップ
ツールバーのアイコンをクリックすると、現在開いているタブとクローズまでの残り時間を一覧表示。気になるタブをクリックすれば瞬時にそのタブへ切り替えられます。

◆ プライバシー＆セキュリティ
・完全ローカル動作: 外部サーバーへのデータ送信、トラッキング、アクセス解析は一切行いません。
・最小限の権限: Webページの閲覧履歴やページ内容を盗み見る権限（<all_urls>等）は一切要求しません。
```

#### 【英語版】(English) - 海外ユーザー・グローバル向け
```text
Keep your browser fast and clutter-free with tabCandle.

tabCandle automatically closes unpinned tabs after 240 minutes (4 hours) in the background, preventing excessive tab accumulation and saving precious system memory.

Key Features:

1. Automatic 240-Minute Tab Cleanup
Tabs left open for more than 4 hours are automatically closed. Say goodbye to tab hoard guilt and browser slowdowns.

2. Built-in Protection Guards
- Pinned Tabs Protected: Any tab you "Pin" will NEVER be closed automatically.
- Audio / Video Playback Protected: Tabs actively playing media (YouTube, Spotify, Google Meet calls, etc.) are protected from closing until playback stops.

3. Independent Tab Timers
Each tab preserves its own countdown based on when it was opened.

4. Minimal Candle Popup Launcher
Click the extension icon to view all active tabs with remaining time indicators and candle icons. Click any item to jump directly to that tab.

Privacy First:
tabCandle works 100% locally on your machine. No analytics, no tracking, and no external server communications.
```

---

## 2. グラフィック＆画像アセット (Graphics & Assets)

| アセット名 | サイズ (px) | 形式 | 状況 | ファイル場所 |
| :--- | :--- | :--- | :---: | :--- |
| **Store Icon (ストアアイコン)** [必須] | 128 × 128 | PNG | ✅ 準備完了 | `icons/icon128.png` |
| **Screenshot 1 (ポップアップ画面)** [必須] | 1280 × 800 または 640 × 400 | PNG | ⬜ 要撮影 | ポップアップを開いた状態 |
| **Small Promo Tile (小型プロモ画像)** [推奨] | 440 × 280 | PNG | ⬜ 任意 | ストアトップ等の掲載用 |
| **Marquee Promo Tile (大型プロモ画像)** [任意] | 1400 × 560 | PNG | ⬜ 任意 | おすすめ掲載用 |

> **スクリーンショット撮影のアドバイス**:
> 1. Chrome で適当なタブ（Yahoo, Wikipedia, GitHub など）を複数開く（うち1〜2個を右クリックして「タブを固定」にしておく）。
> 2. ツールバーの tabCandle アイコンをクリックしてポップアップを開く。
> 3. ブラウザウィンドウとポップアップ画面を含めて **1280 × 800** でキャプチャする（macOSの `Cmd + Shift + 4` 等）。

---

## 3. 権限の正当化理由 (Permissions Justification)

審査ダッシュボードの **「権限の正当化理由（Permissions Justification）」** 入力欄に、以下の英語テキストをそのままコピー＆ペーストしてください。

| Permission | Type | 審査用 Justification（英語） | 日本語での目的説明 |
| :--- | :--- | :--- | :--- |
| `tabs` | permissions | `Used to detect tab creation timestamps, check if a tab is pinned or playing audio for protection, switch to clicked tabs from the popup, and automatically close expired tabs after 240 minutes.` | タブの開設時刻記録、固定/音声状態の確認、ポップアップからのタブ切り替え、期限切れタブのクローズに使用。 |
| `storage` | permissions | `Used to store tab creation timestamps and scheduled close times locally on the user's device so timers persist across service worker recycles.` | サービスワーカー再起動後もタブごとの終了予定時刻を保持するためローカルに保存。 |
| `alarms` | permissions | `Used to schedule background tab close alarms and run a periodic 1-minute safety sweep in Manifest V3 without keeping service workers alive continuously.` | サービスワーカーを常時起動させずに、指定時刻でのクローズや定期スイープを低負荷にスケジュール実行するため使用。 |

※ `tabGroups` や `host_permissions`（`<all_urls>` 等）は一切使用していないため、追加の正当化入力は不要です。

---

## 4. プライバシーとデータの使用 (Privacy & Data Use)

審査ダッシュボードの **「プライバシー（Privacy）」** タブでの申告内容です。

### データの収集 (Data Collection)
- **「ユーザーデータを収集していますか？」** → **いいえ (No)**

| 項目 | 回答 |
| :--- | :---: |
| 個人を特定できる情報 (PII) | 収集しない |
| 健康情報 | 収集しない |
| 財務および支払い情報 | 収集しない |
| 認証情報 | 収集しない |
| 個人通信 | 収集しない |
| 位置情報 | 収集しない |
| ウェブ履歴 (Web History) | 収集しない |
| ユーザー アクティビティ | 収集しない |
| ウェブサイトのコンテンツ | 収集しない |

### データ使用の認証 (Data Use Certification)
以下にすべてチェック（同意）を入れます：
- [x] ユーザーデータを第三者に販売しない
- [x] 拡張機能の単一の目的（コア機能）に関係のない目的でデータを使用しない
- [x] 信用力評価や融資目的でデータを使用しない

---

## 5. プライバシーポリシー (Privacy Policy)

Web Store ではプライバシーポリシーの公開URL（公開Webページ）の設定が推奨されます。  
GitHub の Gist や GitHub Pages、無料の Notion ページ等に以下の文章をそのまま貼り付けてURLを取得してください。

```markdown
# Privacy Policy for tabCandle

Last updated: September 19, 2026

tabCandle ("the Extension") does not collect, store, transmit, or share any personal data, sensitive user information, or web browsing history.

1. Information Handling
All data handled by the Extension (such as tab IDs, timestamps, and pinned states) remains exclusively on your local device within Chrome's local storage (`chrome.storage.local`). No information is ever transmitted to external servers, third parties, or developer endpoints.

2. Network & Third-Party Services
The Extension makes zero external network requests. It contains no third-party tracking, telemetry, or advertising libraries.

3. Contact
If you have any questions or feedback regarding this privacy policy, please contact:
[Your Contact Email Address]
```

---

## 6. 配布設定 (Distribution)

- **公開範囲 (Visibility)**: 公開 (Public)
- **対象地域 (Regions)**: すべての地域 (All regions)
- **料金 (Pricing)**: 無料 (Free)

---

## 7. ストア提出用 ZIP パッケージの作成手順

Chrome Web Store にアップロードする ZIP ファイルには、`.git` フォルダや隠しファイルを含めないようにします。

以下のターミナルコマンドを実行することで、提出用パッケージ（`tabcandle-v2.3.1.zip`）を作成できます：

```bash
zip -r tabcandle-v2.3.1.zip manifest.json background.js popup icons README.md -x "*.DS_Store"
```

生成された `tabcandle-v2.3.1.zip` をデベロッパーダッシュボードの **「パッケージ」** 画面にアップロードすれば完了です！

---

## 8. バージョン履歴 (Version History)

| バージョン | 日付 | 主な変更内容 | 状況 |
| :--- | :--- | :--- | :---: |
| **v2.3.1** | 2026-09-20 | ・ブランドテーマカラーを「黒」「グレー」「オレンジ」のWebセーフカラー（216色）に完全統一<br>・通常時および警告時のカウントダウンバッジ配色をキャンドルカラーへ最適化<br>・READMEおよびストア情報の更新 | 申請準備完了 (Ready) |
| **v2.3.0** | 2026-09-19 | ・赤色警告グループの廃止と純粋な240分自動終了への最適化<br>・`tabGroups` 権限の完全削除<br>・各タブカウントダウンバッジへの蝋燭アイコン（🕯）追加<br>・Webセーフカラー（216色）統一とUIの超軽量化（約14KB） | 完了 |
