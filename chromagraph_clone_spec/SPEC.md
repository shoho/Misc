# Chromagraph クローン 技術仕様書

> 作成日: 2026年11月3日
> 対象 OS: iOS 17.0 以降
> 対象デバイス: iPhone（Bayer RAW 撮影に対応する機種。iPhone 12 以降を想定）
> 言語 / フレームワーク: Swift, SwiftUI, AVFoundation, Core Image, Metal, ImageIO, Vision

---

## 0. この仕様の狙い

Chromagraph Camera の本質は「フィルターではない」という一点にある。本仕様は、その一点を技術的にどう実現するかを最優先に設計し、UI や周辺機能はそれに従属させる。

### 0.1 「フィルター」と「別のプロセス」の技術的な違い

| | フィルター型（一般的なシネマティック系アプリ） | 別プロセス型（Chromagraph、本仕様） |
|---|---|---|
| 入力 | Apple が処理済みの HEIC/JPEG、または YUV プレビュー | センサーの Bayer RAW（DNG） |
| 信号の状態 | 表示参照（display-referred）。8〜10bit、sRGB/P3 にトーンマップ済み | シーン参照（scene-referred）。12〜14bit リニア、ハイライトの余裕あり |
| 既に失われているもの | クリップしたハイライト、Smart HDR の局所トーンマップの判断、Apple のノイズ処理とシャープニング、Apple のカラーレンダリング | 何も失われていない（デモザイク前） |
| ルックの適用位置 | トーンマップ後に LUT を重ねる | デモザイク直後のシーンリニア段で適用 |
| ハイライトの挙動 | 既にクリップされているので「転び方」を設計できない | ロールオフと彩度の落ち方を自由に設計できる |
| 色の分離 | Apple のカラーレンダリングの上に乗るので二重変換になる | カメラ RGB → XYZ → 作業空間の一段で、ルック側が完全に制御 |

要するに、Apple の処理は「センサー値を画面に出すための Apple の意見（look management）」であり、フィルターはその意見の上に別の意見を重ねる。別プロセス型は Apple の意見を使わず、自分の意見だけで画を作る。

### 0.2 本家の仕様から読み取れる実装のヒント

| 本家の観察事実 | 推定される実装 |
|---|---|
| 解像度が 12MP（4032×3024）止まり。iPhone 17 Pro でも 48MP 不可 | ProRAW ではなく Bayer RAW（ネイティブ RAW）を使っている。ProRAW は Apple の多フレーム合成とノイズ処理を含むため「別プロセス」にならない |
| シャープニングがなく、画が眠いという評価 | Apple のシャープニングを通さず、独自の補完も入れていない。設計思想として意図的 |
| 「マルチ露光合成でシャドウがクリーン、ハイライトに余裕」 | RAW ブラケット撮影を自前でアライメントして合成している |
| 「ハイライト重視の既定露出」 | 露出バイアスをマイナスに振り、リニア処理で持ち上げる設計 |
| ファインダーにルックが出ない | フル画質 RAW のデモザイクとルック適用をリアルタイムで行わない。プレビュー YUV に LUT を当てる「フィルター型プレビュー」も、思想に反するので避けている |
| 「シーンリニアな原本を保持」 | DNG そのもの、またはデモザイク済みリニア float を保存 |
| 「ルックの核を保ったまま調整」 | 調整つまみがルックの前段（シーンリニア）とルック内部のパラメータに限定され、ルック後段の自由編集を提供しない |

---

## 1. システム構成

