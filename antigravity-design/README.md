# Antigravity Design

Google Antigravity で [Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs) 相当の体験を再現するためのキットです。自然言語で指示すると、エージェントが**デザインプランの提示 → 動くプロトタイプ(自己完結 HTML)の生成 → ブラウザでのセルフレビュー → 対話での改良 → 実装へのハンドオフ**まで行います。

Antigravity のネイティブなカスタマイズ機構(**Rules / Workflows / Skills**)だけで構成しているので、追加のツールやプラグインは不要です。

## 何ができるか(Claude Design との対応)

| Claude Design | このキット |
|---|---|
| プロンプトからプロトタイプ生成 | `/design` |
| 会話・コメントでの反復改良 | `/design-iterate` |
| コードベースからデザインシステム構築 | `/design-system` |
| スライド・資料の生成 | `/design-slides` |
| Claude Code へのハンドオフバンドル | `/design-handoff` |
| 常時適用されるデザイン品質基準 | `.agent/rules/design-principles.md` + `frontend-design` スキル |

出力は画像モックではなく、ブラウザでそのまま開ける本物の HTML/CSS/JS です。Antigravity のブラウザ統合を使って、エージェント自身がスクリーンショットを撮って見た目を検証してから納品します。

## デフォルトのデザインシステム(Google ブランド)

このキットには、**Google のカンパニーブランドを元にしたデザインシステムがデフォルトで同梱**されています。`/design` 系ワークフローは、別のブランドを指定しない限り自動的にこれに従います。

