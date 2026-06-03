const BRANDS = {
  google: {
    label: "Google",
    storeName: "Google concept store",
    logoDesc: "the iconic Google logo",
    paletteDesc: "Google, Google product, and Gemini color palettes (blue, red, yellow, green)",
  },
  facebook: {
    label: "Facebook (Meta)",
    storeName: "Facebook concept store",
    logoDesc: "the iconic Facebook 'f' logo and Meta infinity symbol",
    paletteDesc: "Facebook blue, Meta gradient (blue to purple to pink), and Messenger color palettes",
  },
  instagram: {
    label: "Instagram",
    storeName: "Instagram concept store",
    logoDesc: "the iconic Instagram camera logo",
    paletteDesc: "Instagram gradient (purple, pink, orange, yellow) and warm sunset color palettes",
  },
  starbucks: {
    label: "Starbucks",
    storeName: "Starbucks concept store and café",
    logoDesc: "the iconic Starbucks twin-tailed siren logo",
    paletteDesc: "Starbucks deep green, cream white, and rich espresso brown color palettes",
  },
  mcdonalds: {
    label: "McDonald's",
    storeName: "McDonald's concept restaurant",
    logoDesc: "the iconic McDonald's golden arches",
    paletteDesc: "McDonald's red and golden yellow color palettes with a playful Happy Meal vibe",
  },
  apple: {
    label: "Apple",
    storeName: "Apple concept store",
    logoDesc: "the iconic minimalist Apple logo",
    paletteDesc: "Apple minimalist silver, white, brushed aluminum, and space gray color palettes",
  },
  nike: {
    label: "Nike",
    storeName: "Nike concept store",
    logoDesc: "the iconic Nike swoosh",
    paletteDesc: "Nike monochrome black and white with accent volt and orange color palettes",
  },
  disney: {
    label: "Disney",
    storeName: "Disney concept store",
    logoDesc: "the iconic Disney castle silhouette and cursive Disney logo",
    paletteDesc: "Disney magical pastels with deep castle blue, gold, and fairy-tale pink color palettes",
  },
  lego: {
    label: "Lego",
    storeName: "Lego concept store",
    logoDesc: "the iconic Lego brick and red square logo",
    paletteDesc: "Lego primary color palettes (red, yellow, blue, green) with glossy plastic brick textures",
  },
  nintendo: {
    label: "Nintendo",
    storeName: "Nintendo concept store",
    logoDesc: "the iconic Nintendo red logo with hints of Mario, Zelda, and Pokémon iconography",
    paletteDesc: "Nintendo red and white with playful Mario, Pikachu yellow, and Zelda green accent color palettes",
  },
};

// Curated list of recognisable cities, grouped by region. Each entry is the exact
// string sent to the image-generation prompt (no country suffix needed — the model
// resolves the famous landmarks).
const CITIES = {
  "Asia": [
    "Tokyo",
    "Kyoto",
    "Osaka",
    "Hong Kong",
    "Singapore",
    "Seoul",
    "Bangkok",
    "Mumbai",
    "Shanghai",
    "Taipei",
  ],
  "Middle East · Africa": [
    "Dubai",
    "Istanbul",
    "Cairo",
    "Marrakech",
    "Cape Town",
  ],
  "Europe": [
    "Athens",
    "Rome",
    "Venice",
    "Paris",
    "Barcelona",
    "Lisbon",
    "Amsterdam",
    "London",
    "Prague",
    "Stockholm",
    "Reykjavík",
    "Berlin",
  ],
  "Oceania": [
    "Sydney",
    "Auckland",
  ],
  "Americas": [
    "New York",
    "San Francisco",
    "Chicago",
    "Las Vegas",
    "Toronto",
    "Mexico City",
    "Rio de Janeiro",
    "Buenos Aires",
  ],
};

