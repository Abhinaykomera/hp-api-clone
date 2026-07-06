/**
 * app.js — Express application factory
 *
 * Responsibilities:
 *   - Load middleware (JSON parsing, CORS, etc.)
 *   - Mount all route groups
 *   - Global error handling
 *
 * server.js handles the actual HTTP listener so that app.js
 * stays testable (no side-effects on import).
 */

const express = require('express');

// ── Route imports (add more here as features grow) ────────────
const healthRoutes       = require('./routes/healthRoutes');
const authRoutes         = require('./routes/auth.routes');
const houseRoutes        = require('./routes/house.routes');
const characterRoutes    = require('./routes/character.routes');
const studentRoutes      = require('./routes/student.routes');
const staffRoutes        = require('./routes/staff.routes');
const submissionsRoutes  = require('./routes/submissions.routes');

const app = express();

// ── Built-in middleware ────────────────────────────────────────
app.use(express.json());           // Parse application/json
app.use(express.urlencoded({ extended: true })); // Parse form data

// ── Routes ────────────────────────────────────────────────────
app.use('/api/health',      healthRoutes);
app.use('/api/auth',        authRoutes);
app.use('/api/houses',      houseRoutes);
app.use('/api/characters',  characterRoutes);
app.use('/api/students',    studentRoutes);
app.use('/api/staff',       staffRoutes);
app.use('/api/submissions', submissionsRoutes);

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global error handler ──────────────────────────────────────
// Must have exactly four parameters so Express recognises it as
// an error-handling middleware.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[Error] ${err.message}`);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
