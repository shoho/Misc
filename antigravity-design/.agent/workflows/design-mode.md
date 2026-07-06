---
description: デザイン系ワークフローの厳格度を切り替える(flex=自由度優先・既定 / strict=数値基準を逸脱不可にする・中位モデル向け)
---

# /design-mode — 厳格度の切り替え

デザイン系ワークフロー(`/design` `/design-iterate` `/design-system` `/design-slides`)の厳格度を切り替える。状態は `designs/.design-mode` ファイル1つで管理する。

| モード | 意味 | 向いている場面 |
|---|---|---|
| `flex`(既定) | 数値基準は「良い既定値」。理由を1行明記すれば逸脱可 | 上位モデルで使う。デザインの上振れを狙う |
| `strict` | 数値基準は逸脱不可。迷ったら控えめな標準を選ぶ | 中位モデル(Flash 級)で使う。出力の分散を抑えたい・複数回の生成で一貫性が欲しい |

## 手順

1. **引数なし(`/design-mode`)** — `designs/.design-mode` を読み、現在のモードを報告する。ファイルが無ければ「flex(既定)」。
2. **`/design-mode strict`** — `designs/.design-mode` に `strict` とだけ書き込む。「以降のデザイン系ワークフローは `.agent/rules/design-strict.md` の制約を逸脱不可として適用する」と報告する。
3. **`/design-mode flex`** — `designs/.design-mode` に `flex` とだけ書き込む(またはファイルを削除する)。「数値基準は既定値扱いに戻り、理由明記つきの逸脱が許可される」と報告する。

## 補足

- モードはワークスペース単位で永続する(ファイルなので Git にコミットすれば共有できる)。
- 常に strict で運用したい場合は、`.agent/rules/design-strict.md` のフロントマターを `trigger: always_on` に変えれば、モードファイルなしで全タスクに強制できる。
