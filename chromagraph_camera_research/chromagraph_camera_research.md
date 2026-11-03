# Chromagraph Camera 調査レポート

> 調査日: 2026年11月3日
> 対象: Chromagraph Camera（iOS）バージョン 1.2.1 時点
> 販売元: Chromatic Applications LLC
> 公式サイト: https://chromaticapplications.com/chromagraph/chromagraph

改訂履歴
- 2026-11-03 初版
- 2026-11-03 レビュー指摘 #12 を反映（未確認事項の確度を統一。「未対応」「不可」を利用者報告と区別）

---

## 1. エグゼクティブサマリー

Chromagraph Camera は、撮影監督 Steve Yedlin（ASC）、映画監督 Rian Johnson、カラーサイエンス・プログラマー Eric Cameron の3人が開発した iPhone 専用の静止画カメラアプリである。『Knives Out』シリーズで使われている Yedlin のカラーパイプラインを、iPhone のセンサー RAW に対して直接適用する。

最大の特徴は「フィルターではなく、別のプロセス」という設計思想にある。一般的なシネマティック系アプリが Apple の処理済み画像に LUT を重ねるのに対し、本アプリは Apple の画像処理（look management）を完全に迂回し、RAW から独自に画を構築する。結果として、ハイライトの転び方、色の分離、グレインとハレーションの質感が、映画のポストプロダクションで設計された通りに得られる。

一方で、設計思想に由来する制約も明確である。撮影時にルックのプレビューが見えない、シャープニングを行わない、解像度が 12MP に留まる、静止画のみ、英語のみ、といった点は、ユーザーレビューで繰り返し指摘されている。

| 項目 | 内容 |
|---|---|
| 価格 | 2,000円（日本）/ 12.99ドル（米）/ 14.99ユーロ（EU）。買い切り、サブスクなし、アプリ内課金なし |
| 対応 OS | iOS 17.0 以降 |
| 対応デバイス | iPhone のみ |
| アプリサイズ | 約 28.9〜29.7 MB |
| 言語 | 英語のみ |
| 年齢制限 | 4+ |
| カテゴリ | 写真/ビデオ |
| 最新版 | 1.2.1（2026年11月初旬） |
| プライバシー | 個人情報を収集・保持しない（公式） |
| 評価 | 日本 4.2（19件）/ 米 4.5〜4.8（29〜136件、時点により変動） |
| ランキング | 日米ともに「写真/ビデオ」有料カテゴリ 1位（2026年10月末〜11月初旬） |

---

## 2. 開発の経緯と関係者

### 2.1 関係者

| 人物 | 役割 | 補足 |
|---|---|---|
| Steve Yedlin, ASC | 撮影監督。カラー・テクスチャレンダリングの設計 | Rian Johnson の全長編作品で撮影監督を務める。2015年「Display Prep Demo」、2016年「On Color Science」で知られる色彩科学の実践者 |
| Rian Johnson | 映画監督。企画の発案者 | 『Knives Out』『Glass Onion』『The Last Jedi』などの監督。自分用の「理想の iPhone カメラ」として Yedlin に制作を依頼 |
| Eric Cameron | カラーサイエンス・プログラマー / 開発者 | 経歴の詳細は公開情報に乏しい。報道では「color science coder」「color science developer」と紹介 |

### 2.2 経緯

- Johnson は iPhone で日常的に多くの写真を撮っており、サードパーティのカメラアプリをいくつも試した末に「elegant one-stop-shop」が欲しいと考えた。
- Johnson が Yedlin を「badgered（しつこく頼んだ）」形で、当初は3人の個人用として開発が始まった。
- その後、一般販売に切り替え、2026年10月20日〜22日ごろに App Store へ静かに公開された（公開日は資料により 10月20日 / 10月22日と揺れがある）。
- 2026年10月28日（水）に Johnson が X で発表。投稿は1日で約600万ビューに達し、米 App Store の「写真/ビデオ」有料カテゴリで1位になった。
- Yedlin 自身も X と Instagram で「Fellow photo nerds, I've partnered with dear friends @rianjohnson and Eric Cameron to make a bespoke iPhone still camera app」と告知している。

