# HOT A HOTEL — Design System

> 熱をつれて、旅にでる。

薪火・サウナ・湯を滞在の中心に据えたホテルブランドのためのデザインシステム。
ビジュアルの軸は **火と水の対比** — 熾火(おきび)の朱をただ一つの主役に、湯けむりの青鈍(あおにび)を対抗色に置く。面は炭と白晒のニュートラルで静かに保つ。

- トークンの実体: [`tokens.css`](./tokens.css)(ライト/ダーク両テーマ、4段構成)
- 目で確認する: [`index.html`](./index.html)(スタイルガイド。テーマトグル付き)

このブランドは既存プロダクト・コードベースを持たないため、**全トークンは新規提案値**である(既存実装からの抽出ではない)。

---

## 1. カラー

### ブランド

| トークン | ライト | ダーク | 役割 |
|---|---|---|---|
| `--accent` | `#C63A1B` | `#EF6234` | **熾火** — CTA・強調。1画面に主役1箇所だけ |
| `--accent-strong` | `#A52E12` | `#FF7C50` | hover / active |
| `--accent-soft` | `#F8E5DE` | `#3B1D12` | 淡い帯・選択状態の面 |
| `--accent-ink` | `#FFFFFF` | `#23100A` | accent 面上のテキスト |
| `--counter` | `#3E6B7A` | `#85AEBD` | **湯けむり** — リンク・情報・フォーカスリング |
| `--counter-soft` | `#E2ECEF` | `#1C2A30` | 情報バッジ・淡い面 |

### ニュートラル(炭に寄せた暖色系。純グレー禁止)

| トークン | ライト | ダーク | 役割 |
|---|---|---|---|
| `--bg` | `#FAF7F4` | `#171210` | ページ背景(白晒 / 炭) |
| `--bg-raised` | `#FFFFFF` | `#211A16` | カード・シート |
| `--bg-sunken` | `#F1ECE7` | `#100C0A` | 入力・くぼみ面 |
| `--line` | `#E3DBD3` | `#382E27` | 罫線 |
| `--ink` | `#221C18` | `#EFE7E0` | 主要テキスト |
| `--ink-2` | `#6B5E55` | `#B3A79D` | 補助テキスト |
| `--ink-3` | `#9C8F84` | `#7E7268` | プレースホルダー・無効 |

### セマンティック(アクセントとは別枠)

| トークン | ライト | ダーク | 用途 |
|---|---|---|---|
| `--success` / `--success-soft` | `#3C7A4E` / `#E2EFE6` | `#74BE8A` / `#1B2E21` | 予約確定・空室あり(苔) |
| `--warning` / `--warning-soft` | `#8F6400` / `#F6ECD4` | `#DDA93F` / `#33270E` | 残室わずか・要確認(灯) |
| `--danger` / `--danger-soft` | `#B01E3C` / `#F8E0E5` | `#E86480` / `#391520` | エラー・満室・取消(緋) |