// Aspect ratios mapped to gpt-image-2 sizes (must match the server-side allowlist).
// `composition` is appended to the prompt as a framing hint only — it must not
// duplicate content instructions (e.g. landmarks) or the model crams the scene.
const ASPECTS = {
  portrait: {
    label: "Portrait — 2 : 3 縦判",
    size: "1024x1536",
    display: "2 : 3 portrait",
    composition: "Composed as a tall 2:3 portrait, with the storefront centred and breathing room above and below",
  },
  square: {
    label: "Square — 1 : 1 正方",
    size: "1024x1024",
    display: "1 : 1 square",
    composition: "Composed as a balanced 1:1 square, with the storefront centred in the frame",
  },
  landscape: {
    label: "Landscape — 3 : 2 横判",
    size: "1536x1024",
    display: "3 : 2 landscape",
    composition: "Composed as a wide 3:2 landscape, with the storefront occupying the centre and the scene extending horizontally to the sides",
  },
};

const STORAGE_KEY = "city_merge_openai_key";
const BRAND_STORAGE_KEY = "city_merge_brand";
const ASPECT_STORAGE_KEY = "city_merge_aspect";
const CITY1_STORAGE_KEY = "city_merge_city1";
const CITY2_STORAGE_KEY = "city_merge_city2";
const ACCESS_STORAGE_KEY = "city_merge_access_code";
const MODEL = "gpt-image-2";
const NO_SECOND_SITE = "";

// Storage can throw in restricted contexts (Brave shields, third-party cookies blocked,
// some in-app WebViews). Wrap so a SecurityError doesn't kill module initialization.
const safeStorage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
};

const $ = (id) => document.getElementById(id);

const subtitleEl = $("subtitle");
const brandSelect = $("brand");
const aspectSelect = $("aspect");
const city1Select = $("city1");
const city2Select = $("city2");
const promptPreview = $("promptPreview");
const apiKeyInput = $("apiKey");
const saveKeyBtn = $("saveKey");
const keyStatus = $("keyStatus");
const accessInput = $("accessCode");
const accessStatus = $("accessStatus");
const form = $("generateForm");
const generateBtn = $("generateBtn");
const resultSection = $("resultSection");
const resultStatus = $("resultStatus");
const resultImages = $("resultImages");
const copyPromptBtn = $("copyPrompt");
const colophonAspect = $("colophonAspect");

const allCities = Object.values(CITIES).flat();
const isValidCity = (c) => allCities.includes(c);

function populateBrandSelect() {
  Object.entries(BRANDS).forEach(([key, brand]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = brand.label;
    brandSelect.appendChild(opt);
  });
  const stored = safeStorage.get(BRAND_STORAGE_KEY);
  if (stored && BRANDS[stored]) {
    brandSelect.value = stored;
  }
}

// Aspect is rendered as a segmented control (`<button role="radio">` triplet)
// rather than a native select, so all reads/writes go through these helpers.
function getAspectKey() {
  const active = aspectSelect.querySelector('[aria-checked="true"]');
  return (active && ASPECTS[active.dataset.value]) ? active.dataset.value : "portrait";
}
function setAspectKey(key) {
  if (!ASPECTS[key]) return;
  aspectSelect.querySelectorAll("button[data-value]").forEach((b) => {
    b.setAttribute("aria-checked", String(b.dataset.value === key));
  });
}
function initAspectSegmented() {
  const stored = safeStorage.get(ASPECT_STORAGE_KEY);
  if (stored && ASPECTS[stored]) setAspectKey(stored);
  aspectSelect.querySelectorAll("button[data-value]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.value;
      setAspectKey(key);
      safeStorage.set(ASPECT_STORAGE_KEY, key);
      updateColophonAspect();
      updatePromptPreview();
    });
  });
}

function populateCitySelect(select, { includeNone, storageKey, fallback }) {
  if (includeNone) {
    const opt = document.createElement("option");
    opt.value = NO_SECOND_SITE;
    opt.textContent = "— No second site —";
    select.appendChild(opt);
  }
  Object.entries(CITIES).forEach(([region, list]) => {
    const group = document.createElement("optgroup");
    group.label = region;
    list.forEach((city) => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      group.appendChild(opt);
    });
    select.appendChild(group);
  });
  const stored = safeStorage.get(storageKey);
  if (stored !== null && (stored === NO_SECOND_SITE || isValidCity(stored))) {
    select.value = stored;
  } else if (fallback !== undefined) {
    select.value = fallback;
  }
}

