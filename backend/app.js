const express = require('express');
const cors    = require('cors');

// ── Route imports ──────────────────────────────────────────────
const healthRoutes      = require('./routes/healthRoutes');
const authRoutes        = require('./routes/auth.routes');
const houseRoutes       = require('./routes/house.routes');
const characterRoutes   = require('./routes/character.routes');
const studentRoutes     = require('./routes/student.routes');
const staffRoutes       = require('./routes/staff.routes');
const submissionsRoutes = require('./routes/submissions.routes');

const app = express();

// ── CORS ───────────────────────────────────────────────────────
// Build the allow-list from env; always include the Vite dev server
const allowedOrigins = [
  'http://localhost:5173',                          // Vite dev server
  ...(process.env.FRONTEND_URL                      // Production URL (optional)
    ? [process.env.FRONTEND_URL.replace(/\/$/, '')] // strip trailing slash
    : []),
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin "${origin}" is not allowed`));
    },
    credentials:     true,                           // Allow cookies / Authorization headers
    methods:         ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders:  ['Content-Type', 'Authorization'],
  })
);

// ── Body parsers ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/health',      healthRoutes);
app.use('/api/auth',        authRoutes);
app.use('/api/houses',      houseRoutes);
app.use('/api/characters',  characterRoutes);
app.use('/api/students',    studentRoutes);
app.use('/api/staff',       staffRoutes);
app.use('/api/submissions', submissionsRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});


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
