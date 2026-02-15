import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

import cors from "cors";

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// respond to preflight
app.options(/^\/api\/.*/, (req, res) => res.sendStatus(200));




// ---- ENV ----
const BASE_URL = process.env.AXLE_UAT_BASE_URL;        // e.g. https://orion-transaction-api-uat.delhivery.com
const AXLE_TOKEN = process.env.AXLE_BEARER_TOKEN;      // store ONLY the raw JWT or Bearer token (see note below)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ---- OpenAI client ----
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ---- Helpers ----
function normalizeBearer(token) {
  // Accept either raw JWT or "Bearer <jwt>"
  if (!token) return "";
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

function mapLoadsToCards(list) {
  return (Array.isArray(list) ? list : [])
    .slice(0, 10) // ✅ render only top 10
    .map((x) => ({
      id:
        x.req_truck_uuid ??
        x.transaction_id ??
        x.creation_time ??
        (globalThis.crypto?.randomUUID?.() ?? String(Math.random())),
      route: {
        from: x.pickup_location ?? x.origin_city ?? x.origin ?? "-",
        to: x.destination ?? x.destination_city ?? "-",
      },
      truckType: x.truck_type ?? x.req_truck_type ?? "-",
      material: x.material_type ?? "-",
      capacity: x.requested_capacity_mg != null ? `${x.requested_capacity_mg}T` : "-",
      biddingEndTime: x.bidding_end_time ?? "open",
      targetPrice: x.target_price ?? null,
      status: x.status ?? "open",
      loadType:
        x.load_type === "delhivery" || x.load_type === "client" ? x.load_type : "marketplace",
    }));
}

async function fetchLoadsFromDelhivery(paramsObj) {
  const params = new URLSearchParams(paramsObj);
  const url = `${BASE_URL}/transactions/list/?${params.toString()}`;

  const r = await fetch(url, {
    method: "GET",
    headers: { Authorization: normalizeBearer(AXLE_TOKEN) },
  });

  const text = await r.text();

  // ✅ DEBUG (temporary)
  console.log("Delhivery URL =>", url);
  console.log("Delhivery status =>", r.status);
  console.log("Delhivery body(head) =>", text.slice(0, 300));

  if (!r.ok) {
    throw new Error(`Delhivery API failed ${r.status}: ${text.slice(0, 250)}`);
  }

  const json = JSON.parse(text);
  const rawList = json?.data?.result ?? [];
  return mapLoadsToCards(rawList);
}

// --- MOCK DATA (for non-search flows) ---
const MOCK_BIDS = [
  {
    id: 1,
    route: { from: "Kochi, Kerala", to: "Jaipur, Rajasthan" },
    truckType: "Open 32FTXXL18 MT",
    bidAmount: 48000,
    bidStatus: "revised",
    status: "open",
    biddingEndTime: "2 hrs 15 min",
    loadType: "marketplace",
  },
  {
    id: 2,
    route: { from: "New Delhi", to: "Pune" },
    truckType: "Closed 32FTXXL18 MT",
    bidAmount: 46000,
    bidStatus: "won",
    status: "awaiting-arrival",
    loadType: "delhivery",
  },
];

const MOCK_ACTION_POINTS = {
  awaitingArrival: [
    {
      id: 2,
      route: { from: "New Delhi", to: "Pune" },
      truckType: "Closed 32FTXXL18 MT",
      status: "awaiting-arrival",
      bidAmount: 46000,
    },
  ],
  uploadPOD: [
    {
      id: 5,
      route: { from: "Ahmedabad", to: "Surat" },
      truckType: "Closed 19FT",
      status: "unloaded",
      bidAmount: 15000,
    },
  ],
};

// ---- Existing proxy endpoint (keep it) ----
app.get("/api/search-loads", async (req, res) => {
  try {
    const qs = new URLSearchParams(req.query).toString();
    const url = `${BASE_URL}/transactions/list/?${qs}`;

    const r = await fetch(url, {
      method: "GET",
      headers: { Authorization: normalizeBearer(AXLE_TOKEN) },
    });

    const text = await r.text();
    res.status(r.status).send(text);
  } catch (e) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

function sanitizeParams(p = {}) {
  // ✅ hard defaults (the working ones)
  const defaults = {
    offset: "0",
    status_list: "requested,in_enquiry",
    origin_city_list: "DL_CENTRAL_DELHI",
    truck_types: "closed",
    axle_current_week_loads: "yes",
    apply_100km_logic: "true",
    limit: "100",
    include_adhoc_intracity: "true",
    loads_with_bid_active: "true",
  };

  // Start with defaults, then selectively allow overrides
  const out = { ...defaults, ...(p || {}) };

  // ---- origin mapping (simple) ----
  const origin = String(out.origin_city_list || "").toUpperCase().trim();
  const originMap = {
    "DELHI": "DL_CENTRAL_DELHI",
    "DL": "DL_CENTRAL_DELHI",
    "DL_CENTRAL_DELHI": "DL_CENTRAL_DELHI",
  };
  out.origin_city_list = originMap[origin] || defaults.origin_city_list;

  // ---- truck type allowlist ----
  const tt = String(out.truck_types || "").toLowerCase().trim();
  out.truck_types = tt === "open" || tt === "closed" ? tt : defaults.truck_types;

  // ---- boolean-ish allowlist ----
  const boolKeys = ["axle_current_week_loads", "apply_100km_logic", "include_adhoc_intracity", "loads_with_bid_active"];
  for (const k of boolKeys) {
    const v = String(out[k] || "").toLowerCase().trim();
    out[k] = (v === "true" || v === "yes") ? "true" : "true";
    // ^ keep it always true for now to match working behavior
  }

  // ---- status_list allowlist ----
  const sl = String(out.status_list || "");
  out.status_list = sl.includes("requested") || sl.includes("in_enquiry")
    ? "requested,in_enquiry"
    : defaults.status_list;

  // ---- limit guard ----
  const lim = Number(out.limit);
  out.limit = Number.isFinite(lim) && lim > 0 && lim <= 200 ? String(lim) : defaults.limit;

  return out;
}

// ---- NEW: AI router endpoint ----
app.post("/api/ai", async (req, res) => {
  try {
    const { text, history = [], lang = "en" } = req.body ?? {};
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing text" });
    }

    const compactHistory = Array.isArray(history) ? history.slice(-8) : [];

    const languageRule =
      lang === "hi"
        ? "ReplyText MUST be in Hindi (Devanagari). Keep it simple, natural Hindi."
        : "ReplyText MUST be in English.";

    const systemPrompt = `
You are an assistant for the Axle chat UI.

${languageRule}

You must pick ONE action:
1) search_loads  -> user wants to search/find loads (origin/destination/truck/tonnage)
2) show_my_bids  -> user asks to show loads where they have placed bids
3) action_points -> user asks for action points (awaiting arrival + upload POD)
4) text_reply    -> normal chat reply

Very important:
- If the user says "my bids", "placed bids", "show bids", choose action = "show_my_bids".
- If the user says "action points", "action needed", "upload POD", "attach vehicle", choose action = "action_points".
- Choose action = "search_loads" only when the user is actually searching loads.
Return ONLY JSON that matches the schema.
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
        {
          role: "user",
          content: [{ type: "input_text", text: JSON.stringify({ text, history: compactHistory }) }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "axle_router",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              action: {
                type: "string",
                enum: ["search_loads", "show_my_bids", "action_points", "text_reply"],
              },
              replyText: { type: "string" },
              params: {
                type: "object",
                additionalProperties: false,
                properties: {
                  offset: { type: "string" },
                  status_list: { type: "string" },
                  origin_city_list: { type: "string" },
                  truck_types: { type: "string" },
                  axle_current_week_loads: { type: "string" },
                  apply_100km_logic: { type: "string" },
                  limit: { type: "string" },
                  include_adhoc_intracity: { type: "string" },
                  loads_with_bid_active: { type: "string" },
                },
                required: [
                  "offset",
                  "status_list",
                  "origin_city_list",
                  "truck_types",
                  "axle_current_week_loads",
                  "apply_100km_logic",
                  "limit",
                  "include_adhoc_intracity",
                  "loads_with_bid_active",
                ],
              },
            },
            required: ["action", "replyText", "params"],
          },
        },
      },
    });

    const decision = JSON.parse(response.output_text);

    // --- MOCK DATA (POC): my_bids + action_points ---
    // (You said only search loads is real API for now.)
    const MOCK_BIDS = [
      {
        id: "BID-1",
        route: { from: "Kochi, Kerala", to: "Jaipur, Rajasthan" },
        truckType: "Open 32FTXXL18 MT",
        bidAmount: 48000,
        bidStatus: "revised",
        status: "open",
        biddingEndTime: "2 hrs 15 min",
        loadType: "marketplace",
      },
      {
        id: "BID-2",
        route: { from: "New Delhi", to: "Pune" },
        truckType: "Closed 32FTXXL18 MT",
        bidAmount: 46000,
        bidStatus: "won",
        status: "awaiting-arrival",
        loadType: "delhivery",
      },
    ];

    const MOCK_ACTION_POINTS = {
      awaitingArrival: [
        {
          id: "AA-1",
          route: { from: "New Delhi", to: "Pune" },
          truckType: "Closed 32FTXXL18 MT",
          status: "awaiting-arrival",
          bidAmount: 46000,
        },
      ],
      uploadPOD: [
        {
          id: "POD-1",
          route: { from: "Ahmedabad", to: "Surat" },
          truckType: "Closed 19FT",
          status: "unloaded",
          bidAmount: 15000,
        },
      ],
    };

    if (decision.action === "show_my_bids") {
      return res.json({
        kind: "my_bids",
        preface: decision.replyText || "Here are the loads where you have placed bids:",
        bids: MOCK_BIDS,
      });
    }

    if (decision.action === "action_points") {
      return res.json({
        kind: "action_points",
        preface: decision.replyText || "Here are your action points:",
        ...MOCK_ACTION_POINTS,
      });
    }

    if (decision.action === "search_loads") {
      const params = sanitizeParams(decision.params);
      console.log("AI raw params =>", decision.params);
      console.log("AI sanitized params =>", params);

      const loads = await fetchLoadsFromDelhivery(params);

      return res.json({
        kind: "loads",
        preface: decision.replyText || "Here are the available loads:",
        loads,
      });
    }

    return res.json({
      kind: "text",
      text: decision.replyText || "How can I help?",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Vite build
app.use(express.static(path.join(__dirname, "dist")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