---

## 3. 公式サイトの記述（原文ベース）

公式ページは以下の6セクションで構成されている。

### 3.1 冒頭のキャッチ

> Replace your phone camera's default processing with bespoke, curated color and texture rendering designed by cinematographer Steve Yedlin and used on the Knives Out films

スマートフォンのカメラの標準処理を、Yedlin が設計し『Knives Out』シリーズで使われた特注の色・テクスチャレンダリングに置き換える、という位置づけ。

### 3.2 The process

> Chromagraph starts from raw sensor data and builds the image its own way: not a filter laid over the usual look processing, but a different process from the start.

センサーの RAW データから出発し、独自の方法で画像を構築する。通常のルック処理の上に重ねるフィルターではなく、最初から別のプロセスである。

### 3.3 Shoot first, see the look after

> As with a film camera, you frame through the viewfinder and see the finished look only after the image is processed. Take the picture, then open the gallery to see it with the Chromagraph look applied.

フィルムカメラと同様に、ファインダーでは構図のみを決め、仕上がりのルックは処理後にギャラリーで初めて見る。撮影時にルックが見えないのは意図的な仕様である。

### 3.4 Adjust without losing the look

> Intuitive yet powerful tools for color, tone, and texture give you real control while keeping every image true to the look that's the core of the app.

色・トーン・テクスチャの調整ツールを提供しつつ、すべての画像をアプリの核であるルックに忠実に保つ。「ルックの範囲内での調整」という思想が明示されている。

### 3.5 A gallery that keeps the originals

> Store full-quality raw files and view them in the app with the look applied live, along with any adjustments you make. Export smaller files to share with friends or save to your photo library, or turn on auto-export in Preferences to send every photo to your library right away as a JPEG or HEIC with the look applied.

- フル画質の RAW をアプリ内に保存
- ルックと調整をライブ適用して閲覧（非破壊）
- 共有用に縮小ファイルを書き出し、または写真ライブラリへ保存
- Preferences の auto-export を有効にすると、撮影ごとにルック適用済み JPEG / HEIC が即座にライブラリへ送られる

### 3.6 Not a filter

> A filter sits on top of the processing your phone has already done. Chromagraph skips that processing and uses its own methods for the curated look preferred by director Rian Johnson and cinematographer Steve Yedlin.

フィルターは端末が既に行った処理の上に乗る。Chromagraph はその処理を飛ばし、Johnson と Yedlin が好むキュレーションされたルックのために独自手法を使う。

### 3.7 Privacy

> Chromagraph does not collect or retain personal information.

個人情報を収集も保持もしない。

### 3.8 公式ページに書かれていないこと

- マルチ露光合成、シーンリニア、解像度、対応レンズ、グレイン・ハレーションといった具体的な技術用語は公式ページにはない。これらは App Store のスクリーンショット、Yedlin の声明、ユーザーレビューが出所である。
- ルックのプリセット一覧や FAQ も存在しない。公式が提示するのは「Johnson と Yedlin が好む curated look」という単一のルックと読むのが自然で、複数プリセットの存在は確認できなかった。

---

## 4. 仕様詳細

### 4.1 撮影（カメラ側）

