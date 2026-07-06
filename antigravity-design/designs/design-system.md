# Google ブランド デザインシステム(デフォルト)

このキットにデフォルトで同梱されている、**Google のカンパニーブランドを元にしたデザインシステム**です。`/design` 系ワークフローは、ユーザーが別のブランドを指定しない限りこのシステムに従います。自分のブランドに差し替えたい場合は `/design-system` を実行するか、`tokens.css` とこのファイルを書き換えてください。

すべての値は **Google の公式ソースのみ**から生成しています(推定値なし):

| 領域 | 公式ソース |
|---|---|
| ブランドカラー 4色 | [Google Partner Marketing Hub](https://partnermarketinghub.withgoogle.com/brands/google/overview/)(Blue `#4285F4` / Red `#EA4335` / Yellow `#FBBC04` / Green `#34A853`) |
| カラーロール(light/dark) | 上記ブランドカラーをソースに、Google 公式ライブラリ [`@material/material-color-utilities`](https://www.npmjs.com/package/@material/material-color-utilities)(HCT。[Material Theme Builder](https://m3.material.io/theme-builder) と同一アルゴリズム)で生成。バリアント `SchemeVibrant`、コントラスト標準 |
| タイポグラフィ・シェイプ・ステート・エレベーション・モーション | Google 公式 npm パッケージ [`@material/web`](https://www.npmjs.com/package/@material/web) の [Material 3](https://m3.material.io/) トークン(Design system version **v0.192**) |
| 書体 | [Roboto](https://fonts.google.com/specimen/Roboto)(Google Fonts 公式配布。可変フォント woff2 を `assets/fonts/` に同梱) |
| アイコン | [Material Symbols](https://fonts.google.com/icons)(Google 公式。SVG を `assets/icons/material-symbols/` に同梱。**自作アイコン禁止**) |

## 1. カラー

### 1-1. ブランド参照トークン(そのままの Google カラー)

```css
--google-blue:   #4285F4;
--google-red:    #EA4335;
--google-yellow: #FBBC04;
--google-green:  #34A853;
```

**用途を限定する。** この4色は彩度が高く、白テキストとのコントラストが不足するものもある(Yellow は特に)。ロゴ周り・イラスト・データビジュアライゼーション・「ブランドモーメント」(ヒーローのアクセント等)にのみ使い、ボタン・リンク・テキストなど UI の機能色には次の M3 カラーロールを使う。

### 1-2. Material 3 カラーロール

Google Blue をソースカラーとして生成した、コントラスト保証済みのロールセット。**背景色には必ず対になる `on-*` を組み合わせる**(例: `primary` の上のテキストは `on-primary`)。主要ロール:

| ロール | Light | Dark | 用途 |
|---|---|---|---|
| `primary` / `on-primary` | `#005ac1` / `#ffffff` | `#adc6ff` / `#002e69` | 主ボタン、アクティブ状態、リンク |
| `primary-container` / `on-primary-container` | `#d8e2ff` / `#001a41` | `#004494` / `#d8e2ff` | 強調カード、選択チップ |
| `secondary` 系 | `#595c7e` … | `#c1c4eb` … | 補助ボタン、フィルタチップ |
| `tertiary` 系 | `#625789` … | `#ccbff8` … | 対比が欲しい第三のアクセント |
| `surface` / `on-surface` | `#f9f9ff` / `#181c25` | `#0f131c` / `#dfe2ef` | ページ地・カード地/本文 |
| `surface-container-lowest`→`highest` | `#ffffff`→`#dfe2ef` の5段 | `#0a0e17`→`#31353f` の5段 | 面の階層(影の代わりに使える) |
| `surface-variant` / `on-surface-variant` | `#dee2f2` / `#424753` | `#424753` / `#c2c6d6` | 控えめな面/補助テキスト |
| `outline` / `outline-variant` | `#727785` / `#c2c6d6` | `#8c909f` / `#424753` | 枠線/罫線 |
| `error` 系 | `#ba1a1a` … | `#ffb4ab` … | エラー(M3 標準) |
| `inverse-surface` / `inverse-on-surface` | `#2c303a` / `#eef0fd` | `#dfe2ef` / `#2c303a` | スナックバー等の反転面 |

(全ロールの正確な値は `tokens.css` を参照。ここに無いロールも定義済み)

### 1-3. セマンティックカラー

アクセント色とは別枠で使う。success / warning は Google Green / Yellow をシードに同じ公式アルゴリズムで生成したカスタムカラー(コントラスト保証済み)、エラーは M3 標準の `error` ロール:

```css
--md-sys-color-success: …;  --md-sys-color-on-success: …;
--md-sys-color-success-container: …;  --md-sys-color-on-success-container: …;
--md-sys-color-warning: …;  /* 同様に4点セット */
--md-sys-color-error: …;    /* M3 標準 */
```

### 1-4. Do / Don't

- **Do**: 面の階層は `surface-container-*` 5段で作る(ダークでは影より面色の差が効く)
- **Do**: 状態変化はステートレイヤーで表現(hover 8% / focus 12% / pressed 12% / dragged 16% を `currentColor` で重ねる)
- **Don't**: `--google-yellow` の上に白テキストを置かない(コントラスト不足)
- **Don't**: ブランド4色を大面積の背景に使わない(Google 製品の UI はニュートラルな surface が基調)
- **Don't**: `on-*` を対応しない背景に流用しない

## 2. タイポグラフィ

書体は **Roboto**(M3 の公式既定書体)。見出し(brand)・本文(plain)とも Roboto を使う。Google 専用書体 Google Sans は一般配布されていないため使わない。日本語は Noto Sans JP →システムゴシックへフォールバック(スタックは `tokens.css` 定義済み)。

Material 3 タイプスケール(v0.192)を使う。主要スタイル:

| スタイル | サイズ/行間 | ウェイト | 用途 |
|---|---|---|---|
| Display Large | 57px / 64px | 400 | ヒーローの主見出し |
| Headline Medium | 28px / 36px | 400 | セクション見出し |
| Title Large | 22px / 28px | 400 | カード・ダイアログの見出し |
| Title Medium | 16px / 24px | 500 | リスト項目の見出し |
| Body Large | 16px / 24px | 400 | 本文(既定) |
| Body Medium | 14px / 20px | 400 | 二次的な本文 |
| Label Large | 14px / 20px | 500 | ボタン・タブのラベル |
| Label Medium | 12px / 16px | 500 | チップ・バッジ |

- 各スタイルは `--md-sys-typescale-<style>-{font,size,line-height,tracking,weight}` の5点セットで参照する
- M3 の見出しはウェイト 400 が基本。**太字で殴らない**。強調は Medium(500)まで
- 数字が縦に並ぶ場所は `font-variant-numeric: tabular-nums`

## 3. シェイプ(角丸)

```
none 0 / extra-small 4px / small 8px / medium 12px / large 16px / extra-large 28px / full(ピル)
```

目安: チップ=small、カード・テキストフィールド=medium〜large、ダイアログ・ボトムシート=extra-large、ボタン・FAB・検索バー=full(ピル)。**全要素を同じ角丸にしない**(サイズに応じて段階を変えるのが M3 流)。

## 4. エレベーション

`--md-sys-elevation-level0`〜`level5` を box-shadow として定義済み(key 30% + ambient 15% の2層、`@material/web` と同値)。カード=level1、メニュー・FAB=level3、ダイアログ=level3〜、ナビゲーションバー=level2。ダークテーマでは影が見えにくいので、**`surface-container-*` の面色差を併用**する。

## 5. スペーシング・レイアウト

- **4dp グリッド**: 余白・サイズはすべて 4px の倍数(`--space-1`〜`--space-16` 定義済み)。基本パディングは 16px、セクション間は 24〜64px
- **ウィンドウサイズクラス**(ブレークポイント): compact < 600px / medium 600–839px / expanded 840–1199px / large 1200–1599px / extra-large ≥ 1600px
- タッチターゲットは最小 **48×48px**
- レイアウトは flex/grid + gap で組む(design-principles.md 参照)

## 6. モーション

- 標準トランジション: `--md-sys-motion-easing-standard` × `--md-sys-motion-duration-short4`(200ms)
- 画面遷移・大きな移動: `easing-emphasized` × `duration-medium2`(300ms)〜 `long2`(500ms)
- `prefers-reduced-motion: reduce` を必ず尊重する

## 7. アイコン — Material Symbols(自作禁止)

アイコンは必ず **Google 公式の Material Symbols** を使う。手描き SVG・絵文字・他のアイコンセットは使わない。

### 使い方 A: 同梱 SVG をインライン展開(自己完結 HTML 向け・推奨)

`assets/icons/material-symbols/` に主要 60 個の公式 SVG(Outlined・24px)を同梱済み。プロトタイプにはファイル内容をそのままインラインで貼り込み、色は `fill="currentColor"` を付けてトークンで制御する:

```html
<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960"
     width="24" fill="currentColor" aria-hidden="true"><path d="…"/></svg>
```

同梱していないアイコンが必要な場合は、公式配信 URL から取得して同フォルダに追加する:

```
https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/<icon_name>/default/24px.svg
```

アイコン名は https://fonts.google.com/icons で検索できる(スタイルは Outlined に統一)。

### 使い方 B: 可変フォント(オンライン前提の実装向け)

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
<span class="material-symbols-outlined">home</span>
```

- スタイルは **Outlined** に統一(Rounded / Sharp を混ぜない)
- 選択状態は `FILL` 軸(0→1)で表現する
- 装飾でないアイコンには `aria-hidden="true"`、意味を持つ場合は代替テキストを付ける

## 8. コンポーネント基本形

すべてトークン経由で色・形を参照する。代表パターン:

**ボタン(Filled)**: 高さ40px / パディング横24px / `corner-full` / `label-large` / 地 `primary`・文字 `on-primary`。ホバーで `on-primary` 8% のステートレイヤー+`elevation-level1`。
**ボタン(Outlined)**: 枠 1px `outline` / 文字 `primary` / 地は透明。
**ボタン(Text)**: 文字 `primary` のみ。並列アクションの低強調用。
**テキストフィールド(Outlined)**: 枠 `outline`・`corner-extra-small`、フォーカスで枠 2px `primary`。ラベルは `body-small` で枠線上に浮かせる。
**カード**: 地 `surface-container-low`(Elevated)+ `elevation-level1`、または枠 `outline-variant`(Outlined)。角丸 `corner-medium`。パディング16px。
**チップ**: 高さ32px / `corner-small` / `label-large`。選択時は地 `secondary-container`・文字 `on-secondary-container` + チェックアイコン。
**スナックバー**: 地 `inverse-surface`・文字 `inverse-on-surface`・アクション `inverse-primary`、`corner-extra-small`、`elevation-level3`。
**ナビゲーションバー**: 地 `surface-container`、アクティブ項目はアイコンを `secondary-container` のピルで包み、`FILL=1` のアイコン+`on-surface` のラベル。

## 9. テーマ実装ルール

- `tokens.css` は `:root`(ライト)/ `@media (prefers-color-scheme: dark)` / `:root[data-theme="dark"]` / `:root[data-theme="light"]` の4段構成。**コンポーネントは必ずトークン経由で色を参照**し、テーマ切替はトークン差し替えだけで成立させる
- 自己完結 HTML に埋め込む場合は `tokens.css` の内容をそのまま `<style>` にコピーする(`@font-face` は同梱 woff2 への相対パスなので、単一ファイル化する場合はその節を削除してシステムフォールバックに任せるか、woff2 を data URI 化する)

## 10. ライセンス・商標に関する注意

- Roboto は [SIL Open Font License](https://fonts.google.com/specimen/Roboto/license)、Material Symbols は [Apache License 2.0](https://fonts.google.com/icons)(いずれも同梱・再配布可)
- **Google ロゴ・"G" マーク等の商標アセットはこのキットに含めない**。ブランドカラーとデザイン言語(Material 3)の利用と、Google ブランドを名乗ること・ロゴ使用は別問題。Google ブランドの表示が必要な場合は [Partner Marketing Hub のガイドライン](https://partnermarketinghub.withgoogle.com/)に従うこと