```
┌─────────────────────────────────────────────────────────────────┐
│ Capture                                                          │
│  AVCaptureSession → AVCapturePhotoOutput                         │
│   ├ 単発: Bayer RAW (DNG)                                        │
│   └ ブラケット: Bayer RAW × 3〜4 (EV -2 / 0 / +1 など)            │
└──────────────┬──────────────────────────────────────────────────┘
               │ DNG + メタデータ
┌──────────────▼──────────────────────────────────────────────────┐
│ Decode                                                           │
│  CIRAWFilter（Apple のルック要素をすべて無効化）                     │
│   → シーンリニア RGB (float16, 作業色空間)                          │
│  [将来] 自前 Metal デモザイク                                      │
└──────────────┬──────────────────────────────────────────────────┘
               │ scene-linear
┌──────────────▼──────────────────────────────────────────────────┐
│ Merge（ブラケット時のみ）                                          │
│  アライメント（Vision / Metal） → 露出正規化 → 重み付き合成          │
│   → ゴースト除去                                                   │
└──────────────┬──────────────────────────────────────────────────┘
               │ scene-linear HDR
┌──────────────▼──────────────────────────────────────────────────┐
│ Look Pipeline（Metal compute）                                    │
│  1. 前段調整: 露出 / WB / ハレーション（物理的には露光時の現象）       │
│  2. ルック本体: log 変換 → 濃度モデル → 色クロストーク → 出力カーブ   │
│  3. テクスチャ: グレイン（濃度ドメインで付加）                        │
│  4. ディスプレイ変換: 作業空間 → Display P3 / sRGB, ガマットマップ    │
└──────────────┬──────────────────────────────────────────────────┘
               │ display-referred
┌──────────────▼──────────────────────────────────────────────────┐
│ Gallery / Export                                                  │
│  DNG + 編集パラメータ JSON（非破壊）                                │
│  HEIC / JPEG 書き出し（ICC プロファイル, EXIF 継承）                │
│  auto-export, Export Size, アーカイブ (zip)                        │
└─────────────────────────────────────────────────────────────────┘
```

設計原則
- **ルックは一箇所にしかない。** プレビュー用の簡易ルック、サムネイル用の別ルックなどを作らない。すべて同じ Look Pipeline を通す。解像度だけを変える。
- **編集はパラメータとして保存し、画像は再現像する。** 原本の DNG は絶対に書き換えない。
- **Apple の意見を混ぜない。** CIRAWFilter を使う場合も、トーン、ノイズ、シャープ、ローカルトーンマップの各要素を明示的に無効化する。

---

## 2. Capture（撮影）

### 2.1 RAW 形式の選択

| 選択肢 | 内容 | 採否 |
|---|---|---|
| Bayer RAW（ネイティブ RAW） | `AVCapturePhotoOutput.availableRawPhotoPixelFormatTypes` の `kCVPixelFormatType_14Bayer_RGGB` 等。デモザイク前のセンサー値。12MP（機種により 48MP も可） | **採用**。これが「別プロセス」の前提 |
| Apple ProRAW | リニア RGB の DNG。Deep Fusion と Apple のノイズ処理が合成済み。48MP 可 | 不採用（v1）。Apple の処理が混ざる。将来「高解像度モード」として選択式で検討 |
| HEIF/JPEG | Apple 処理済み | 不採用 |

実装
```swift
let output = AVCapturePhotoOutput()
output.isAppleProRAWEnabled = false
guard let rawFormat = output.availableRawPhotoPixelFormatTypes.first(where: {
    AVCapturePhotoOutput.isBayerRAWPixelFormat($0)
}) else { /* 非対応機種 */ }

let settings = AVCapturePhotoSettings(rawPixelFormatType: rawFormat,
                                      processedFormat: nil)   // 処理済み画像は要求しない
settings.photoQualityPrioritization = .quality
settings.maxPhotoDimensions = output.maxPhotoDimensions          // 48MP 対応機では大きくなる
```

備考
- `processedFormat: nil` にすると Apple 処理済みのサムネイルすら生成されない。ギャラリーのサムネイルは自前パイプラインで作る（原則通り）。
- 48MP Bayer RAW は iPhone 14 Pro 以降で `maxPhotoDimensions` 経由で取得できる。処理時間とメモリが約4倍になるため、v1 は 12MP 固定、v2 で「高解像度」オプション。

### 2.2 露出制御（ハイライト重視）

ルックがシーンリニアで動くので、ハイライトを飛ばさないことが最優先。シャドウはリニア処理で持ち上げられるが、クリップしたハイライトは戻らない。

