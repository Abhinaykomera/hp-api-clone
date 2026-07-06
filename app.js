const express = require('express');

<<<<<<< HEAD
// ── Route imports (add more here as features grow) ────────────
const healthRoutes       = require('./routes/healthRoutes');
const authRoutes         = require('./routes/auth.routes');
const houseRoutes        = require('./routes/house.routes');
const characterRoutes    = require('./routes/character.routes');
const studentRoutes      = require('./routes/student.routes');
const staffRoutes        = require('./routes/staff.routes');
const submissionsRoutes  = require('./routes/submissions.routes');
=======
const healthRoutes    = require('./routes/healthRoutes');
const authRoutes      = require('./routes/auth.routes');
const houseRoutes     = require('./routes/house.routes');
const characterRoutes = require('./routes/character.routes');
const studentRoutes   = require('./routes/student.routes');
const staffRoutes     = require('./routes/staff.routes');
>>>>>>> f436085549196a00ebb223f35514a93a5b024c40

const app = express();


<<<<<<< HEAD
// ── Routes ────────────────────────────────────────────────────
app.use('/api/health',      healthRoutes);
app.use('/api/auth',        authRoutes);
app.use('/api/houses',      houseRoutes);
app.use('/api/characters',  characterRoutes);
app.use('/api/students',    studentRoutes);
app.use('/api/staff',       staffRoutes);
app.use('/api/submissions', submissionsRoutes);
=======
app.use(express.json());     
app.use(express.urlencoded({ extended: true })); 

app.use('/api/health',     healthRoutes);
app.use('/api/auth',       authRoutes);
app.use('/api/houses',     houseRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/students',   studentRoutes);
app.use('/api/staff',      staffRoutes);
>>>>>>> f436085549196a00ebb223f35514a93a5b024c40


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
