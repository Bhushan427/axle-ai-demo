import express from "express";

const app = express();

const BASE_URL = process.env.AXLE_UAT_BASE_URL;
const TOKEN = process.env.AXLE_BEARER_TOKEN;

if (!BASE_URL || !TOKEN) {
  console.error("Missing AXLE_UAT_BASE_URL or AXLE_BEARER_TOKEN in .env");
  process.exit(1);
}

// Optional: log each request (helps debugging)
app.use((req, res, next) => {
  console.log("[proxy hit]", req.method, req.url);
  next();
});

app.get("/api/search-loads", async (req, res) => {
  try {
    const qs = new URLSearchParams(req.query).toString();
    const url = `${BASE_URL}/transactions/list/?${qs}`;

    const r = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: TOKEN.startsWith("Bearer ") ? TOKEN : `Bearer ${TOKEN}`,
      },
    });

    const json = await r.json();              // ✅ return JSON
    return res.status(r.status).json(json);   // ✅ proper content-type
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: { message: e.message },
    });
  }
});

app.listen(8787, () => console.log("Axle proxy running on http://localhost:8787"));