- `designs/tokens.css` — 全トークン(カラー・タイポグラフィ・シェイプ・エレベーション・モーション、ライト/ダーク両テーマ)
- `designs/design-system.md` — ガイドライン(トークンの使い方、コンポーネント基本形、Do/Don't、出典)
- `designs/design-system/index.html` — ブラウザで開けるスタイルガイド(テーマ切替付き)
- `designs/assets/icons/material-symbols/` — Google 公式 [Material Symbols](https://fonts.google.com/icons) の SVG 60種(アイコンは自作せずこれを使う)
- `designs/assets/fonts/` — [Roboto](https://fonts.google.com/specimen/Roboto) 可変フォント(公式配布物)

すべての値は Google の公式ソースのみから生成しています(ブランドカラーは [Partner Marketing Hub](https://partnermarketinghub.withgoogle.com/brands/google/overview/)、カラースキームは公式ライブラリ `@material/material-color-utilities`、構造トークンは公式パッケージ `@material/web` の Material 3 トークン)。出典の詳細は `designs/design-system.md` を参照してください。

自分のブランドに差し替えるには、`/design-system` を実行する(上記2ファイルが再生成されます)か、ファイルを直接編集します。

## セットアップ

方法は2つあります。

**A. 既存プロジェクトに組み込む(推奨)**

`.agent/` ディレクトリを、Antigravity で開いているワークスペースのルートにコピーします。

```bash
cp -r antigravity-design/.agent /path/to/your-project/
```

**B. このディレクトリ自体をワークスペースとして開く**

デザイン作業専用のワークスペースとして `antigravity-design/` を Antigravity で開けば、そのまま使えます。

> すべてのユーザー・全プロジェクトで使いたい場合は、ルールの内容をグローバルルール(`~/.gemini/AGENTS.md`)側に置くこともできますが、コンテキスト肥大を避けるためワークスペース単位での利用を推奨します。

## 使い方

Antigravity のエージェントチャットで `/` を入力すると、登録されたワークフローが候補に出ます。

### 1. `/design` — プロトタイプを作る

```
/design 個人開発者向けの家計簿アプリのダッシュボード。
月次サマリーとカテゴリ別支出、直近の取引一覧。落ち着いた信頼感のあるトーンで。
```

エージェントは次の順で動きます:

1. 題材・想定読者・ページの仕事を固定(不明点は妥当な仮定を置いて明記)
2. デザインプラン(パレット 4〜6色 / 書体ペア / レイアウトコンセプト)を提示
3. `designs/<スラッグ>/index.html` に自己完結 HTML を生成(ライト/ダーク両テーマ対応)
4. ブラウザで開いてスクリーンショットを撮り、崩れを自分で修正
5. 結果とファイルパスを報告

### 2. `/design-iterate` — 対話で磨く

```
/design-iterate ヘッダーが重い。もう少し軽く、数字を主役にして。
```

直近のデザイン(または指定したファイル)に対して、トークン単位で変更を加え、ビフォー/アフターを確認してから報告します。フィードバックに含まれない部分は勝手に作り直しません。

### 3. `/design-system` — コードベースや参照画像からデザインシステムを抽出

```
/design-system
```

`tailwind.config` やテーマファイル、既存コンポーネントのスタイルを読み取り、次の2ファイルを生成します:

- `designs/tokens.css` — 全トークンの CSS カスタムプロパティ定義(両テーマ)
- `designs/design-system.md` — トークン一覧・書体の意図・コンポーネント基本形・Do/Don't

**一度これを実行しておくと、以降の `/design` は自動的にあなたのプロジェクトの色・書体・コンポーネントに従います**(Claude Design のオンボーディングに相当)。

**スクリーンショットや Google Slides からも作れます。** コードベースが無くても(あるいは補完として)、`designs/references/` に画像や PDF を置けば、エージェントがそれを視覚的に分析して色・書体・角丸・余白の密度をトークンに起こします:

```bash
mkdir -p designs/references
# 既存プロダクトのスクショ、ブランドガイド PDF などを置く
```

Google Slides の場合は「ファイル → ダウンロード → PDF / PNG」で書き出して `designs/references/` に置くのが確実です。Antigravity に Google Drive の MCP 連携を設定している場合は、スライドの URL を渡して直接読ませることもできます。

なお、画像からの色・フォントは推定値になる(スクショの圧縮で色がぶれる、フォントは近い候補の提示になる)ため、エージェントは推定であることを明記して報告します。コードから取れた正確な値と食い違う場合はコードの値が優先されます。

### 4. `/design-slides` — デザインシステムに従ったスライドを生成

```
/design-slides 来期のプロダクト戦略説明資料。経営会議向け、10枚前後。
```

`/design-system` で抽出した原則(色・書体・レイアウトパターン)に従って、新しいスライドデッキを生成します。まず 16:9 の HTML デッキ(キー送り・印刷対応・発表者ノート付き)として作ってブラウザで検証し、求めれば `python-pptx` で **.pptx に書き出します**。.pptx を Google Drive にアップロードして Google Slides で開けば、編集可能なスライドとして使えます。

#### よくある使い方:既存の Google Slides テンプレートから新しいスライドを作る

```bash
# 1. テンプレートを読み込ませる
#    Google Slides で「ファイル → ダウンロード → PDF」して参照フォルダに置く
mkdir -p designs/references
mv ~/Downloads/company-template.pdf designs/references/
```

```
# 2. オンボーディング:テンプレートからデザイン原則を抽出
/design-system

# 3. 原則に従った新しいスライドを自然言語で生成
/design-slides 新機能リリースの社内向け発表資料。8枚。デモのスクショを入れる想定。
```

以降、`/design-slides` はテンプレートのトーン(色・書体・表紙/中扉/本文のレイアウトパターン)を自動で引き継ぎます。修正は `/design-iterate` で対話的にできます。

> **注意**: 元テンプレートのマスター/レイアウト機能をそのまま継承するのではなく、「見た目の原則を再現した新規デッキ」を作る方式です。Google Slides への直接書き込みには Slides API / Apps Script / Drive MCP の認証設定が別途必要なため、既定は .pptx 書き出し → Drive アップロードのルートです。

### 5. `/design-handoff` — 実装に渡す

```
/design-handoff
```

完成したプロトタイプを `designs/<スラッグ>/HANDOFF.md`(トークン・レイアウト構造・インタラクション仕様・アクセシビリティ要件・実装ノート)にまとめます。あとは実装エージェント(Claude Code でも Antigravity 自身でも)にひとこと渡すだけです:

```
designs/<スラッグ>/HANDOFF.md を読んで、この仕様どおりに実装して
```

## ディレクトリ構成

```
antigravity-design/
├── README.md                     ← このファイル
├── .agent/                       ← Antigravity が自動認識するディレクトリ
│   ├── rules/
│   │   └── design-principles.md  ← デザイン系タスクで自動適用される品質基準
│   ├── workflows/
│   │   ├── design.md             ← /design
│   │   ├── design-iterate.md     ← /design-iterate
│   │   ├── design-system.md      ← /design-system
│   │   ├── design-slides.md      ← /design-slides
│   │   └── design-handoff.md     ← /design-handoff
│   └── skills/
│       └── frontend-design/
│           └── SKILL.md          ← 実装フェーズ用の詳細デザインガイド
└── designs/                      ← 生成物の出力先(プロトタイプ・トークン・ハンドオフ)
    ├── tokens.css                ← デフォルト: Google ブランドのデザイントークン
    ├── design-system.md          ← デフォルト: ガイドライン(出典付き)
    ├── design-system/index.html  ← デフォルト: スタイルガイド(両テーマ)
    └── assets/                   ← 公式アイコン(Material Symbols)・公式フォント(Roboto)
```

- **Rules**(`trigger: model_decision`):デザイン関連のタスクだとエージェントが判断したときに自動で読み込まれる原則。常時読み込み(`always_on`)にしていないのは、デザイン以外の作業でコンテキストを圧迫しないためです。
- **Workflows**:チャットで `/` から呼び出す定型手順。
- **Skills**:ワークフローの実装フェーズで参照される詳細マニュアル(タイポグラフィ、両テーマの実装パターン、品質チェックリストなど)。

## カスタマイズのヒント

- **ブランドが決まっている場合**:`designs/tokens.css` と `designs/design-system.md` を手で書いて置いておけば、`/design-system` を実行しなくても `/design` がそれを優先して使います。
- **品質基準を変えたい**:`.agent/rules/design-principles.md` を編集します(例:社内で Inter 指定ならば「AI っぽい定番を避ける」の該当行を削除)。
- **手順を変えたい**:各ワークフローの Markdown は単なる手順書なので、出力先ディレクトリや報告フォーマットは自由に書き換えられます。
- **常時適用にしたい**:ルールのフロントマターを `trigger: always_on` に変えれば全タスクで強制されます(コンテキスト消費は増えます)。

## 制約・注意

- 生成されるプロトタイプは意図的に**自己完結(CDN・外部フォント非依存)**です。オフラインで開け、フォントのサイレントフォールバックを避けるためです。実装時に webfont を使うのは自由です。
- ブラウザ検証は Antigravity のブラウザ統合(Chrome 連携)を前提にしています。使えない環境ではエージェントがスクリーンショット確認をスキップするので、生成された HTML を自分で開いて確認してください。
- Antigravity の Rules / Workflows の仕様は [公式ドキュメント](https://antigravity.google/docs/rules-workflows) を参照してください。
