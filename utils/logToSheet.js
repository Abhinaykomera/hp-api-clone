/**
 * utils/logToSheet.js
 * ───────────────────
 * Sends a fire-and-forget POST to the Google Sheets Apps Script webhook
 * defined in GOOGLE_SHEETS_WEBHOOK_URL.
 *
 * Usage:
 *   const logToSheet = require('../utils/logToSheet');
 *
 *   logToSheet({
 *     entityType : 'Character',        // 'Character' | 'Student' | 'Staff'
 *     name       : 'Harry Potter',
 *     data       : characterDocument,  // full Mongoose document / plain object
 *   });
 *
 * Environment variable required:
 *   GOOGLE_SHEETS_WEBHOOK_URL – the doPost web-app URL from Apps Script
 *
 * Notes:
 *   • Uses Node's built-in fetch (available since Node 18).
 *   • No external packages, no auth headers.
 *   • Errors are logged to the console but never thrown, so a webhook
 *     failure cannot break the API response.
 */

'use strict';

/**
 * Post a record to the Google Sheets webhook.
 *
 * @param {{ entityType: string, name: string, data: object }} opts
 * @returns {void}  (intentionally not awaited by callers)
 */
function logToSheet({ entityType, name, data }) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('[logToSheet] GOOGLE_SHEETS_WEBHOOK_URL is not set — skipping sheet log.');
    return;
  }

  const payload = {
    entityType,
    name,
    data,
    timestamp: new Date().toISOString(),
  };

  // Fire-and-forget: we do NOT await this promise in the controller.
  fetch(webhookUrl, {
    method  : 'POST',
    headers : { 'Content-Type': 'application/json' },
    body    : JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) {
        console.error(`[logToSheet] Webhook responded with HTTP ${res.status} ${res.statusText}`);
      } else {
        console.log(`[logToSheet] Logged "${name}" (${entityType}) to Google Sheets ✓`);
      }
    })
    .catch((err) => {
      console.error('[logToSheet] Fetch error:', err.message);
    });
}

module.exports = logToSheet;
