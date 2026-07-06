const express = require('express');
const { getSubmissions } = require('../controllers/submissions.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// ── GET /api/submissions ─────────────────────────────────────
// Protected: valid JWT required (protect)
// Admin-only: req.user.role must be 'admin' (authorize)
router.get('/', protect, authorize('admin'), getSubmissions);

module.exports = router;
