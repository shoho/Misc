# NOT A HOTEL — Design System(推定復元版)

> 世界中にあなたの家を / YOUR HOME ANYWHERE

実在ブランド [NOT A HOTEL](https://notahotel.com/) のビジュアルアイデンティティを、デザイントークンとして再構成したもの。UI は黒・白・グレーに徹し(色は写真が持ち込む)、角丸ゼロ・影ゼロ・大文字トラッキングが規律。

| ファイル | 内容 |
|---|---|
| [`tokens.css`](./tokens.css) | 全トークンの CSS カスタムプロパティ(ライト/ダーク両テーマ、4段構成) |
| [`design-system.md`](./design-system.md) | ブランドの規律・トークンの意図・コンポーネント基本形・Do/Don't |
| [`index.html`](./index.html) | スタイルガイド(ブラウザでそのまま開ける。テーマトグル付き) |

**注意**: 公式サイト・ブランドガイドの一次情報に到達できない環境で作成したため、HEX 値・書体名は推定。正値が手に入ったら `tokens.css` を差し替えるだけで全体に反映される。

`antigravity-design` の `/design` 系ワークフローから使う場合は、このディレクトリの `tokens.css` と `design-system.md` を既存デザインシステムとして参照させる。