- 既定: `exposureTargetBias = -1.0 EV`（機種とシーンで -0.7〜-1.5 の範囲を調整）
- 測光: `exposureMode = .continuousAutoExposure` のまま、`exposurePointOfInterest` を使わずバイアスで制御する。ユーザーには EV ダイヤルを提供（±2 EV）。
- 将来: プレビュー YUV のヒストグラムからハイライトクリップ率を監視し、バイアスを動的に決める「ハイライト優先 AE」。

### 2.3 マルチ露光（ブラケット撮影）

```swift
let brackets = [-2.0, 0.0, +1.0].map {
    AVCaptureAutoExposureBracketedStillImageSettings
        .autoExposureSettings(exposureTargetBias: Float($0))
}
let settings = AVCapturePhotoBracketSettings(rawPixelFormatType: rawFormat,
                                             processedFormat: nil,
                                             bracketedSettings: brackets)
settings.isLensStabilizationEnabled = output.isLensStabilizationDuringBracketedCaptureSupported
```

- `output.maxBracketedCapturePhotoCount` を確認（多くの機種で 3〜4）。
- 露出差はシャッター速度で付ける（ISO 固定）方がノイズモデルが単純になる。`AVCaptureManualExposureBracketedStillImageSettings` で duration を変える方式も検討。
- 静止シーン判定: プレビューのフレーム差分が小さいときだけブラケット、動体が多いときは単発に自動で落とす。

### 2.4 その他のカメラ機能

| 機能 | 実装 |
|---|---|
| レンズ切替 | `AVCaptureDevice.DiscoverySession` で 0.5x / 1x / 2x(3x/5x) を列挙。仮想デバイス（`builtInTripleCamera`）は自動切替が Apple 側で起きるため使わず、物理デバイスを個別に選ぶ |
| 既定レンズ | Preferences に保存 |
| マクロ | 超広角の自動マクロ切替は仮想デバイスの機能なので、物理デバイス選択なら自然に無効。有効にしたい場合のみ仮想デバイスへ |
| 前面カメラ | 対応。ミラーモードはギャラリー表示と書き出しで水平反転 |
| モノクロ | 撮影前にフラグを立て、ルックの「モノクロ変種」を適用。RAW はカラーで保存するので後から戻せる（本家は戻せないが、ここは改善点） |
| プレビュー | `AVCaptureVideoPreviewLayer` をそのまま表示。ルックは当てない。露出のオーバー/アンダーを示すゼブラのみオーバーレイで提供（これは画像処理ではなく測定なので思想に反しない） |

---

## 3. Decode（RAW 現像の前半）

### 3.1 v1: CIRAWFilter を「素」で使う

自前デモザイクは工数が大きいので、v1 は Core Image の `CIRAWFilter` を使い、Apple のルック要素を全部切る。

```swift
let raw = CIRAWFilter(imageData: dngData, identifierHint: "com.adobe.raw-image")!
raw.isDraftModeEnabled       = false
raw.baselineExposure         = 0
raw.exposure                 = 0
raw.boostAmount              = 0      // Apple のグローバルトーンカーブを切る
raw.boostShadowAmount        = 0
raw.localToneMapAmount       = 0      // ローカルトーンマップを切る
raw.extendedDynamicRangeAmount = 0
raw.contrastAmount           = 0
raw.detailAmount             = 0      // シャープニング
raw.sharpnessAmount          = 0
raw.luminanceNoiseReductionAmount = 0
raw.colorNoiseReductionAmount     = 0 // ※ 色ノイズだけは低めに残す選択もあり
raw.moireReductionAmount     = 0
raw.neutralTemperature / neutralTint = DNG の AsShotNeutral から
raw.colorSpace               = CGColorSpace(name: CGColorSpace.extendedLinearDisplayP3)
```

