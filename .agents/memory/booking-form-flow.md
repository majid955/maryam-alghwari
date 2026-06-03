---
name: Trading-courses booking form flow
description: How the contact/booking form delivers requests (secure backend → Google Sheets + email)
---

# Booking form delivery (trading-courses)

Flow: browser form (`handleContactForm` in `index.html`) → POST `/api/contact`
(same-origin, proxied by `server.js` to the Express api-server) → server forwards
to a Google Apps Script Web App → Apps Script appends a row to the owner's Google
Sheet AND emails the owner. Apps Script chosen because the owner declined the
Replit Gmail OAuth integration and wanted a free, self-managed method.

**Privacy requirement (hard constraint):** the Apps Script URL, Spreadsheet ID,
and any Google key must NEVER appear in frontend code. The Apps Script URL lives
only as the server env secret `BOOKING_SHEET_URL`, read by `routes/contact.ts`.
The browser only ever sees `/api/contact` and a success/error result — it cannot
read or download sheet data (Apps Script doPost is write-only).
**Why:** explicit owner privacy demand. Do not "simplify" by POSTing from the
browser straight to the Apps Script URL — that re-exposes the endpoint.

**CORS note:** server→Apps Script uses `application/json` (no browser, no CORS).
If you ever call Apps Script *from the browser* instead, you must switch to
`Content-Type: text/plain;charset=utf-8` to avoid a preflight Apps Script can't handle.

**Phone validation (both client and server):** Oman only. Strip non-digits, drop
leading +/00968/968, then require `^[79]\d{7}$` (8 digits starting 7 or 9).
Stored/sent as `+968 <local>`.

**Sheet columns** (Apps Script auto-creates header row): تاريخ ووقت الإرسال،
الاسم الكامل، رقم الهاتف، الخدمة المختارة، الرسالة، حالة الطلب (always "جديد").
