/**
 * controllers/submissions.controller.js
 * ──────────────────────────────────────
 * Proxy controller that forwards a GET request to the Google Sheets
 * Apps Script webhook and returns the rows to the caller.
 *
 * The Apps Script doGet() handler should respond with JSON, e.g.:
 *   { "rows": [ { "entityType": "Character", "name": "...", ... }, ... ] }
 *
 * If the webhook is unreachable or misconfigured the controller
 * returns a 502 with a descriptive error rather than crashing.
 */

'use strict';

// ─────────────────────────────────────────────────────────────
// @desc    Fetch all logged submissions from Google Sheets
// @route   GET /api/submissions
// @access  Protected — admin only
// ─────────────────────────────────────────────────────────────
const getSubmissions = async (req, res, next) => {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(503).json({
      success: false,
      message: 'GOOGLE_SHEETS_WEBHOOK_URL is not configured on this server.',
    });
  }

  let response;
  try {
    response = await fetch(webhookUrl, {
      method : 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch (fetchErr) {
    // Network-level error (DNS failure, timeout, etc.)
    console.error('[getSubmissions] Fetch error:', fetchErr.message);
    return res.status(502).json({
      success: false,
      message: `Could not reach the Google Sheets webhook: ${fetchErr.message}`,
    });
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error(`[getSubmissions] Webhook HTTP ${response.status}:`, body);
    return res.status(502).json({
      success: false,
      message: `Google Sheets webhook returned HTTP ${response.status}: ${response.statusText}`,
    });
  }

  let payload;
  try {
    payload = await response.json();
  } catch (parseErr) {
    console.error('[getSubmissions] JSON parse error:', parseErr.message);
    return res.status(502).json({
      success: false,
      message: 'Google Sheets webhook returned a non-JSON response.',
    });
  }

  // Normalise: support { rows: [] } or a bare array from the Apps Script
  const rows = Array.isArray(payload) ? payload : (payload.rows ?? payload.data ?? payload);

  return res.status(200).json({
    success: true,
    count  : Array.isArray(rows) ? rows.length : null,
    data   : rows,
  });
};

module.exports = { getSubmissions };