- `linearSpaceFilter` プロパティに CIFilter を差し込むと、デモザイク直後のリニア段で処理できる。ハレーションの付加はここが物理的に正しい位置。
- 出力はリニア float16 の `CIImage` → `MTLTexture` へ。以降は Metal で処理。

限界
- デモザイクは Apple のアルゴリズム。補間の癖（偽色、ジッパー）は Apple 由来になる。
- ノイズリダクションを 0 にしても、完全に素の値かどうかは保証されない。

### 3.2 v2: 自前デモザイク（Metal）

- DNG を ImageIO ではなく自前パーサで読む（TIFF/EP 準拠。`CFA Pattern`, `BlackLevel`, `WhiteLevel`, `ColorMatrix1/2`, `AsShotNeutral`, `CalibrationIlluminant`）。
- Metal compute で: 黒レベル減算 → ホワイトレベル正規化 → WB ゲイン → デモザイク（AHD または Malvar-He-Cutler。後者は 5×5 カーネルで高速）→ カメラ RGB → XYZ（ColorMatrix の逆行列、2つのイルミナント間を色温度で補間）→ 作業空間。
- レンズ補正（周辺減光、歪曲）は DNG の OpcodeList を解釈するか、機種別テーブルを持つ。

### 3.3 作業色空間

- **リニア、広色域、float16。** 候補は ACEScg（AP1）または Linear Rec.2020。iOS の表示が Display P3 なので、Linear P3 でも実用上は足りるが、ルック設計で飽和色の挙動を扱うために AP1 を推奨。
- 作業空間での値 1.0 = 18% グレーの約 5.5 倍（ディフューズ白）となるよう露出を正規化する。ルックの入力はこの基準で設計する。

---

## 4. Merge（マルチ露光合成）

v1 では単発撮影のみ。v2 で実装。

1. **アライメント**: 各フレームを 1/4 に縮小したリニア輝度で `VNHomographicImageRegistrationRequest` を実行し、ホモグラフィを得る。手持ちの微動には十分。動体はここでは扱わない。
2. **露出正規化**: 各フレームの値に 2^(-EV) を掛け、同一の放射輝度スケールに揃える。
3. **重み付き合成**: ピクセルごとに、クリップしていないフレームを優先し、信号が大きいほど（ショットノイズ比で有利）重みを上げる。重み w = (1 - clipped) × signal_level。
4. **ゴースト除去**: 基準フレーム（EV 0）との残差が閾値を超える画素は基準フレームの値を使う。
5. 結果はシーンリニア HDR として Look Pipeline へ。ハイライトの余裕が約 2 EV 広がる。

設計上の注意
- 合成は必ずリニア空間で行う。ログや表示空間で合成するとルックの前提が崩れる。
- 合成後のノイズ特性は単発と変わるので、グレインのパラメータは合成の有無で切り替える。

---

## 5. Look Pipeline（ルック本体）

ここが本アプリの価値のすべてである。Yedlin のアプローチは、フィルムの「濃度」の振る舞いを数学的にモデル化し、それを display prep として一括適用するもの。本仕様は同じ構造をパラメトリックに設計し、実行時は 3D LUT に焼いて高速化する。

### 5.1 全体の段構成

```
scene-linear (AP1)
  │
  ├─ [A] 前段調整（ユーザーのつまみ: 露出, WB, ハレーション）
  │
  ├─ [B] log エンコード（シーンリニア → 対数露光量）
  │
  ├─ [C] 濃度モデル（フィルムのネガ特性: 各層の S 字特性曲線）
  │
  ├─ [D] 色クロストーク（減法混色の層間干渉: 濃度ドメインの 3×3 + 非線形）
  │
  ├─ [E] プリント特性（ネガ → ポジの S 字, 黒の締まりと白のロールオフ）
  │
  ├─ [F] グレイン（濃度ドメインで付加）
  │
  ├─ [G] 出力変換（濃度 → 透過率 → リニア → Display P3 ガンマ, ガマットマップ）
  │
display-referred
```