function buildPrompt(brandKey, city1, city2, aspectKey) {
  const brand = BRANDS[brandKey] || BRANDS.google;
  const aspect = ASPECTS[aspectKey] || ASPECTS.portrait;
  const cities = [city1, city2].map((c) => c.trim()).filter(Boolean);
  let cityPart;
  if (cities.length >= 2) {
    cityPart = `a miniature cityscape that creatively merges ${cities[0]} and ${cities[1]}, featuring landmarks from both cities`;
  } else if (cities.length === 1) {
    cityPart = `a miniature ${cities[0]} cityscape, featuring its iconic landmarks`;
  } else {
    cityPart = `a miniature dreamlike cityscape with whimsical landmarks`;
  }

  return `A creatively designed two-story ${brand.storeName} inspired by ${brand.logoDesc}. The building features expansive glass windows revealing a cozy, intricately decorated interior and an innovative, brand-inspired ceiling design. The space is filled with warm lighting and busy staff wearing brand-themed outfits, decorated with ${brand.paletteDesc}. The scene is set in ${cityPart}. Adorable small figures walk the streets or sit on benches, surrounded by streetlamps and potted plants. Rendered in Cinema 4D with a blind box toy aesthetic, rich in detail and realism, bathed in the soft, relaxing glow of a late afternoon. ${aspect.composition}.`;
}

function currentBrand() {
  return BRANDS[brandSelect.value] || BRANDS.google;
}
function currentAspect() {
  return ASPECTS[getAspectKey()];
}

function updateSubtitle() {
  const brand = currentBrand().label;
  subtitleEl.textContent = `Pick a brand, a format, and one or two cities. We render a Cinema 4D blind-box miniature of a ${brand} concept store, lit by warm late-afternoon light.`;
}

function updatePromptPreview() {
  promptPreview.textContent = buildPrompt(
    brandSelect.value,
    city1Select.value,
    city2Select.value,
    getAspectKey(),
  );
}

function updateColophonAspect() {
  if (colophonAspect) colophonAspect.textContent = currentAspect().display;
}

function loadStoredKey() {
  const stored = safeStorage.get(STORAGE_KEY);
  if (stored) {
    apiKeyInput.value = stored;
    keyStatus.textContent = "Saved";
    keyStatus.style.color = "var(--text-soft)";
  }
}

function setAccessStatus(text, state) {
  accessStatus.textContent = text;
  if (state) {
    accessStatus.dataset.state = state;
  } else {
    delete accessStatus.dataset.state;
  }
}

function loadStoredAccess() {
  const stored = safeStorage.get(ACCESS_STORAGE_KEY);
  if (stored) {
    accessInput.value = stored;
    setAccessStatus("Saved", "saved");
  } else {
    setAccessStatus("Required");
  }
}

accessInput.addEventListener("input", () => {
  const value = accessInput.value.trim();
  if (value) {
    safeStorage.set(ACCESS_STORAGE_KEY, value);
    setAccessStatus("Saved", "saved");
  } else {
    safeStorage.set(ACCESS_STORAGE_KEY, "");
    setAccessStatus("Required");
  }
});

saveKeyBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    keyStatus.textContent = "Enter a key first";
    keyStatus.style.color = "var(--accent-hover)";
    return;
  }
  const ok = safeStorage.set(STORAGE_KEY, key);
  keyStatus.textContent = ok ? "Saved" : "Storage unavailable";
  keyStatus.style.color = ok ? "var(--text-soft)" : "var(--accent-hover)";
});

brandSelect.addEventListener("change", () => {
  safeStorage.set(BRAND_STORAGE_KEY, brandSelect.value);
  updateSubtitle();
  updatePromptPreview();
});
city1Select.addEventListener("change", () => {
  safeStorage.set(CITY1_STORAGE_KEY, city1Select.value);
  updatePromptPreview();
});
city2Select.addEventListener("change", () => {
  safeStorage.set(CITY2_STORAGE_KEY, city2Select.value);
  updatePromptPreview();
});