| 機能 | 内容 | 出所 |
|---|---|---|
| 入力 | センサー RAW データ | 公式サイト |
| マルチ露光合成 | 複数露光を合成し、シャドウをクリーンに保ちつつハイライトの余裕を広げる。App Store スクリーンショットでは「Low Noise, Better Highlights」「With multi-exposure merged... shadows stay cleaner... open」と訴求 | App Store スクリーンショット |
| 既定露出 | ハイライト重視（highlight weighted）の露出。レビューで高評価 | App Store レビュー |
| レンズ切替 | 0.5x / 1x / 2x など、スクリーンショットの UI で確認。既定レンズをカスタマイズ可能（1.2.0） | スクリーンショット、リリースノート |
| マクロモード | オン/オフ切替可能（1.2.0） | リリースノート |
| 前面カメラ | 対応。ミラーモードあり（1.2.0） | リリースノート |
| モノクロ | 撮影前にカメラ側で切替可能。編集時の切替は「できない」とする利用者報告あり（バージョン不明、未確認） | App Store レビュー（利用者報告） |
| プレビュー | ファインダーは未処理のライブ映像。ルックは表示されない | 公式サイト |
| 解像度 | 12MP（4032×3024）。iPhone 17 Pro でも 48MP RAW は使えないとする利用者報告（バージョン不明） | App Store レビュー（利用者報告） |
| 動画 | 非対応 | 複数の報道 |

### 4.2 処理パイプライン

| 項目 | 内容 |
|---|---|
| 基本方針 | Apple の look management を完全に迂回し、Yedlin が映画で使う独自の数学的変換を Apple のカメラ挙動に合わせて適用 |
| 省略される処理 | Apple 標準のオーバーシャープニング、ノイズリダクション（Baidu Baike の記述。二次情報） |
| 原本の形式 | フル画質のシーンリニア（scene-linear）な原本をギャラリーに保持（Newsshooter に掲載の Yedlin 声明） |
| ルックの性質 | 「opinionated（主張のある）」で特定の美学に基づく。ニュートラルな再現は目指さない |
| 構成要素 | トーナリティ（tonality）、クロマティシティ（chromaticity）のレンダリング、グレイン、ハレーション |

### 4.3 編集（ギャラリー側）

| 機能 | 内容 | 備考 |
|---|---|---|
| 露出 | 調整可能 | |
| カラー | カラートランスフォームのカーブを含む | |
| トーン | 調整可能 | |
| テクスチャ | 調整可能 | |
| グレイン | フィルムグレイン。レビューで「very nice grain effect」 | |
| ハレーション | 報道では「調整可能」、利用者報告では「量の調整ができない」とされ、食い違う。バージョン差か、UI の範囲の解釈差の可能性 | **未確認（情報が食い違う）**。本レポートの他の箇所でも「未対応」とは断定しない |
| クロップ | Flip / Flop ツールあり（1.2.0） | |
| 非破壊 | 原本に対してルックと調整をライブ適用 | |
| 利用者が「無い」と報告している機能 | マスク、編集時のモノクロ切替、ホワイトバランス固定、シャープニング。いずれも利用者報告（バージョン不明）で、公式記述ではない | 未確認 |

### 4.4 書き出し・保存

| 項目 | 内容 |
|---|---|
| 書き出し形式 | JPEG または HEIC（ルック適用済み） |
| 自動書き出し | Preferences の auto-export で撮影ごとに写真ライブラリへ即時保存 |
| サイズ | Export Size 設定あり（1.2.0 で改善）。共有用に縮小ファイルを書き出せる |
| 原本 | アプリ内に RAW を保持。写真ライブラリには書き出さない |
| アーカイブ | エクスポート / インポート機能（1.2.0）。原本と編集をまとめて移動できると推定 |

### 4.5 その他

| 項目 | 内容 |
|---|---|
| アプリアイコン | グレースケール版を選択可能（1.2.0） |
| ファミリー共有 | 対応（最大6名） |
| アクセシビリティ | 開発者による対応機能の表示なし（日本の App Store） |

---

## 5. バージョン履歴

| バージョン | 時期 | 内容 |
|---|---|---|
| 1.1.3 | 2026年10月 | iPhone Duo 対応（chromagraph.lol の記載。詳細不明） |
| 1.2.0 | 2026年11月初旬 | アーカイブのエクスポート / インポート、既定レンズのカスタマイズ、グレースケールアイコン、前面カメラのミラーモード、クロップエディタの Flip/Flop、Export Size 設定の改善、マクロモードのオフ、複数のクラッシュ修正 |
| 1.2.1 | 2026年11月初旬（日本の App Store で「1日前」） | 特定の端末で一時的な写真を編集した際にエディタ UI が右にずれる不具合の修正 |

