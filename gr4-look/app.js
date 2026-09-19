/* GR Look — iPhone の写真を RICOH GR 風の色味に近づけるデモ
 * 処理はすべてブラウザ内 (WebGL)。画像はどこにも送信されません。
 */
(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // パラメータ定義
  // ---------------------------------------------------------------------------
  const PARAM_DEFS = [
    { section: '露出・トーン' },
    { key: 'exposure',   label: '露出',            min: -1.5, max: 1.5, step: 0.05, def: 0 },
    { key: 'highlights', label: 'ハイライト圧縮',  min: 0,    max: 1,   step: 0.02, def: 0, hint: '眩しさを抑える。iPhone の白飛びっぽさに効く' },
    { key: 'shadows',    label: 'シャドウ',        min: -1,   max: 1,   step: 0.02, def: 0 },
    { key: 'contrast',   label: 'コントラスト',    min: 0.5,  max: 1.6, step: 0.02, def: 1 },
    { key: 'fade',       label: 'フェード(黒浮き)', min: 0,   max: 1,   step: 0.02, def: 0 },
    { key: 'clarity',    label: 'ローカルコントラスト', min: -0.8, max: 0.6, step: 0.02, def: 0, hint: 'マイナスで HDR っぽさを抜く' },
    { section: '色' },
    { key: 'saturation', label: '彩度',            min: 0,    max: 1.5, step: 0.02, def: 1 },
    { key: 'temp',       label: '色温度',          min: -1,   max: 1,   step: 0.02, def: 0 },
    { key: 'tint',       label: '色かぶり (G/M)',  min: -1,   max: 1,   step: 0.02, def: 0 },
    { key: 'splitAmount', label: 'スプリットトーン強さ', min: 0, max: 2, step: 0.05, def: 1 },
    { section: '質感' },
    { key: 'sharpen',    label: 'シャープネス',    min: 0,    max: 1.5, step: 0.05, def: 0.3 },
    { key: 'grain',      label: '粒状感',          min: 0,    max: 1,   step: 0.02, def: 0 },
    { key: 'grainSize',  label: '粒の大きさ',      min: 1,    max: 4,   step: 0.5,  def: 1.5 },
    { key: 'vignette',   label: '周辺光量落ち',    min: 0,    max: 1,   step: 0.02, def: 0 },
  ];
  const DEFAULTS = {};
  PARAM_DEFS.forEach(d => { if (d.key) DEFAULTS[d.key] = d.def; });
  // スライダーに出さない隠しパラメータ(プリセットが持つ「キャラクター」)
  Object.assign(DEFAULTS, {
    mono: 0,
    monoMix: [0.2126, 0.7152, 0.0722],
    shadowTint: [0, 0, 0],
    highlightTint: [0, 0, 0],
    // 線形空間での 3x3 カラーマトリクス (行優先)
    colorMatrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  });

  // ---------------------------------------------------------------------------
  // プリセット: GR のイメージコントロールを参考にした近似
  // 共通の考え方: ハイライトを抑え、彩度を落とし、局所コントラストを抜く
  // ---------------------------------------------------------------------------
  const PRESETS = [
    {
      id: 'standard', name: 'スタンダード', desc: '素直だけど眩しくない。まずはこれ',
      p: {
        highlights: 0.45, shadows: -0.05, contrast: 1.06, clarity: -0.15,
        saturation: 0.86, temp: 0.06, sharpen: 0.35, grain: 0.05,
        colorMatrix: [1.02, 0.0, -0.02, 0.0, 1.0, 0.0, -0.04, 0.02, 1.02],
        shadowTint: [-0.005, 0.0, 0.01], highlightTint: [0.01, 0.005, -0.01],
      },
    },
    {
      id: 'positive', name: 'ポジフィルム調', desc: '締まった黒と深い色。GR らしい定番',
      p: {
        highlights: 0.55, shadows: -0.3, contrast: 1.2, clarity: -0.2, fade: 0,
        saturation: 0.98, temp: 0.1, sharpen: 0.4, grain: 0.1, vignette: 0.25,
        colorMatrix: [1.08, -0.04, -0.04, -0.03, 1.04, -0.01, -0.08, 0.0, 1.08],
        shadowTint: [-0.01, -0.005, 0.02], highlightTint: [0.02, 0.01, -0.02],
      },
    },
    {
      id: 'negative', name: 'ネガフィルム調', desc: '柔らかくて少し褪せた、フィルムの記憶',
      p: {
        highlights: 0.6, shadows: 0.2, contrast: 0.92, clarity: -0.4, fade: 0.35,
        saturation: 0.72, temp: 0.08, tint: -0.06, sharpen: 0.2, grain: 0.3, grainSize: 2,
        colorMatrix: [1.0, 0.04, -0.04, 0.02, 0.98, 0.0, -0.04, 0.06, 0.98],
        shadowTint: [-0.02, 0.01, 0.04], highlightTint: [0.04, 0.02, -0.03],
      },
    },
    {
      id: 'cinema', name: 'シネマ', desc: 'ティール&オレンジ寄りの、映画の一コマ',
      p: {
        highlights: 0.7, shadows: 0.1, contrast: 1.05, clarity: -0.3, fade: 0.25,
        saturation: 0.7, temp: 0.05, sharpen: 0.25, grain: 0.2, grainSize: 2, vignette: 0.3,
        colorMatrix: [1.06, 0.0, -0.06, 0.0, 1.0, 0.0, -0.06, 0.04, 1.02],
        shadowTint: [-0.04, 0.01, 0.05], highlightTint: [0.05, 0.02, -0.03],
      },
    },
    {
      id: 'bleach', name: 'ブリーチバイパス', desc: '銀残し。色を抜いてコントラストを上げる',
      p: {
        highlights: 0.5, shadows: -0.2, contrast: 1.35, clarity: 0.15, fade: 0.05,
        saturation: 0.35, temp: -0.05, sharpen: 0.5, grain: 0.35, grainSize: 1.5, vignette: 0.35,
        colorMatrix: [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0],
        shadowTint: [-0.01, 0.0, 0.02], highlightTint: [0.01, 0.01, 0.0],
      },
    },
    {
      id: 'retro', name: 'レトロ', desc: '黄ばんだプリントみたいな温かさ',
      p: {
        highlights: 0.6, shadows: 0.25, contrast: 0.9, clarity: -0.35, fade: 0.45,
        saturation: 0.7, temp: 0.35, tint: 0.05, sharpen: 0.15, grain: 0.35, grainSize: 2.5, vignette: 0.45,
        colorMatrix: [1.02, 0.06, -0.08, 0.02, 1.0, -0.02, -0.06, 0.02, 0.9],
        shadowTint: [0.0, -0.01, 0.0], highlightTint: [0.05, 0.035, -0.04],
      },
    },
    {
      id: 'cross', name: 'クロスプロセス', desc: '転んだ色。緑がかった光と青い影',
      p: {
        highlights: 0.4, shadows: -0.15, contrast: 1.25, clarity: -0.1, fade: 0.15,
        saturation: 1.05, temp: -0.05, tint: -0.15, sharpen: 0.35, grain: 0.25, vignette: 0.3,
        colorMatrix: [1.05, 0.08, -0.13, -0.02, 1.08, -0.06, -0.1, 0.05, 1.05],
        shadowTint: [-0.04, -0.01, 0.06], highlightTint: [0.02, 0.05, -0.05],
      },
    },
    {
      id: 'vivid', name: 'ビビッド', desc: '派手だけど iPhone とは違う派手さ',
      p: {
        highlights: 0.4, shadows: -0.15, contrast: 1.15, clarity: -0.1,
        saturation: 1.15, temp: 0.05, sharpen: 0.4, grain: 0.05, vignette: 0.15,
        colorMatrix: [1.1, -0.05, -0.05, -0.04, 1.08, -0.04, -0.08, -0.02, 1.1],
      },
    },
    {
      id: 'hicon', name: 'ハイコントラスト白黒', desc: 'ザラついた粒子と黒の量',
      p: {
        mono: 1, monoMix: [0.45, 0.45, 0.10],
        highlights: 0.35, shadows: -0.35, contrast: 1.5, clarity: 0.35, fade: 0,
        sharpen: 0.6, grain: 0.7, grainSize: 2, vignette: 0.5,
      },
    },
    {
      id: 'mono', name: 'モノトーン', desc: '素直な白黒',
      p: {
        mono: 1, monoMix: [0.3, 0.59, 0.11],
        highlights: 0.5, shadows: 0, contrast: 1.08, clarity: -0.1,
        sharpen: 0.4, grain: 0.25, grainSize: 1.5, vignette: 0.2,
      },
    },
    {
      id: 'softmono', name: 'ソフトモノトーン', desc: '灰色が豊かな、やわらかい白黒',
      p: {
        mono: 1, monoMix: [0.25, 0.6, 0.15],
        highlights: 0.7, shadows: 0.3, contrast: 0.85, clarity: -0.4, fade: 0.4,
        sharpen: 0.15, grain: 0.3, grainSize: 2.5, vignette: 0.15,
      },
    },
    {
      id: 'none', name: 'オフ', desc: '加工なし',
      p: { sharpen: 0 },
    },
  ];

  // ---------------------------------------------------------------------------
  // WebGL
  // ---------------------------------------------------------------------------
  const VS = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;
  const FS = `
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D u_image;
    uniform sampler2D u_blur;
    uniform vec2 u_texel;
    uniform float u_exposure, u_highlights, u_shadows, u_contrast, u_fade, u_clarity;
    uniform float u_saturation, u_temp, u_tint, u_splitAmount;
    uniform float u_sharpen, u_grain, u_grainSize, u_vignette;
    uniform float u_mono, u_split, u_seed;
    uniform vec3 u_monoMix, u_shadowTint, u_highlightTint;
    uniform mat3 u_colorMatrix;

    const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
    vec3 toLinear(vec3 c) { return pow(max(c, 0.0), vec3(2.2)); }
    vec3 toDisplay(vec3 c) { return pow(max(c, 0.0), vec3(1.0 / 2.2)); }
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

    void main() {
      vec2 uv = v_uv;
      vec3 src = texture2D(u_image, uv).rgb;
      if (uv.x < u_split) { gl_FragColor = vec4(src, 1.0); return; }

      // --- シャープネス (アンシャープマスク, 表示空間) ---
      vec3 c = src;
      if (u_sharpen > 0.0) {
        vec3 n = texture2D(u_image, uv + vec2(u_texel.x, 0.0)).rgb
               + texture2D(u_image, uv - vec2(u_texel.x, 0.0)).rgb
               + texture2D(u_image, uv + vec2(0.0, u_texel.y)).rgb
               + texture2D(u_image, uv - vec2(0.0, u_texel.y)).rgb;
        c = c + (c - n * 0.25) * u_sharpen;
      }
      c = toLinear(c);

      // --- ホワイトバランス・露出 (線形空間) ---
      c *= vec3(1.0 + u_temp * 0.22, 1.0 - u_tint * 0.12, 1.0 - u_temp * 0.22);
      float gain = exp2(u_exposure);
      c *= gain;

      // --- ローカルコントラスト: ぼかし画像を土台にディテールを増減 ---
      float Y  = dot(c, LUMA);
      float Yb = dot(toLinear(texture2D(u_blur, uv).rgb), LUMA) * gain;
      float Yn = max(Yb + (Y - Yb) * (1.0 + u_clarity), 0.0);
      c *= Yn / max(Y, 1e-4);

      // --- ハイライト圧縮: 膝 (knee) より上をなだらかに寝かせる ---
      Y = dot(c, LUMA);
      const float knee = 0.4;
      float t = max(Y - knee, 0.0) / (1.0 - knee);
      float Yc = knee + (1.0 - knee) * (t / (1.0 + u_highlights * 1.6 * t));
      Yc = Y <= knee ? Y : Yc;
      c *= Yc / max(Y, 1e-4);

      // --- カラーマトリクス (色のキャラクター) ---
      c = u_colorMatrix * c;

      // --- 表示空間へ ---
      vec3 d = toDisplay(c);

      // --- シャドウ: 暗部に山を持たせて持ち上げ / 沈める ---
      float L = dot(d, LUMA);
      float w = 6.75 * L * (1.0 - L) * (1.0 - L);
      d += u_shadows * 0.22 * w;

      // --- コントラスト: S 字カーブ (白飛び・黒つぶれしにくい) ---
      vec3 s = d * d * (3.0 - 2.0 * d);
      d = mix(d, s, (u_contrast - 1.0) * 1.2);

      // --- フェード: 黒を浮かせる ---
      float f = u_fade * 0.11;
      d = f + d * (1.0 - f);

      // --- 彩度 / モノクロ ---
      vec3 mixW = mix(LUMA, u_monoMix, u_mono);
      L = dot(d, mixW);
      d = mix(vec3(L), d, u_saturation * (1.0 - u_mono));

      // --- スプリットトーン ---
      L = dot(d, LUMA);
      d += (u_shadowTint * (1.0 - L) * (1.0 - L) + u_highlightTint * L * L) * u_splitAmount;

      // --- 周辺光量落ち ---
      vec2 p = (uv - 0.5) * vec2(1.0, u_texel.x / u_texel.y);
      float r = length(p) / length(vec2(0.5, 0.5 * u_texel.x / u_texel.y));
      d *= 1.0 - u_vignette * 0.55 * smoothstep(0.35, 1.15, r);

      // --- 粒状感 ---
      vec2 gp = floor(gl_FragCoord.xy / u_grainSize);
      float n = hash(gp + u_seed) - 0.5;
      L = dot(d, LUMA);
      d += n * u_grain * 0.14 * (0.35 + 0.65 * (1.0 - L));

      gl_FragColor = vec4(clamp(d, 0.0, 1.0), 1.0);
    }
  `;

  const canvas = document.getElementById('gl');
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, premultipliedAlpha: false, antialias: false });
  if (!gl) {
    alert('WebGL が使えないブラウザです。');
    return;
  }

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(sh));
    }
    return sh;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  for (let i = 0; i < gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS); i++) {
    const info = gl.getActiveUniform(prog, i);
    U[info.name] = gl.getUniformLocation(prog, info.name);
  }
  gl.uniform1i(U.u_image, 0);
  gl.uniform1i(U.u_blur, 1);

  const MAX_TEX = gl.getParameter(gl.MAX_TEXTURE_SIZE);

  function makeTexture(unit) {
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }
  const texImage = makeTexture(0);
  const texBlur = makeTexture(1);

  function upload(unit, tex, source) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }

  // ---------------------------------------------------------------------------
  // 画像の準備
  // ---------------------------------------------------------------------------
  const PREVIEW_MAX = 1600;
  const EXPORT_MAX = Math.min(4096, MAX_TEX);

  let source = null;        // 元画像 (ImageBitmap または HTMLImageElement)
  let srcW = 0, srcH = 0;
  let previewW = 0, previewH = 0;
  let previewScale = 1;

  function fitScale(w, h, max) {
    return Math.min(1, max / Math.max(w, h));
  }

  function drawScaled(img, w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  // 大きめの半径のぼかし: 縮小 → 拡大を数段でやると安価で滑らか
  function makeBlur(img, w, h) {
    let c = drawScaled(img, w / 8, h / 8);
    c = drawScaled(c, c.width / 4, c.height / 4);
    c = drawScaled(c, c.width * 2, c.height * 2);
    c = drawScaled(c, c.width * 2, c.height * 2);
    return c;
  }

  function prepare(img, w, h) {
    source = img; srcW = w; srcH = h;
    previewScale = fitScale(w, h, PREVIEW_MAX);
    const pc = drawScaled(img, w * previewScale, h * previewScale);
    previewW = pc.width; previewH = pc.height;
    upload(0, texImage, pc);
    upload(1, texBlur, makeBlur(pc, pc.width, pc.height));
    canvas.width = previewW;
    canvas.height = previewH;
    els.viewer.classList.remove('hidden');
    els.drop.classList.add('hidden');
    els.export.disabled = false;
    els.hudSize.textContent = `${w}×${h}`;
    render();
  }

  async function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      prepare(bmp, bmp.width, bmp.height);
      return;
    } catch (e) { /* フォールバックへ */ }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { prepare(img, img.naturalWidth, img.naturalHeight); URL.revokeObjectURL(url); };
    img.onerror = () => { URL.revokeObjectURL(url); alert('この画像は開けませんでした。HEIC は Safari 以外では未対応です。JPEG に変換してからお試しください。'); };
    img.src = url;
  }

  // サンプル: 「眩しくて彩度が高い」iPhone っぽい写真を手続き的に描く
  function makeSample() {
    const w = 1600, h = 1067;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');

    // 空: ほぼ白飛びのグラデーション
    let g = x.createLinearGradient(0, 0, 0, h * 0.62);
    g.addColorStop(0, '#4f9cff');
    g.addColorStop(0.55, '#9dd0ff');
    g.addColorStop(1, '#f6fbff');
    x.fillStyle = g; x.fillRect(0, 0, w, h);

    // 太陽のフレア
    g = x.createRadialGradient(w * 0.72, h * 0.16, 0, w * 0.72, h * 0.16, w * 0.35);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.15, 'rgba(255,250,235,0.9)');
    g.addColorStop(1, 'rgba(255,240,200,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);

    // 雲
    x.fillStyle = 'rgba(255,255,255,0.9)';
    [[200, 160, 180, 40], [330, 140, 120, 32], [1100, 260, 220, 42], [1250, 240, 140, 30]].forEach(([cx, cy, rx, ry]) => {
      x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); x.fill();
    });

    // 遠景のビル (少し青っぽい)
    const far = ['#7fa8c8', '#8fb4d0', '#6f9cc0', '#86aecb', '#79a4c6'];
    let bx = 0;
    for (let i = 0; bx < w; i++) {
      const bw = 90 + ((i * 53) % 140);
      const bh = 180 + ((i * 97) % 260);
      x.fillStyle = far[i % far.length];
      x.fillRect(bx, h * 0.62 - bh, bw - 8, bh);
      bx += bw;
    }

    // 近景の建物
    x.fillStyle = '#d8c7a8'; x.fillRect(0, 360, 420, 400);
    x.fillStyle = '#c8b28c'; x.fillRect(0, 360, 420, 24);
    x.fillStyle = '#eee6d3'; x.fillRect(430, 300, 360, 460);
    x.fillStyle = '#b8402f'; x.fillRect(1180, 340, 420, 420);
    x.fillStyle = '#9b3123'; x.fillRect(1180, 340, 420, 20);

    // 窓
    for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) {
      x.fillStyle = (r + q) % 3 === 0 ? '#ffe9a8' : '#3b5570';
      x.fillRect(30 + q * 95, 410 + r * 80, 55, 50);
      x.fillStyle = '#2f3b48';
      x.fillRect(1215 + q * 95, 380 + r * 80, 55, 55);
    }
    // 看板 (彩度の塊)
    x.fillStyle = '#ff3b1f'; x.fillRect(460, 330, 300, 80);
    x.fillStyle = '#ffffff'; x.font = 'bold 44px sans-serif'; x.fillText('SUPER MARKET', 480, 386);
    x.fillStyle = '#ffd400'; x.fillRect(830, 470, 320, 60);
    x.fillStyle = '#1a1a1a'; x.font = 'bold 36px sans-serif'; x.fillText('COFFEE  ・  珈琲', 850, 514);

    // 日除け(オレンジ)
    x.fillStyle = '#ff8a1f';
    for (let i = 0; i < 6; i++) {
      x.fillStyle = i % 2 ? '#ff8a1f' : '#ffffff';
      x.fillRect(430 + i * 60, 560, 60, 40);
    }
    x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(430, 600, 360, 12);

    // 木 (緑が派手)
    g = x.createRadialGradient(1000, 520, 20, 1000, 520, 140);
    g.addColorStop(0, '#7cff4a'); g.addColorStop(1, '#1f8a1e');
    x.fillStyle = g; x.beginPath(); x.arc(1000, 520, 130, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#5a3a22'; x.fillRect(985, 620, 30, 140);

    // 道路
    g = x.createLinearGradient(0, 760, 0, h);
    g.addColorStop(0, '#8d8f93'); g.addColorStop(1, '#4b4d52');
    x.fillStyle = g; x.fillRect(0, 760, w, h - 760);
    x.fillStyle = '#e9e9e9';
    for (let i = 0; i < 8; i++) x.fillRect(80 + i * 200, 905, 120, 14);
    // 横断歩道
    for (let i = 0; i < 12; i++) { x.fillStyle = 'rgba(255,255,255,0.85)'; x.fillRect(120 + i * 120, 990, 70, 70); }

    // 人影と赤い傘
    x.fillStyle = '#23232a'; x.fillRect(640, 700, 40, 130); x.beginPath(); x.arc(660, 690, 22, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#ff2d55'; x.beginPath(); x.arc(660, 655, 70, Math.PI, Math.PI * 2); x.fill();

    // 手前に自転車のような影
    x.fillStyle = 'rgba(0,0,0,0.35)'; x.beginPath(); x.ellipse(700, 850, 160, 18, 0, 0, Math.PI * 2); x.fill();

    // グレースケール & カラーチャート (下端)
    const sw = w / 16;
    for (let i = 0; i < 16; i++) {
      const v = Math.round(255 * i / 15);
      x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i * sw, h - 46, sw, 24);
    }
    ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080', '#f2c9a8', '#b07a52', '#5a3b2a', '#ffffff'].forEach((col, i) => {
      x.fillStyle = col; x.fillRect(i * sw, h - 22, sw, 22);
    });

    // 全体に「明るすぎ」を演出
    x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(0, 0, w, h);
    return c;
  }

  // ---------------------------------------------------------------------------
  // 状態と描画
  // ---------------------------------------------------------------------------
  const state = { ...DEFAULTS };
  let activePreset = 'standard';
  let split = 0;            // 0 = 比較オフ、それ以外は左側が元画像になる x (0..1)
  let compareOn = false;
  let holdOriginal = false;
  let seed = Math.random() * 100;

  const els = {
    stage: document.getElementById('stage'),
    drop: document.getElementById('drop'),
    viewer: document.getElementById('viewer'),
    splitHandle: document.getElementById('splitHandle'),
    presets: document.getElementById('presets'),
    sliders: document.getElementById('sliders'),
    export: document.getElementById('export'),
    reset: document.getElementById('reset'),
    compare: document.getElementById('compare'),
    file: document.getElementById('file'),
    sample: document.getElementById('sample'),
    hudPreset: document.getElementById('hudPreset'),
    hudSize: document.getElementById('hudSize'),
    hudHold: document.getElementById('hudHold'),
  };

  function setUniforms(w, h, grainScale) {
    gl.uniform2f(U.u_texel, 1 / w, 1 / h);
    gl.uniform1f(U.u_exposure, state.exposure);
    gl.uniform1f(U.u_highlights, state.highlights);
    gl.uniform1f(U.u_shadows, state.shadows);
    gl.uniform1f(U.u_contrast, state.contrast);
    gl.uniform1f(U.u_fade, state.fade);
    gl.uniform1f(U.u_clarity, state.clarity);
    gl.uniform1f(U.u_saturation, state.saturation);
    gl.uniform1f(U.u_temp, state.temp);
    gl.uniform1f(U.u_tint, state.tint);
    gl.uniform1f(U.u_splitAmount, state.splitAmount);
    gl.uniform1f(U.u_sharpen, state.sharpen);
    gl.uniform1f(U.u_grain, state.grain);
    gl.uniform1f(U.u_grainSize, Math.max(1, state.grainSize * grainScale));
    gl.uniform1f(U.u_vignette, state.vignette);
    gl.uniform1f(U.u_mono, state.mono);
    gl.uniform1f(U.u_seed, seed);
    gl.uniform3fv(U.u_monoMix, state.monoMix);
    gl.uniform3fv(U.u_shadowTint, state.shadowTint);
    gl.uniform3fv(U.u_highlightTint, state.highlightTint);
    // GLSL の mat3 は列優先。行優先で書いた配列を転置して渡す
    const m = state.colorMatrix;
    gl.uniformMatrix3fv(U.u_colorMatrix, false, new Float32Array([m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]));
  }

  let raf = 0;
  function render() {
    if (!source) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      setUniforms(canvas.width, canvas.height, 1);
      gl.uniform1f(U.u_split, holdOriginal ? 2 : (compareOn ? split : 0));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
  }

  // ---------------------------------------------------------------------------
  // UI: プリセット
  // ---------------------------------------------------------------------------
  function applyPreset(id, keepUser) {
    const preset = PRESETS.find(p => p.id === id) || PRESETS[0];
    activePreset = preset.id;
    Object.assign(state, DEFAULTS, preset.p);
    els.hudPreset.textContent = preset.name;
    for (const b of els.presets.children) b.classList.toggle('active', b.dataset.id === preset.id);
    syncSliders();
    render();
    void keepUser;
  }

  PRESETS.forEach(p => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.dataset.id = p.id;
    b.textContent = p.name;
    b.title = p.desc;
    b.addEventListener('click', () => applyPreset(p.id));
    els.presets.appendChild(b);
  });

  // ---------------------------------------------------------------------------
  // UI: スライダー
  // ---------------------------------------------------------------------------
  const sliderInputs = {};
  PARAM_DEFS.forEach(d => {
    if (d.section) {
      const row = document.createElement('div');
      row.className = 'slider section';
      row.innerHTML = `<label>${d.section}</label>`;
      els.sliders.appendChild(row);
      return;
    }
    const row = document.createElement('div');
    row.className = 'slider';
    const id = `p_${d.key}`;
    row.innerHTML = `
      <label for="${id}" ${d.hint ? `title="${d.hint}"` : ''}>${d.label}</label>
      <output for="${id}"></output>
      <input id="${id}" type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.def}">
    `;
    const input = row.querySelector('input');
    const out = row.querySelector('output');
    input.addEventListener('input', () => {
      state[d.key] = parseFloat(input.value);
      out.value = fmt(state[d.key]);
      render();
    });
    sliderInputs[d.key] = { input, out };
    els.sliders.appendChild(row);
  });

  function fmt(v) { return (Math.abs(v) < 0.005 ? 0 : v).toFixed(2).replace(/\.?0+$/, '') || '0'; }

  function syncSliders() {
    for (const key in sliderInputs) {
      const { input, out } = sliderInputs[key];
      input.value = state[key];
      out.value = fmt(state[key]);
    }
  }

  els.reset.addEventListener('click', () => applyPreset(activePreset));

  // ---------------------------------------------------------------------------
  // UI: 比較 (スプリット / 長押し)
  // ---------------------------------------------------------------------------
  function positionHandle() {
    els.splitHandle.style.left = `${split * 100}%`;
  }
  els.compare.addEventListener('click', () => {
    compareOn = !compareOn;
    els.compare.classList.toggle('active', compareOn);
    els.splitHandle.classList.toggle('hidden', !compareOn);
    if (compareOn && split === 0) split = 0.5;
    positionHandle();
    render();
  });

  let dragging = false;
  function pointerSplit(e) {
    const r = canvas.getBoundingClientRect();
    split = Math.min(0.995, Math.max(0.005, (e.clientX - r.left) / r.width));
    positionHandle();
    render();
  }
  els.splitHandle.addEventListener('pointerdown', e => { dragging = true; els.splitHandle.setPointerCapture(e.pointerId); e.preventDefault(); });
  els.splitHandle.addEventListener('pointermove', e => { if (dragging) pointerSplit(e); });
  els.splitHandle.addEventListener('pointerup', () => { dragging = false; });
  els.splitHandle.addEventListener('pointercancel', () => { dragging = false; });

  // 長押しで元画像
  let holdTimer = 0;
  canvas.addEventListener('pointerdown', e => {
    if (compareOn) { dragging = true; canvas.setPointerCapture(e.pointerId); pointerSplit(e); return; }
    holdTimer = setTimeout(() => { holdOriginal = true; els.hudHold.textContent = '元画像'; render(); }, 180);
  });
  canvas.addEventListener('pointermove', e => { if (dragging && compareOn) pointerSplit(e); });
  const release = () => {
    dragging = false;
    clearTimeout(holdTimer);
    if (holdOriginal) { holdOriginal = false; els.hudHold.textContent = '長押しで元画像'; render(); }
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', release);
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  // ---------------------------------------------------------------------------
  // UI: 読み込み
  // ---------------------------------------------------------------------------
  els.file.addEventListener('change', () => { loadFile(els.file.files[0]); els.file.value = ''; });
  els.sample.addEventListener('click', () => { const c = makeSample(); prepare(c, c.width, c.height); });

  ['dragenter', 'dragover'].forEach(ev => els.stage.addEventListener(ev, e => { e.preventDefault(); els.drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => els.stage.addEventListener(ev, e => { e.preventDefault(); els.drop.classList.remove('over'); }));
  els.stage.addEventListener('drop', e => { const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) loadFile(f); });
  document.addEventListener('paste', e => {
    const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
    if (item) loadFile(item.getAsFile());
  });

  // ---------------------------------------------------------------------------
  // 書き出し
  // ---------------------------------------------------------------------------
  async function exportImage() {
    if (!source) return;
    els.export.disabled = true;
    const label = els.export.textContent;
    els.export.textContent = '処理中…';
    try {
      const scale = fitScale(srcW, srcH, EXPORT_MAX);
      const fc = drawScaled(source, srcW * scale, srcH * scale);
      upload(0, texImage, fc);
      upload(1, texBlur, makeBlur(fc, fc.width, fc.height));
      canvas.width = fc.width; canvas.height = fc.height;
      gl.viewport(0, 0, fc.width, fc.height);
      setUniforms(fc.width, fc.height, fc.width / previewW);
      gl.uniform1f(U.u_split, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.93));

      // プレビューへ戻す
      const pc = drawScaled(source, srcW * previewScale, srcH * previewScale);
      upload(0, texImage, pc);
      upload(1, texBlur, makeBlur(pc, pc.width, pc.height));
      canvas.width = previewW; canvas.height = previewH;
      render();

      const name = `gr-look-${activePreset}-${Date.now()}.jpg`;
      const file = new File([blob], name, { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'GR Look' }); return; } catch (e) { if (e.name === 'AbortError') return; }
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    } finally {
      els.export.textContent = label;
      els.export.disabled = false;
    }
  }
  els.export.addEventListener('click', exportImage);

  // ---------------------------------------------------------------------------
  // 初期化
  // ---------------------------------------------------------------------------
  applyPreset('standard');
  window.GRLook = { state, PRESETS, applyPreset, loadSample: () => els.sample.click() };
})();
