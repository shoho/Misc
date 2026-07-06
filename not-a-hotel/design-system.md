# NOT A HOTEL — Design System(推定復元版)

> 世界中にあなたの家を / YOUR HOME ANYWHERE

[NOT A HOTEL](https://notahotel.com/)(世界的な建築家と共作した邸宅を販売し、使わない日はホテルとして貸し出す日本のブランド)のビジュアルアイデンティティを、デザイントークンとして再構成したもの。

**出典と確度について**: この環境からは公式サイト・ブランドガイドの一次情報に到達できなかったため(ネットワークポリシーで拒否)、HEX 値・書体名は公開されている印象からの**推定値**。ブランドの事実(タグライン、モノクロームの規律、SETOUCHI=Bjarke Ingels Group 設計、HERITAGE / vertex の新ブランド等)は Web 検索で確認済み。正値が入手できたら `tokens.css` を差し替えるだけで全体に反映される。

- トークンの実体: [`tokens.css`](./tokens.css)(ライト/ダーク両テーマ、4段構成)
- 目で確認する: [`index.html`](./index.html)(スタイルガイド。テーマトグル付き)

---

## 0. ブランドの規律(すべてに優先)

1. **色は写真と風景が持ち込む。UI は黒・白・グレーに徹する。** アクセントカラーは存在しない — 黒がアクセント。
2. **角丸ゼロ・影ゼロ。** 建築の直線がそのまま UI の直線になる。階層はヘアラインと余白で作る。
3. **余白は多め側に倒す。** 迷ったら詰めずに空ける。
4. **英字は大文字+トラッキング**(`VIEW MORE`、拠点名)。これがブランドの「声」。

---

## 1. カラー

### モノクローム階調

| トークン | ライト | ダーク | 役割 |
|---|---|---|---|
| `--bg` | `#FFFFFF` | `#0A0A0A` | ページ背景 |
| `--bg-alt` | `#F7F7F7` | `#141414` | 交互セクション |
| `--bg-sunken` | `#F2F2F2` | `#1A1A1A` | 入力・くぼみ面 |
| `--line` | `#E6E6E6` | `#2B2B2B` | ヘアライン罫線 |
| `--line-strong` | `#111111` | `#F5F5F5` | 強い罫線(表・区切り) |
| `--ink` | `#111111` | `#F5F5F5` | 主要テキスト |
| `--ink-2` | `#6E6E6E` | `#9C9C9C` | 補助テキスト |
| `--ink-3` | `#A3A3A3` | `#6B6B6B` | プレースホルダー・無効 |
| `--action` / `--action-ink` | `#111111` / `#FFFFFF` | `#F5F5F5` / `#0A0A0A` | ソリッドボタン・選択状態 |

一般原則では「純グレーは避け、アクセント方向に寄せる」だが、このブランドは**無彩色そのものがアイデンティティ**なので意図的に純グレー階調を採る(原則より上位のブランド指示として扱う)。

### セマンティック(アプリ状態専用)

| トークン | ライト | ダーク | 用途 |
|---|---|---|---|
| `--success` / `--success-soft` | `#2E7D46` / `#EAF3ED` | `#6FBF85` / `#14231A` | 予約確定・解錠成功 |
| `--warning` / `--warning-soft` | `#8A6A1C` / `#F5EFDD` | `#D3AD4B` / `#26200F` | 残りわずか・要確認 |
| `--danger` / `--danger-soft` | `#C0273A` / `#F9E9EB` | `#E07284` / `#2A1418` | エラー・決済失敗 |

セマンティック色は**アプリの状態表示にだけ**使う。マーケティング面(LP・拠点紹介)には一切色を持ち込まない。

### ダークテーマの考え方

白黒の反転がそのままブランドになる(公式サイト自体が黒面と白面を行き来する)。純黒 `#000` ではなく `#0A0A0A` を床にし、階調は明度差で再調整。影はライト同様ゼロ。

---

## 2. タイポグラフィ

| 役割 | トークン | スタック(推定) | 使いどころ |
|---|---|---|---|
| ディスプレイ | `--font-display` | Helvetica Neue → Neue Haas Grotesk → Arial → ヒラギノ角ゴ | 拠点名・見出し。**大文字+`--tracking-display`** |
| 本文 | `--font-body` | 同族スタック+Noto Sans JP | 本文・UI 全般 |
| コード | `--font-mono` | SF Mono → Menlo | コード・トークン名のみ |

- **単一書体主義**: 見出し用に別書体を立てない。役割の分化はサイズ(`--text-5xl` 61px まで使う)・ウェイト・大文字トラッキングで行う。これは「2書体以上をペアにする」一般原則からの**ブランド由来の意図的逸脱**。
- 英大文字ラベル(`VIEW MORE` など)は `--text-xs`〜`--text-sm` + `letter-spacing: var(--tracking-caps)`(0.12em)。
- 和文本文は `--leading-body`(1.8)でゆったり。行長 65 字前後。
- 価格・面積・日付など縦に並ぶ数字は `font-variant-numeric: tabular-nums`。
- Web フォントを使える実装では Neue Haas Grotesk(または Helvetica Now)+ Noto Sans JP の読み込みを推奨。プロトタイプではシステムスタックのまま。

---

## 3. 余白・形・モーション

- **余白**: 4px 基数(`--space-1`〜`--space-32`)。セクション間は `--space-24`〜`--space-32` と大胆に空ける。兄弟間隔は親の flex/grid + `gap`。
- **形**: `--radius-0` のみ。**角丸・pill は存在しない**。バッジ・チップも直角。
- **影**: `--shadow-none` のみ。浮遊面(メニュー・モーダル)は `--line` の枠線+背景色差で区切る。
- **モーション**: フェードとわずかな移動だけ。`--duration-quick`(150ms、hover)/ `--duration-base`(400ms、開閉)/ `--duration-slow`(800ms、写真のフェードイン)。`prefers-reduced-motion: reduce` でほぼ 0 に落とす。

---

## 4. コンポーネント基本形

### ボタン

```css
.btn {
  font: 500 var(--text-sm)/1 var(--font-body);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  padding: var(--space-4) var(--space-8);
  border-radius: var(--radius-0);
  border: 1px solid transparent;
  cursor: pointer;
  transition: opacity var(--duration-quick) var(--ease-out);
}
.btn:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }

.btn-solid   { background: var(--action); color: var(--action-ink); }
.btn-solid:hover { opacity: 0.85; }
.btn-outline { background: transparent; color: var(--ink); border-color: var(--line-strong); }
.btn-text    { background: none; border: none; padding: 0;
               color: var(--ink); text-decoration: underline; text-underline-offset: 4px; }
```

- ソリッド(黒)は 1 画面 1 つ。第2候補はアウトライン、第3はテキストリンク。
- ラベルは英大文字(`REQUEST` / `VIEW MORE`)か日本語。日本語のときは `text-transform` の影響を受けないのでトラッキングだけ効く。

### 入力

```css
.field input {
  background: var(--bg);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-0);
  padding: var(--space-4);
  color: var(--ink);
  font: var(--text-md)/1.4 var(--font-body);
}
.field input:focus-visible { outline: 2px solid var(--focus); outline-offset: 1px; }
.field input[aria-invalid="true"] { border-color: var(--danger); }
```

ラベルは上置き・大文字 `--text-xs` + `--tracking-caps`。

### 拠点カード

```css
.property-card { background: var(--bg); display: grid; }
.property-card .photo { aspect-ratio: 4 / 3; object-fit: cover; }  /* 写真が唯一の色 */
.property-card .name  { font: 500 var(--text-xl)/1.2 var(--font-display);
                        text-transform: uppercase; letter-spacing: var(--tracking-display); }
.property-card .meta  { color: var(--ink-2); font-size: var(--text-sm); }
.property-card .price { font-variant-numeric: tabular-nums; }
```

枠線・影は付けない。写真とテキストブロックの余白だけで成立させる。

### チップ(直角)

```css
.chip {
  font: 500 var(--text-xs)/1 var(--font-body);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-0);
}
/* 状態チップのみセマンティック色: .chip-success / .chip-warning / .chip-danger */
```

---

## 5. Do / Don't

| Do | Don't |
|---|---|
| UI は黒・白・グレーだけで組む。色は写真に任せる | アクセントカラーを発明する |
| 角は常に直角、影はゼロ | 角丸・ドロップシャドウを足す |
| 英字見出し・ラベルは大文字+トラッキング | 小文字のまま詰めた英字見出し |
| セクション間は `--space-24` 以上空ける | 余白を怖がって詰める |
| ソリッドボタン(黒)は 1 画面 1 つ | 黒ベタのボタンを並べる |
| セマンティック色はアプリ状態のみ | LP・拠点紹介に success/danger を出す |
| 価格・面積は `tabular-nums` | プロポーショナル数字の価格表 |
| 色はトークン経由で参照 | HEX 直書き |

---

## 6. 使い方

```html
<link rel="stylesheet" href="tokens.css">
```

以降の `/design` 系ワークフローはこのファイル群(`not-a-hotel/tokens.css`・本書)を既存デザインシステムとして優先的に参照すること。公式の正値(ブランドガイド・サイトの computed style)が手に入ったら、`tokens.css` の該当値を差し替え、本書の「推定」注記を外す。
