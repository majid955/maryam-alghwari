import { Router } from "express";

const router = Router();

function normalizeOmanPhone(raw: string): string {
  let d = (raw || "").replace(/[^\d+]/g, "");
  d = d.replace(/^\+/, "");
  if (d.indexOf("00968") === 0) d = d.slice(5);
  else if (d.indexOf("968") === 0 && d.length > 8) d = d.slice(3);
  return d;
}

router.post("/contact", async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.name || "").trim();
    const service = String(body.service || "").trim();
    const message = String(body.message || "").trim();
    const phoneRaw = String(body.phone || "").trim();

    if (!name || !phoneRaw || !service) {
      res.status(400).json({ ok: false, error: "missing_fields" });
      return;
    }

    const local = normalizeOmanPhone(phoneRaw);
    if (!/^[79]\d{7}$/.test(local)) {
      res.status(400).json({ ok: false, error: "invalid_phone" });
      return;
    }

    const endpoint = process.env.BOOKING_SHEET_URL;
    if (!endpoint || !/^https:\/\/script\.google\.com\//.test(endpoint)) {
      res.status(503).json({ ok: false, error: "not_configured" });
      return;
    }

    const payload = {
      name: name.slice(0, 200),
      phone: "+968 " + local,
      service: service.slice(0, 200),
      message: message.slice(0, 2000),
    };

    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await upstream.json().catch(() => ({}))) as {
      ok?: boolean;
    };

    if (!upstream.ok || data.ok !== true) {
      res.status(502).json({ ok: false, error: "upstream_failed" });
      return;
    }

    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "server_error" });
  }
});

export default router;
