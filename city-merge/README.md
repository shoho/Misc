# City Merge

2つの都市・国を入力すると、Google コンセプトストア風のミニチュア都市を融合した画像を生成するウェブアプリ。**Cloudflare Pages + Pages Functions** にデプロイして、API キーはサーバー側に隠します。

## 構成

| ファイル | 役割 |
|---|---|
| `index.html` / `style.css` / `script.js` | フロントエンド（依存ゼロ、ビルド不要） |
| `functions/api/generate.js` | Cloudflare Pages Functions（`/api/generate` に自動マウントされる）。`OPENAI_API_KEY` で OpenAI を呼ぶ |
| `package.json` | `wrangler` で local dev / deploy |
| `.dev.vars.example` | ローカル開発用の環境変数テンプレ |

フロントは `/api/generate` を叩くだけなので、キーは一切ブラウザに露出しません。

## クイックスタート（Makefile）

```bash
cd /Users/shoho/Development/Misc/city-merge
make setup        # npm install + .dev.vars 作成
# → .dev.vars を開いて OPENAI_API_KEY=sk-... を記入
make dev          # http://localhost:8788 で起動
```

全ターゲットは `make help` で確認できます:

| ターゲット | 用途 |
|---|---|
| `make setup` | 初回セットアップ（依存インストール + `.dev.vars` 雛形作成） |
| `make dev` | ローカル開発サーバー起動 |
| `make check` | 必要ファイル・依存・wrangler の状態を確認 |
| `make login` | Cloudflare に wrangler でログイン |
| `make project-create` | Cloudflare Pages プロジェクト作成 |
| `make secret` | 本番の `OPENAI_API_KEY` を登録 |
| `make deploy` | 本番デプロイ |
| `make tail` | 本番ログをリアルタイム表示 |
| `make bootstrap` | login → project 作成 → secret → deploy を一気に |
| `make clean` | `node_modules` と `.wrangler` を削除 |

OpenAI キーは [OpenAI Platform](https://platform.openai.com/api-keys) で発行してください。`gpt-image-2` を使うには組織の Verification が必要です。

## Cloudflare にデプロイ

### 方法 A: GitHub 連携（推奨・自動デプロイ）

1. このディレクトリを GitHub に push
2. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. リポジトリを選択
4. Build settings:
   - **Framework preset**: None
   - **Build command**: 空のまま
   - **Build output directory**: `/`
5. **Environment variables** を追加（Production と Preview 両方）:
   - `OPENAI_API_KEY = sk-...` (必須)
   - `APP_ACCESS_CODE = <任意の合言葉>` (任意。設定すると Generate にコード要求)
6. **Save and Deploy**

以後、main にpush するたび自動デプロイされます。`xxx.pages.dev` の URL が払い出されます。

### 方法 B: wrangler CLI で直接デプロイ（Makefile）

```bash
make bootstrap   # login → project 作成 → secret 登録 → deploy を順番に実行
```

または個別に:

```bash
make login
make project-create
make secret       # プロンプトで sk-... を貼り付け
make deploy
```

## 独自ドメインを当てる

Cloudflare Dashboard → Pages → プロジェクト → **Custom domains** から DNS で繋げます。Cloudflare でドメインを管理していれば数クリックで終わります。

## 運用上の注意

- **アクセスコード (`APP_ACCESS_CODE`)** を設定するのが最も簡単な濫用防止策です。コードを知っている人だけが Generate できる soft gate になります。プロンプトのプレビューは誰でも見られます。
- それでも追加の防御を入れたい場合:
  - Cloudflare の **Rate Limiting** ルール（Dashboard で IP 単位の制限を貼る、無料プランでも一定数まで使える）
  - **Cloudflare Access** で Google/Email 認証を前段に置く（無料で 50 ユーザーまで）
  - 簡易パスワードを Function 内でチェック（`X-App-Password` ヘッダ + env var）
- OpenAI 側でも **Usage limits** を月予算で必ず設定しておくこと。

## カスタマイズ

- **ブランドを追加**: `script.js` の `BRANDS` オブジェクトに `key: { label, storeName, logoDesc, paletteDesc }` を足すだけでプルダウンに自動追加される
- **プロンプトのベース文**: `script.js` の `buildPrompt()` 関数
- **都市の扱い**: 1つだけ入力 → 単一都市シーン、2つ入力 → 都市を融合したシーン
- **解像度**: `script.js` の `SIZE`（`1024x1024` / `1024x1536` / `1536x1024`）
- **モデル**: `functions/api/generate.js` の `gpt-image-2`
