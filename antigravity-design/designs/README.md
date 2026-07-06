designs/ は /design 系ワークフローの出力先です。生成されたプロトタイプ・トークン・ハンドオフがここに置かれます。

デフォルトで Google ブランドのデザインシステムが同梱されています:

- `tokens.css` — 全デザイントークン(ライト/ダーク両テーマ)
- `design-system.md` — ガイドラインと出典
- `design-system/index.html` — スタイルガイド(ブラウザでそのまま開けます)
- `assets/icons/material-symbols/` — Google 公式 Material Symbols の SVG(アイコンは自作せずこれを使う)
- `assets/fonts/` — Roboto 可変フォント(Google Fonts 公式配布物)

`/design` はこのシステムに自動的に従います。別ブランドに差し替えるには `/design-system` を実行するか、上記ファイルを直接編集してください。
