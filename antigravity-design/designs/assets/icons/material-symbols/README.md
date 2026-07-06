# Material Symbols(Google 公式アイコン)

Google 公式の [Material Symbols](https://fonts.google.com/icons)(スタイル: **Outlined**、24px、既定軸設定)の SVG をそのまま同梱したものです。**アイコンは自作せず、必ずこのセット(または同じ公式ソースから追加取得したもの)を使ってください。**

- 取得元(公式配信 URL): `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/<icon_name>/default/24px.svg`
- アイコン名の検索: https://fonts.google.com/icons
- ライセンス: [Apache License 2.0](https://github.com/google/material-design-icons/blob/master/LICENSE)(再配布可)

## 使い方

自己完結 HTML にはファイル内容をインラインで貼り込み、`fill="currentColor"` を付けて色をトークンで制御します:

```html
<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960"
     width="24" fill="currentColor" aria-hidden="true"><path d="…"/></svg>
```

## アイコンを追加するには

```bash
curl -sS -o designs/assets/icons/material-symbols/<name>.svg \
  "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/<name>/default/24px.svg"
```

塗りつぶし(FILL=1)版が必要な場合は URL の `default` を `fill1` に変えて `<name>-fill.svg` として保存します(選択状態の表現に使用)。
