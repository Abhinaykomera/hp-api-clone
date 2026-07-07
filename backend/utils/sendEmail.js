/**
 * utils/sendEmail.js
 * ──────────────────
 * Thin wrapper around the Resend SDK.
 *
 * Usage:
 *   const sendEmail = require('../utils/sendEmail');
 *
 *   await sendEmail({
 *     type   : 'Character',          // 'Character' | 'Student' | 'Staff'
 *     name   : 'Harry Potter',
 *     fields : { house: 'Gryffindor', species: 'Human', patronus: 'Stag' },
 *   });
 *
 * Environment variables required:
 *   RESEND_API_KEY  – your Resend secret key
 *   NOTIFY_EMAIL    – recipient address for the notification
 */

'use strict';

const { Resend } = require('resend');

// Initialise once so the SDK client is reused across calls.
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = 'onboarding@resend.dev';

/**
 * Build a simple HTML table from a key/value fields object.
 * @param {Record<string, unknown>} fields
 * @returns {string}
 */
function buildHtmlTable(fields) {
  const rows = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([key, value]) => {
      // Pretty-print objects (e.g. the wand sub-document)
      const display =
        typeof value === 'object'
          ? JSON.stringify(value, null, 2).replace(/\n/g, '<br/>')
          : String(value);

      return `
        <tr>
          <td style="padding:8px 12px;font-weight:600;background:#f3f4f6;border:1px solid #e5e7eb;white-space:nowrap;">
            ${escapeHtml(key)}
          </td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;">
            ${display}
          </td>
        </tr>`;
    })
    .join('');

  return `
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
      <tbody>${rows}</tbody>
    </table>`;
}

/**
 * Build a plain-text field listing.
 * @param {Record<string, unknown>} fields
 * @returns {string}
 */
function buildPlainText(fields) {
  return Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([key, value]) => {
      const display =
        typeof value === 'object' ? JSON.stringify(value) : String(value);
      return `${key}: ${display}`;
    })
    .join('\n');
}

/** Minimal HTML-escape to prevent XSS in key names. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Send a "new record added" notification email.
 *
 * @param {{ type: string, name: string, fields: Record<string, unknown> }} opts
 * @returns {Promise<void>}
 */
async function sendEmail({ type, name, fields }) {
  const to = process.env.NOTIFY_EMAIL;

  if (!to) {
    console.warn('[sendEmail] NOTIFY_EMAIL is not set — skipping notification.');
    return;
  }
  if (!process.env.RESEND_API_KEY) {
    console.warn('[sendEmail] RESEND_API_KEY is not set — skipping notification.');
    return;
  }

  const subject = `New ${type} Added: ${name}`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:8px;overflow:hidden;
                      box-shadow:0 1px 3px rgba(0,0,0,.1);">
          <!-- Header -->
          <tr>
            <td style="background:#1e3a5f;padding:24px 32px;">
              <h1 style="margin:0;color:#f0c040;font-size:22px;letter-spacing:.5px;">
                ⚡ HP API Clone
              </h1>
              <p style="margin:6px 0 0;color:#cbd5e1;font-size:13px;">
                Notification Service
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">
                ${escapeHtml(subject)}
              </h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
                A new <strong>${escapeHtml(type)}</strong> record was just created in the database.
              </p>

              ${buildHtmlTable(fields)}

              <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">
                This is an automated message. Please do not reply.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f3f4f6;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">
                HP API Clone &bull; Sent via Resend
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textBody = `${subject}\n${'─'.repeat(subject.length)}\n\n${buildPlainText(fields)}\n\n---\nThis is an automated message from HP API Clone.`;

  try {
    const { error } = await resend.emails.send({
      from   : FROM_ADDRESS,
      to     : [to],
      subject,
      html   : htmlBody,
      text   : textBody,
    });

    if (error) {
      // Log but do not throw — email failure must not break the API response.
      console.error('[sendEmail] Resend API error:', error);
    } else {
      console.log(`[sendEmail] Notification sent → ${to} | ${subject}`);
    }
  } catch (err) {
    console.error('[sendEmail] Unexpected error:', err.message);
  }
}

module.exports = sendEmail;