---

## 6. 技術的背景: Yedlin の色彩科学

本アプリの技術的意義を理解するには、Yedlin が公開してきた資料の文脈が必要である。

### 6.1 Display Prep Demo（2015年、2019年改訂）

- フィルムとデジタルの比較デモ。デジタルカメラの映像に Yedlin が設計した変換を適用し、フィルムの出力と見分けがつかないことを示した。
- 全ショットに同一の数学的変換を適用し、ショットごとの調整は行っていない。仕上げでの微調整は全体のカラーバランスと輝度バランスに限られる。
- ASC（American Society of Cinematographers）は「Unique Take on Image Prep」として取り上げた。

### 6.2 On Color Science（2016年）

- Display Prep Demo の理論的背景を説明した文書。
- 中心的な主張は「ルックはカメラではなく、表示用変換（display prep）の設計で決まる」というもの。同じカメラでも display prep 次第で大きく異なって見え、異なるカメラでも display prep 次第でほぼ同じに見える。
- フィルムエミュレーションは「意図的に狭い試み」であり、display prep を芸術的選択として扱うことにより広い可能性がある、と位置づけている。
- フィルムの色応答を再現するには、単純な調整ではなく3次元色空間全体の操作が必要である（第三者の要約）。

### 6.3 Chromagraph への接続

- 「iPhone の look management を迂回し、映画と同じ数学を Apple のカメラ挙動に合わせて適用する」という説明は、On Color Science の主張をスマートフォンに持ち込んだものと言える。
- Yedlin は「どんな画像も現実の文字通りの再現ではなく解釈である」という立場を取り、アプリのルックを意識的に「opinionated」で特定的なものにしている。
- グレインとハレーションについては、フィルムから取り除くより、デジタルに加える方が容易という持論がある（Wikipedia の記述）。
- 同時に Yedlin は「iPhone は独自処理を施しても根本的に制約のあるデバイス」とも述べている。

---

## 7. 技術的利点

1. **ポストプロダクションで検証済みの変換を撮影段階で適用できる**
   『Knives Out』シリーズの仕上げで使われている色変換と同系統の処理が、撮影直後の画に乗る。LUT を後がけするアプリと異なり、Apple のトーンマッピングやノイズ処理の痕跡が残らない。

2. **RAW 起点によるハイライトと色分離の設計自由度**
   Apple の処理済み画像は既にトーンマッピングされ、ハイライトは圧縮されている。RAW から処理することで、ハイライトの転び方や彩度の落ち方を映画的に設計できる。

3. **マルチ露光合成による低ノイズ・広ダイナミックレンジ**
   複数露光を合成し、シャドウのノイズを抑えつつハイライトの余裕を確保する。レビューで「ハイライト重視の既定露出が優秀」と評価されている。

4. **非破壊・シーンリニアな原本保持**
   フル画質の原本をアプリ内に保持し、ルックと編集をライブ適用する。将来の編集やアルゴリズム更新にも原本から再現像できる構造。

5. **ルックの一貫性**
   編集ツールは「ルックの核を保ったまま」調整する設計で、Yedlin の表現では「かなり大胆な調整をしてもコアのルックの範囲内に収まる」。パラメータを触っても破綻しにくい。

6. **シンプルな価格とプライバシー**
   買い切り、サブスクなし、アプリ内課金なし、データ収集なし。Halide Mark III（年額 19.99ドル、または買い切り 59.99ドル）と比べて導入コストが低い。

---

## 8. 制約と課題