[B]〜[E] と [G] は入力に対する純粋な関数なので、**3D LUT（65³, float16）に焼く**。[A] はリニアの行列演算、[F] はノイズ生成なので LUT の外。実行時は「行列 → ハレーション → シェーパー 1D LUT → 3D LUT → グレイン」の順で Metal で処理する。

### 5.2 [B] log エンコード

- シーンリニア値 L を `logE = log10(L) + offset` に変換。18% グレーが 0 になるようオフセットする。
- 実装上は 1D シェーパー LUT。3D LUT の入力を log にすることで、暗部の分解能を確保する。

### 5.3 [C] 濃度モデル（ネガ）

フィルムの特性曲線 D(logE) を各層（R/G/B に対応する C/M/Y 染料）に持つ。パラメトリックには次の形が扱いやすい。

```
D(x) = Dmin + (Dmax - Dmin) / (1 + exp(-k * (x - x0)))^a
```

- Dmin: ベース濃度（黒の持ち上がり）
- Dmax: 最大濃度
- k: 直線部の傾き（ガンマ）
- x0: 中点（感度）
- a: 肩の非対称性（ハイライトのロールオフの緩やかさ）

層ごとに k, x0, a を微妙に変えることで、ハイライトの色の転び（例: 白に向かって暖色に抜ける）や暗部の色（例: 青緑に沈む）が生まれる。ここが「Yedlin らしさ」の核で、数値は参照画像を見ながら決める（6.1 参照）。

### 5.4 [D] 色クロストーク

実際のフィルムでは、ある層の露光が隣接層の濃度にも影響する（インターイメージ効果）。濃度ドメインで次のように扱う。

```
D' = M · D + f(D)
```

- M: 3×3 行列。対角が 1、非対角が小さな負または正の値。彩度と色相のねじれを作る。
- f: 非線形項。濃度が高い（暗い）ほど彩度が落ちる、などの挙動。

この段があるかどうかが「LUT を当てただけ」と「フィルムのように振る舞う」の分かれ目になる。RGB 空間で彩度を上げ下げするのとは質的に違い、色相ごとに異なる飽和の仕方が出る。

### 5.5 [E] プリント特性

ネガ濃度をもう一度 S 字に通してポジにする。ここで最終的なコントラスト、黒の締まり、白の抜けが決まる。

- 黒は完全な 0 にしない（プリントの Dmin）。
- 白は 1.0 に漸近し、クリップしない。どんなに明るい入力でも滑らかに飽和する。

### 5.6 [G] 出力変換とガマットマップ

- 濃度 → 透過率（10^-D）→ 作業空間リニア → Display P3。
- AP1 の飽和色は P3 の外に出るので、ガマットマップが必要。輝度を保って彩度を落とす方式（色相保持）を使い、チャンネルクリップはしない。チャンネルクリップは色相が回るので、フィルム的な「白に抜ける」挙動と相性が悪い。
- 書き出し先が sRGB の場合は同様に P3 → sRGB のガマットマップ。

### 5.7 ユーザー調整（「ルックを失わずに調整」の実装）

つまみは [A] の前段と、[C]〜[E] のパラメータの**限定的な**変更に閉じる。ルック後段（表示参照）での自由編集は提供しない。これにより、どう動かしても「このアプリの画」から外れない。

| つまみ | 作用する段 | 実装 |
|---|---|---|
| 露出 | [A] | リニアに 2^EV を掛ける。ルックに入る前なので、ハイライトのロールオフの位置が自然に動く |
| ホワイトバランス（色温度 / ティント） | [A] | リニアで Bradford 変換。ルックの色の転びは保たれる |
| コントラスト | [C][E] | k を ±20% の範囲でスケール。中点 x0 は固定 |
| トーン（シャドウ / ハイライト） | [C] | Dmin, Dmax と a の微調整。曲線の形は崩さない |
| カラー（彩度 / 色のねじれ） | [D] | M の非対角成分を 0〜1.5 倍でスケール。0 にしても完全なニュートラルにはならない（f の項が残る） |
| テクスチャ（グレイン量 / 粒子サイズ） | [F] | 後述 |
| ハレーション量 | [A] | 後述 |
| モノクロ | [D] | 濃度を輝度の重みで単層に畳む。パンクロ的な重み（R 寄り）を既定に |