copyPromptBtn.addEventListener("click", async () => {
  const original = copyPromptBtn.textContent;
  try {
    await navigator.clipboard.writeText(promptPreview.textContent);
    copyPromptBtn.textContent = "Copied";
  } catch (e) {
    copyPromptBtn.textContent = "Couldn't copy";
  }
  setTimeout(() => (copyPromptBtn.textContent = original), 1500);
});

function setStatus(message, type = "") {
  resultStatus.className = `status ${type}`;
  resultStatus.replaceChildren();
  if (type === "loading") {
    const spinner = document.createElement("span");
    spinner.className = "spinner";
    resultStatus.append(spinner);
  }
  resultStatus.append(message);
}

// Surfaced for the submit handler so it can distinguish "access denied" from generic errors.
class AccessDeniedError extends Error {
  constructor(message) {
    super(message);
    this.name = "AccessDeniedError";
  }
}

async function callProxy(prompt, size, accessCode) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, model: MODEL, size, accessCode }),
  });
  // Only 404 (route absent) triggers BYO-key fallback. Anything else — including 503 (server
  // deployed but unconfigured) — is a real proxy error and must surface so we don't silently
  // bill the user's personal key on what should be a server-mediated path.
  if (res.status === 404) return null;
  if (res.status === 401) {
    throw new AccessDeniedError("Access code is missing or incorrect.");
  }
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Proxy error ${res.status}: ${errorText}`);
  }
  const data = await res.json();
  return data.images || [];
}

async function callOpenAIDirect(prompt, size, apiKey) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      n: 1,
      size,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  return (data.data || []).map((d) => d.b64_json).filter(Boolean);
}

async function generateImage(prompt, size, accessCode) {
  const proxied = await callProxy(prompt, size, accessCode);
  if (proxied) return proxied;

  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    throw new Error("Server proxy not found and no local API key. Set one in the panel below.");
  }
  return callOpenAIDirect(prompt, size, apiKey);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const c1 = city1Select.value;
  if (!c1 || !isValidCity(c1)) {
    resultSection.hidden = false;
    setStatus("Please pick a primary site.", "error");
    return;
  }
  // city2 is optional, but if set must be valid
  const c2 = city2Select.value;
  if (c2 && !isValidCity(c2)) {
    resultSection.hidden = false;
    setStatus("Invalid secondary site.", "error");
    return;
  }

  const aspect = currentAspect();
  const prompt = buildPrompt(brandSelect.value, c1, c2, getAspectKey());
  const accessCode = accessInput.value.trim();
  resultSection.hidden = false;
  resultImages.innerHTML = "";
  delete resultImages.dataset.caption;
  setStatus("Generating — usually 10 to 40 seconds.", "loading");
  generateBtn.disabled = true;

  try {
    const images = await generateImage(prompt, aspect.size, accessCode);
    if (images.length === 0) {
      setStatus("Nothing came back. Adjust the brief and try again.", "error");
      return;
    }
    setStatus(`Done — ${images.length} image${images.length > 1 ? "s" : ""}.`, "success");
    const brand = currentBrand().label;
    const sites = c2 ? `${c1} × ${c2}` : c1;
    resultImages.dataset.caption = `${brand} concept store · ${sites} · ${aspect.display}`;
    const alt = `${brand} concept store rendered in ${sites}, ${aspect.display}`;
    images.forEach((b64) => {
      const img = document.createElement("img");
      img.src = `data:image/png;base64,${b64}`;
      img.alt = alt;
      resultImages.appendChild(img);
    });
  } catch (err) {
    if (err instanceof AccessDeniedError) {
      setStatus("Access denied — check your code and try again.", "error");
      setAccessStatus("Invalid", "error");
      accessInput.focus();
      accessInput.select();
    } else {
      setStatus(`Error: ${err.message}`, "error");
    }
  } finally {
    generateBtn.disabled = false;
  }
});

populateBrandSelect();
initAspectSegmented();
populateCitySelect(city1Select, { includeNone: false, storageKey: CITY1_STORAGE_KEY, fallback: "Tokyo" });
populateCitySelect(city2Select, { includeNone: true, storageKey: CITY2_STORAGE_KEY, fallback: "Sydney" });
loadStoredKey();
loadStoredAccess();
updateSubtitle();
updatePromptPreview();
updateColophonAspect();