| 制約 | 詳細 | 性質 |
|---|---|---|
| プレビューなし | 撮影時にルックが見えない。日本語レビューでも最大の不満点 | 設計思想（意図的） |
| シャープニングなし | RAW 由来の未シャープな画で「眠い」「ディテールが足りない」との指摘が最多。要望も最多 | 利用者報告（複数）。設計思想と推測 |
| 12MP 止まり | iPhone 17 Pro でも 4032×3024 とする利用者報告 | 利用者報告。技術的制約の可能性（third-party の Bayer RAW が 12MP に制限されるという情報あり） |
| 静止画のみ | 動画非対応。Johnson は将来の可能性に言及しつつ、新しい Pro 機種が必要になるだろうと述べたと報じられる | ロードマップ |
| 編集 UI | AppleInsider は「Halide ほど便利ではない」と評価。「他の写真アプリほど直感的ではない」との声も | UX |
| 利用者報告で「無い」とされる機能 | マスク、ハレーション量の調整、編集時のモノクロ切替、ホワイトバランス固定。いずれも利用者報告（バージョン不明）。ハレーション量については報道と食い違う（§4.3） | 未確認 |
| 英語のみ | 日本語ローカライズなし | ローカライズ |
| 単一ルック | 複数プリセットの存在は資料から確認できない（アプリ内は未確認）。Yedlin の美学に合わない人には向かない | 推定 |
| 撮影後の挙動 | 写真確認後に自動で背面カメラへ戻る、との報告 | 細かい UX |

---

## 9. 競合との比較: Halide Mark III

| 観点 | Chromagraph Camera | Halide Mark III（Lux） |
|---|---|---|
| 位置づけ | 特定の映画的ルックを固定の色体系で得る道具 | Looks 機能を一要素として持つ汎用プロカメラ |
| ルック | 単一の curated look。opinionated | 複数の Looks。「iPhone 標準より控えめ」とされ、Default は Apple の処理に近い |
| 手動制御 | 最小限。点と撮りに近い | マニュアルフォーカス等、豊富 |
| 編集 | ルック範囲内の調整 | 内蔵エディタ、広い調整幅 |
| 価格 | 2,000円 買い切り | 年額 19.99ドル または 買い切り 59.99ドル。1週間の試用あり |
| 推奨対象 | Yedlin / Johnson のルックそのものが欲しい人 | 汎用性と手動制御を求める人 |

AppleInsider の結論は「多くの制御を求めるなら Halide を引き続き推奨」。tutkit（独語）の整理では、Chromagraph は「RAW を固定の色体系で変換するルック専用ツール」、Halide は「Looks がオプションの一つに過ぎない幅広いアプリ」とされている。

---

## 10. 受容と評価

### 10.1 メディア

- **Gizmodo**: 「The Last Jedi の監督が新しいカメラアプリを出した（いい人だから）」。Yedlin の Instagram 発言を引用。
- **AppleInsider**: 「現代的なハリウッド風のルックが出る」一方で「編集ツールは Halide ほど便利ではない」「このルックは万人向けではない」。
- **9to5Mac / MacRumors / Forbes**: 発表直後の話題性とチャート1位を報道。
- **Wired**（転載で確認）: 「The Hollywood Color Nerd Who Shot 'Knives Out' Explains His Viral iPhone Camera App」。Yedlin へのインタビュー。
- **No Film School / Newsshooter / VP Land**: 映像制作者向けに技術的意義を解説。

### 10.2 ユーザーレビュー（App Store）

肯定的な点:
- 映画のような色合いと質感を簡単に再現できる
- RAW からの独自処理で、他アプリとは一線を画す仕上がり
- ハイライト重視の既定露出が優秀
- グレインの質感が良い
- 買い切り価格

否定的な点:
- 撮影時にプレビューが見えない（日本語レビュー「素晴らしいが、改善の余地あり」）
- シャープニングがなく、ディテールが眠い
- 48MP が使えない
- マスク、ハレーション量、編集時モノクロ、WB 固定が欲しい
- 編集 UI が直感的でない

---

## 11. 未確認事項と注意点