つまみを動かすたびに [B]〜[E][G] の 3D LUT を再焼成する。65³ = 274,625 点の評価は Metal compute で 1ms 未満。

---

## 6. テクスチャ

### 6.1 ハレーション

物理的には、強い光がフィルムベースを抜けて裏面で反射し、再び感光層に戻る現象。赤感光層が最も裏側にあるため赤〜橙に色づく。

実装（[A] の段、シーンリニアで）
1. 作業空間リニアから、閾値（例: ディフューズ白の 2 倍）以上の成分を抽出。
2. ガウシアンピラミッドで広い半径（画像幅の 2〜5%）にブラー。2〜3 段の異なる半径を合成すると裾が自然になる。
3. 赤 > 緑 > 青 の重み（例: 1.0 / 0.35 / 0.1）で色づけ。
4. 元画像に加算。加算なのでハイライトの周囲が「持ち上がる」。
5. ユーザーの「ハレーション量」は 3 のゲインに掛ける。

ルックの前段で加算するので、ハレーションそのものもルックのロールオフとクロストークを通る。これが「後がけのグロー」と見え方が違う理由。

### 6.2 グレイン

実装（[F] の段、濃度ドメインで）
1. 濃度が中間（D ≈ 0.6〜1.2）で最も強く、Dmin と Dmax 付近で弱くなる重み関数を持つ。実フィルムの RMS 粒状度の濃度依存性に合わせる。
2. ノイズは層ごとに無相関（R/G/B 別々の乱数）。これが色のついたグレインになる。青層はやや強め。
3. 粒子サイズは**出力解像度ではなくセンサー解像度基準**で決め、書き出しサイズを変えても粒の見え方が相対的に同じになるようにする。
4. 生成はブルーノイズのタイルを、画像ごとに異なるオフセットでサンプリング。ガウシアンの白色ノイズは「デジタルノイズ」に見えるので使わない。粒の「塊感」は低周波ノイズを軽く混ぜて作る。
5. ユーザーの「グレイン量」は振幅、「粒子サイズ」はタイルのサンプリング倍率。

---

## 7. Gallery / Export

### 7.1 データモデル

```
Library/
  <uuid>/
    original.dng          # センサー RAW。不変
    merged.exr            # ブラケット合成後のシーンリニア（v2, 任意。再合成のコストを省く）
    edits.json            # 編集パラメータ。バージョン付き
    thumb.heic            # Look Pipeline で生成したサムネイル（ルック適用済み）
```

`edits.json`
```json
{
  "schema": 1,
  "lookVersion": "2026.11",
  "exposure": -0.3,
  "whiteBalance": { "temperature": 5200, "tint": 2 },
  "contrast": 1.0,
  "tone": { "shadows": 0, "highlights": 0 },
  "color": { "crosstalk": 1.0 },
  "texture": { "grain": 1.0, "grainSize": 1.0, "halation": 1.0 },
  "monochrome": false,
  "crop": { "rect": [0,0,1,1], "rotation": 0, "flipH": false, "flipV": false }
}
```

- `lookVersion` を持つことで、将来ルックを改良しても過去の写真は当時のルックで再現できる。
- 原本は iOS の写真ライブラリには保存しない（本家と同じ）。ライブラリへ入れるのは書き出し結果のみ。

### 7.2 表示

- ギャラリーのサムネイルと全画面表示は、同じ Look Pipeline を解像度だけ変えて走らせる。全画面は 1/2 解像度で即時表示し、バックグラウンドでフル解像度に差し替える。
- 編集中のプレビューは 1/4 解像度で 3D LUT 再焼成とレンダリングを行い、60fps を目標にする。

### 7.3 書き出し

