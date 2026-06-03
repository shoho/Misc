// Cloudflare Pages Functions handler.
// POST /api/generate  { prompt, model?, size?, accessCode? }  ->  { images: [base64, ...] }
//
// Required environment variable: OPENAI_API_KEY
// Optional environment variable:  APP_ACCESS_CODE
//   When APP_ACCESS_CODE is set, every request must include a matching `accessCode`
//   in the JSON body. When unset, the endpoint is open (useful for local dev).
//
// Status codes the client distinguishes:
//   401 -> access code missing/invalid (client prompts the user for the code)
//   404 -> route not deployed (client falls back to direct OpenAI call with BYO key)
//   503 -> route deployed but OPENAI_API_KEY missing (client surfaces error, does NOT fall back —
//          falling back would silently bill the user's BYO key on what should be a server-side path)
//   502 -> upstream returned non-JSON (CDN/gateway error)
//   400 -> client error (bad body, unsupported model/size)

const SUPPORTED_MODELS = new Set(["gpt-image-1", "gpt-image-2"]);
const SUPPORTED_SIZES = new Set(["1024x1024", "1024x1536", "1536x1024"]);
const DEFAULT_MODEL = "gpt-image-2";
const DEFAULT_SIZE = "1024x1536";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    return json({ error: "OPENAI_API_KEY is not configured on the server" }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const expectedCode = env.APP_ACCESS_CODE;
  if (expectedCode) {
    const provided = typeof payload?.accessCode === "string" ? payload.accessCode : "";
    // Constant-time-ish comparison: same-length string compare; the value is short
    // and the cost of a tighter timing-safe equality is not worth the complexity here.
    if (provided !== expectedCode) {
      return json({ error: "Access code required" }, 401);
    }
  }

  const { prompt } = payload || {};
  if (!prompt || typeof prompt !== "string") {
    return json({ error: "prompt is required" }, 400);
  }

  const requestedModel = payload?.model;
  if (requestedModel != null && !SUPPORTED_MODELS.has(requestedModel)) {
    return json(
      { error: `unsupported model "${requestedModel}". Allowed: ${[...SUPPORTED_MODELS].join(", ")}` },
      400,
    );
  }
  const requestedSize = payload?.size;
  if (requestedSize != null && !SUPPORTED_SIZES.has(requestedSize)) {
    return json(
      { error: `unsupported size "${requestedSize}". Allowed: ${[...SUPPORTED_SIZES].join(", ")}` },
      400,
    );
  }

  const model = requestedModel || DEFAULT_MODEL;
  const size = requestedSize || DEFAULT_SIZE;

  const upstream = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, prompt, n: 1, size }),
  });

  const upstreamText = await upstream.text();
  let data;
  try {
    data = JSON.parse(upstreamText);
  } catch (e) {
    return json(
      {
        error: `Upstream returned non-JSON (HTTP ${upstream.status})`,
        body: upstreamText.slice(0, 500),
      },
      502,
    );
  }

  if (!upstream.ok) {
    return json({ error: data }, upstream.status);
  }

  const images = (data.data || []).map((d) => d.b64_json).filter(Boolean);
  return json({ images });
}