- **公式サイトの直接取得は行えていない。** 本レポートの公式サイト記述は、ユーザーが貼り付けた原文テキストに基づく。
- **App Store ページの全文も直接取得していない。** 説明文・リリースノートは検索結果の要約とスクリーンショットからの再構成。
- **公開日は 10月20日 / 10月22日で資料が揺れている。** Johnson の X 発表は 10月28日で確定。
- **ハレーションの調整可否**は報道とレビューで食い違いがあり、バージョン差の可能性がある。本レポートでは「未確認」で統一し、「未対応」とは断定しない。
- **本レポート内の「無い」「できない」は、公式記述がない限り利用者報告（バージョン不明）に基づく。** §4 と §8 の表で確度を区別した。「確認できなかった」を「存在しない」に読み替えない。
- **確認する際の記録**: 機能名 / 対象バージョン / 確認日 / 端末 / 操作手順 / 結果 / 根拠（スクリーンショット等）を残し、本レポートと仕様書（../chromagraph_clone_spec/SPEC.md §12）の両方を更新する。
- **Eric Cameron の経歴**は公開情報に乏しい。
- **「iPhone Duo 対応」**（1.1.3）の意味は資料から判断できなかった。
- **プリセットの有無**は「単一ルック」と推定しているが、アプリ内で未確認。
- **Baidu Baike の記述**（ノイズリダクションの省略など）は二次情報として扱う。

---

## 12. 出典

公式・一次情報
- Chromatic Applications 公式ページ: https://chromaticapplications.com/chromagraph/chromagraph
- App Store（米）: https://apps.apple.com/us/app/chromagraph-camera/id6803329435
- App Store レビュー（米）: https://apps.apple.com/us/app/6803329435?see-all=reviews&platform=iphone
- Steve Yedlin X 発表投稿: https://x.com/steveyedlin/status/2115418862191866261
- Steve Yedlin「On Color Science」: https://www.yedlin.net/NerdyFilmTechStuff/OnColorScience/
- chromagraph.lol（ランディングページ）: https://chromagraph.lol/

報道
- Newsshooter: https://www.newsshooter.com/2026/10/28/chromagraph-camera-ios-app-by-steve-yedlin-asc/
- AppleInsider: https://appleinsider.com/articles/26/10/28/rian-johnsons-chromagraph-camera-app-brings-his-cinematic-style-to-your-iphone-photos
- 9to5Mac: https://9to5mac.com/2026/10/30/knives-out-director-launches-iphone-camera-app-that-shoots-like-his-movies/
- MacRumors: https://www.macrumors.com/2026/10/30/rian-johnson-iphone-camera-app/
- Gizmodo: https://gizmodo.com/the-last-jedi-director-launches-a-new-camera-app-for-iphone-because-hes-a-good-guy-2000832061
- No Film School: https://nofilmschool.com/rian-johnson-steve-yedlin-app
- Slant Magazine: https://www.slantmagazine.com/film/rian-johnson-steve-yedlin-chromagraph-camera-iphone-app/
- Forbes: https://www.forbes.com/sites/conormurray/2026/10/29/this-13-photo-app-launched-by-knives-out-filmmakers-surges-to-top-of-app-store-charts/
- VP Land: https://www.vp-land.com/stories/new-chromagraph-camera-app-from-rian-johnson-and-steve-yedlin-swaps-iphone-processing-for
- DIY Photography: https://www.diyphotography.net/knives-out-director-iphone-camera-app/
- Mezha: https://mezha.ua/en/news/knive-out-iphone-cam-app-316664/
- Wired（転載）: https://techbytes.app/posts/the-hollywood-color-nerd-who-shot-knives-out-explains-his/
- ASC: https://theasc.com/news/steve-yedlin-asc-offers-unique-take-on-image-prep/
- tutkit（独語）: https://www.tutkit.com/de/blog/896-chromagraph-camera-iphone-filmlook
- iphone-ticker.de（独語）: https://www.iphone-ticker.de/chromagraph-camera-knives-out-regisseur-erobert-den-app-store-289560/

二次情報
- Baidu Baike: https://baike.baidu.com/en/item/Chromagraph%20Camera/7343759
- Wikipedia「Steve Yedlin」: https://en.wikipedia.org/wiki/Steve_Yedlin