| 項目 | 仕様 |
|---|---|
| 形式 | HEIC（既定）/ JPEG |
| 色空間 | Display P3（ICC 埋め込み）。sRGB も選択可 |
| ビット深度 | HEIC は 10bit を選択可能に（グレインとロールオフのバンディング回避） |
| サイズ | フル / 大（長辺 3000）/ 中（長辺 2000）/ 小（長辺 1200） |
| メタデータ | DNG の EXIF（撮影日時、レンズ、露出）を継承。位置情報は Preferences で可否 |
| auto-export | 撮影完了ごとにバックグラウンドで書き出し、`PHPhotoLibrary` に保存 |
| HDR 書き出し | v3。ISO 21496-1 ゲインマップ付き HEIC。シーンリニアを持っているので原理的に容易 |

### 7.4 アーカイブ

- 選択した写真の `<uuid>/` ディレクトリを zip にまとめ、Files アプリへ書き出し。
- インポートは zip を展開してライブラリに追加。`lookVersion` が未知の場合は最新ルックで表示し、警告を出す。

---

## 8. ライブプレビューについての方針

本家は「撮影後にギャラリーで見る」設計を採っている。技術的な理由と思想的な理由の両方がある。

- 技術: 12MP Bayer のデモザイクとルック適用を 30fps で回すのは A17 クラスでも厳しく、電池を食う。
- 思想: プレビュー YUV に LUT を当てる「近似プレビュー」は Apple の処理の上にフィルターを乗せることになり、「フィルターではない」という主張と矛盾する。ユーザーがプレビューと仕上がりの差に混乱する。

本仕様の方針
- **v1: プレビューにルックを当てない。** 本家と同じ。
- **v3 で検討: 「参考プレビュー」を明示的なオプションとして提供。** プレビュー YUV を sRGB → 逆トーンマップで擬似リニアに戻し、3D LUT を当てる。精度は低いことを UI に明記する。本家が最も批判されている点なので、クローンの差別化要素になりうる。ただし既定はオフ。

---

## 9. ルック開発の進め方（アプリとは別のツールチェーン）

ルックの数値はアプリの中で決めるものではない。先にオフラインで作り、アプリは「再生装置」にする。

1. **参照画像の収集**: 自分の iPhone で DNG を 100 枚程度撮る。人肌、空、緑、夕景、室内タングステン、ネオン、白いもの、黒いもの。
2. **Python での試作**: `rawpy`（LibRaw）で DNG をリニア化し、`numpy` と `colour-science` で [B]〜[G] を実装。Jupyter で参照画像を並べながらパラメータを追い込む。
3. **目標の設定**: Yedlin の手法は実フィルムの測定データに合わせ込むものだが、クローンではフィルムの実測は不要。「好きな写真」を数枚選び、それに近づける。
4. **3D LUT への焼成**: 決まったパラメータから `.cube`（65³）とパラメータ JSON を出力。
5. **アプリへの組み込み**: Metal 側は同じ数式を Swift/MSL で実装し、Python 側と同一入力で出力一致をテストする（許容誤差 1/1024）。パラメータ JSON をバンドルし、つまみ操作時はアプリ内で再焼成。

この分離により、ルックの改良はアプリのリリースと独立に行える。

---

## 10. 性能目標

| 項目 | 目標 | 根拠 |
|---|---|---|
| 単発撮影 → ギャラリーに表示 | 1.0 秒以内（iPhone 13 以降） | CIRAWFilter のデコード約 300ms + Metal パイプライン約 100ms + サムネイル |
| ブラケット撮影 → 表示 | 3 秒以内 | 3 枚デコード + アライメント + 合成 |
| 編集プレビュー | 60fps（1/4 解像度） | 3D LUT 再焼成 <1ms + レンダリング |
| フル解像度書き出し | 2 秒以内 | |
| メモリ | 12MP float16 × 3ch × 作業バッファ 4 面 = 約 300MB | 48MP では 1.2GB になるので、タイル処理が必要 |

---

## 11. マイルストーン

