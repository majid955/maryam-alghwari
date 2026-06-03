---
name: Trading-courses booking form flow
description: How the contact/booking form delivers requests (Google Sheets + email)
---

# Booking form delivery (trading-courses)

The booking form (`handleContactForm` in `index.html`) POSTs to a Google Apps
Script Web App that appends a row to the owner's Google Sheet AND emails
the site owner contact email. Chosen because the user declined the Replit Gmail
OAuth integration and wanted a free, self-managed method.

**Why text/plain content-type:** the fetch sends `Content-Type: text/plain;charset=utf-8`
with a JSON string body on purpose. This keeps it a CORS "simple request" so no
preflight OPTIONS is sent — Apps Script web apps don't handle preflight and return
a 302→googleusercontent redirect whose final response carries `Access-Control-Allow-Origin: *`.
Switching to `application/json` will break it with a CORS error.

**Why endpoint injected via server.js:** `index.html` contains literal token
`__BOOKING_ENDPOINT__`; `server.js` replaces it with `process.env.BOOKING_SHEET_URL`
at serve time. Lets the non-technical owner update the deployed Apps Script URL via
Replit Secrets without editing code. If the env var is unset the form shows a
"not linked yet" toast instead of failing silently.

**Phone validation:** Oman only. Normalize by stripping non-digits, drop leading
+/00968/968, then require `^[79]\d{7}$` (8 digits starting 7 or 9). Stored as `+968 <local>`.