**朱と緋の使い分け**: `--danger` は accent より青みの深紅にしてある。それでも同一視野に並ぶと区別が濁るため、**エラー表示中の画面では accent の CTA を `--ink` のソリッドボタンに落とす**(スタイルガイドの Do/Don't 参照)。

### ダークテーマの考え方

単純反転ではなく再設計:

- 影が効かないため、階層は面の明度差(`--bg` → `--bg-raised`)で作る
- 熾火は暗所で映えるよう彩度・明度を上げる(`#C63A1B` → `#EF6234`)
- accent 面上のテキストはダークでは白ではなく焦げ色(`#23100A`)にして眩しさを抑える

---

## 2. タイポグラフィ

| 役割 | トークン | スタック | 使いどころ |
|---|---|---|---|
| 見出し | `--font-display` | Shippori Mincho → Hiragino Mincho ProN → Yu Mincho → serif | ブランドの声。**25px(`--text-xl`)以上でのみ使う** — 小サイズの明朝は可読性が落ちる |
| 本文 | `--font-body` | Hiragino Kaku Gothic ProN → Noto Sans JP → sans-serif | 本文・UI 全般 |
| コード | `--font-mono` | SF Mono → Consolas → monospace | コード・トークン名 |

- 明朝は「宿の女将の声」、ゴシックは「フロントの案内」。見出しの明朝は控えめに使うほど効く。
- **価格・日付・室数など縦に並ぶ数字は必ず `font-variant-numeric: tabular-nums`**(書体は本文と同じ)。
- タイプスケールは 1.25 倍率(`--text-xs` 12px 〜 `--text-4xl` 49px)。恣意的な px 指定を散らさない。
- 本文は `line-height: var(--leading-body)`(1.7)・行長 65 字前後(`max-width: 65ch` 目安)。見出しは 1.3 + `text-wrap: balance`。
- カナ・英大文字のラベルは `letter-spacing: var(--tracking-label)`(0.08em)。

Web フォントを使える実装では見出しに **Shippori Mincho**、本文に **Noto Sans JP** を読み込むのが正。プロトタイプ(自己完結 HTML)ではシステムスタックのままでよい。

---

## 3. 余白・形・影・モーション

- **余白**: 4px 基数(`--space-1`〜`--space-24`)。兄弟間隔は親の flex/grid + `gap` で。margin 連打禁止。
- **角丸**: 建築的な直線がブランド。ボタン・入力 `--radius-xs`(2px)、カード `--radius-sm`(4px)、モーダル `--radius-md`(8px)。**pill(`--radius-pill`)はバッジのみ**。角丸を勝手に増やさない。
- **影**: ライトでは炭色の淡い影(`--shadow-1` / `--shadow-2`)。ダークでは影に頼らず面の明度差で階層を作る。
- **モーション**: `--duration-quick`(120ms、hover)/ `--duration-base`(200ms、開閉)/ `--duration-slow`(420ms、ページ遷移の1回だけの演出)。イージングは `--ease-out`。`prefers-reduced-motion: reduce` で transition/animation をほぼ 0 に落とす。

---

## 4. コンポーネント基本形

### ボタン

```css
.btn {
  font: 600 var(--text-md)/1 var(--font-body);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-xs);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background var(--duration-quick) var(--ease-out);
}
.btn:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }

.btn-primary   { background: var(--accent); color: var(--accent-ink); }
.btn-primary:hover { background: var(--accent-strong); }
.btn-secondary { background: transparent; color: var(--ink); border-color: var(--line); }
.btn-ghost     { background: transparent; color: var(--counter); }
.btn-ink       { background: var(--ink); color: var(--bg); } /* エラー文脈で primary の代役 */
```

- primary は 1 画面 1 つ。並べるときは secondary / ghost に落とす。
- フォーカスリングは水色(`--focus`)— 朱の CTA と混同しない。

### 入力

```css
.field input {
  background: var(--bg-sunken);
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  padding: var(--space-3) var(--space-4);
  color: var(--ink);
  font: var(--text-md)/1.4 var(--font-body);
}
.field input:focus-visible { outline: 2px solid var(--focus); outline-offset: 1px; }
.field input[aria-invalid="true"] { border-color: var(--danger); }
```

ラベルは上置き・`--text-sm`。エラーメッセージは「何が起きたか+どうすれば直るか」を `--danger` で。

### カード(客室)

```css
.room-card {
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-1);
  overflow: hidden;           /* サムネイルを角に合わせる */
}
.room-card .price { font-variant-numeric: tabular-nums; }
```

構造: サムネイル → 室名(明朝・`--text-xl`)→ 説明(`--ink-2`)→ 価格(右寄せ・tabular)+ バッジ。

### バッジ

```css
.badge {
  font: 600 var(--text-xs)/1 var(--font-body);
  letter-spacing: var(--tracking-label);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
}
/* 空室あり: success-soft/success  残り2室: warning-soft/warning
   満室: danger-soft/danger  サウナ付: counter-soft/counter */
```

状態は色だけでなく文言でも読めるようにする(色覚対応)。

---

## 5. Do / Don't

| Do | Don't |
|---|---|
| 朱(`--accent`)は 1 画面 1 主役。CTA か「本日の一室」のどちらかに | 朱を見出し・罫線・アイコンにまで散らす |
| エラー表示中は primary を `--ink` ボタンに落とす | `--danger` と `--accent` を同一視野に並べる |
| 明朝は `--text-xl`(25px)以上の見出しだけ | 本文・ラベルを明朝にする |
| 価格・日付は `tabular-nums` で桁を揃える | プロポーショナル数字のまま縦に並べる |
| ニュートラルは炭系トークンから取る | `#888` などの純グレーを直書きする |
| pill はバッジのみ、他は 2〜8px の角丸 | ボタンやカードを rounded-full にする |
| 色はすべてトークン経由で参照する | HEX 直書き・メディアクエリ内にコンポーネント色を書く |
| フォーカスリング(水色)を常に可視に | `outline: none` で消す |

---

## 6. 使い方

プロトタイプ・実装の HTML から読み込む:

```html
<link rel="stylesheet" href="tokens.css">
```

以降の `/design` 系ワークフローはこのファイル群(`hot-a-hotel/tokens.css`・本書)を既存デザインシステムとして優先的に参照すること。