| M | 内容 | 完了条件 |
|---|---|---|
| M0 | ルック試作（Python） | 参照画像 20 枚で「好きな画」になるパラメータが決まり、.cube が出力できる |
| M1 | 撮影 + 現像 + ギャラリー | Bayer RAW 撮影 → CIRAWFilter 素現像 → 3D LUT → 表示 → HEIC 書き出しが通る |
| M2 | エディタ | 露出 / WB / コントラスト / カラー / モノクロ / クロップ。非破壊保存 |
| M3 | テクスチャ | ハレーション、グレイン。つまみ付き |
| M4 | マルチ露光 | ブラケット撮影と合成。静止判定 |
| M5 | 周辺 | auto-export、Export Size、アーカイブ、既定レンズ、ミラー |
| M6 | 差別化 | 48MP オプション、10bit HEIC、参考プレビュー、ハレーション量の調整、編集時モノクロ、WB 固定（本家の不満点への対応） |

---

## 12. 本家に対して改善できる点（クローンの差別化）

本家のレビューで挙がった不満のうち、設計を崩さずに対応できるもの。

| 不満 | 対応 | 設計との整合 |
|---|---|---|
| 撮影時にルックが見えない | 参考プレビュー（既定オフ、精度の低さを明記） | 本流パイプラインとは別と明示すれば矛盾しない |
| シャープニングがない | デモザイク直後に控えめなデコンボリューション（Apple 的なエッジ強調ではなく、レンズのボケを戻す方向）をオプションで | シーンリニア段で行えば「フィルター」ではない |
| 48MP 不可 | 対応機種で選択式 | 処理時間とのトレードオフを明示 |
| ハレーション量の調整不可 | つまみを提供 | [A] のゲインを露出するだけ |
| 編集時にモノクロへ切替不可 | RAW はカラーなので可能 | [D] の切替 |
| WB 固定不可 | 撮影時の WB ロックと、編集時の数値指定 | [A] |
| 英語のみ | 日本語対応 | |

---

## 13. 技術的リスク

| リスク | 影響 | 対策 |
|---|---|---|
| CIRAWFilter が「完全に素」のリニアを返さない | Apple の処理が微量に混ざる | v2 で自前デモザイクへ移行。v1 ではパラメータを全て 0 にした上で、既知のグレーチャートで線形性を検証 |
| Bayer RAW 非対応機種 | 旧機種で動かない | 起動時に判定し、非対応なら明示。ProRAW へのフォールバックは「別プロセス」でなくなるので行わない |
| ブラケットのゴースト | 動体で破綻 | 静止判定で単発に落とす。合成後の残差マップを保存し、将来の改良に使う |
| ルックが「好み」に収束しない | 製品の核が定まらない | M0 に時間を割く。アプリ実装より先にルックを決める |
| 48MP でメモリ不足 | クラッシュ | タイル処理。v1 では 12MP 固定 |
| Core Image と Metal の往復コスト | 性能 | `CIRenderDestination` で直接 MTLTexture に描き、往復を 1 回に抑える |

---

## 14. 参考

- Steve Yedlin, "On Color Science": https://www.yedlin.net/NerdyFilmTechStuff/OnColorScience/
- Steve Yedlin, "Display Prep Demo": https://www.yedlin.net/NerdyFilmTechStuff/
- Apple, AVCapturePhotoOutput / RAW capture: https://developer.apple.com/documentation/avfoundation/avcapturephotooutput
- Apple, CIRAWFilter: https://developer.apple.com/documentation/coreimage/cirawfilter
- Apple, Capturing Photos in RAW and Apple ProRAW Formats: https://developer.apple.com/documentation/avfoundation/capturing-photos-in-raw-and-apple-proraw-formats
- Hasinoff et al., "Burst photography for high dynamic range and low-light imaging on mobile cameras" (HDR+), SIGGRAPH Asia 2016
- Malvar, He, Cutler, "High-Quality Linear Interpolation for Demosaicing of Bayer-Patterned Color Images", ICASSP 2004
- 本リポジトリの調査: ../chromagraph_camera_research/chromagraph_camera_research.md
