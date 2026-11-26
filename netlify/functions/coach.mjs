// LEARNEVER Coach: server function that calls the Anthropic API.
// The API key lives only in Netlify (Site configuration > Environment variables > ANTHROPIC_API_KEY).
// It is never sent to the browser.
const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });

const SAFETY =
  "\nSAFETY ADDENDUM (server): You are an AI, say so if asked. If the learner seems distressed or mentions self-harm, " +
  "reply kindly and give Samaritans 116 123 (free, 24/7) and 999 in an emergency. Never ask for passwords, PINs, " +
  "card or bank details. Stay on everyday digital life. Write plain text only: no markdown, no asterisks, no bullet symbols. When the steps depend on the device, first ask which phone or tablet they use (iPhone or Android).";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && !origin.endsWith(host)) return json({ error: "Not allowed" }, 403);

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: "AI not configured" }, 503);

  let b;
  try { b = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
  const message = String(b.message || "").slice(0, 800);
  if (!message.trim()) return json({ error: "Empty message" }, 400);
  const system = String(b.system || "").slice(0, 6000) + SAFETY;
  const context = String(b.context || "").slice(0, 2500);
  const history = String(b.history || "").slice(0, 3000);
  const maxTokens = 1024; // room for the model; the system prompt keeps answers short

  const content =
    (context ? "Learner context (never repeat it):\n" + context + "\n\n" : "") +
    (history ? "Conversation so far:\n" + history + "\n\n" : "") +
    "User: " + message;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.MODEL || "claude-haiku-5-5",
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content }],
      }),
    });
    if (!r.ok) return json({ error: "AI service error " + r.status }, 502);
    const d = await r.json();
    const reply = (d.content || []).filter((c) => c.type === "text").map((c) => c.text).join("").trim();
    if (!reply) return json({ error: "Empty answer", stop: d.stop_reason, types: (d.content || []).map((c) => c.type) }, 502);
    return json({ reply });
  } catch (e) {
    return json({ error: "AI service unreachable" }, 502);
  }
};
