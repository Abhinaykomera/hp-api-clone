const express = require('express');
const {
  getHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
} = require('../controllers/house.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// ── Public ──────────────────────────────────────────────────
// GET /api/houses?page=1&limit=10
router.get('/', getHouses);

// GET /api/houses/:id
router.get('/:id', getHouseById);

// ── Protected (valid JWT required) ──────────────────────────
// POST /api/houses
router.post('/', protect, createHouse);

// PUT /api/houses/:id
router.put('/:id', protect, updateHouse);

// DELETE /api/houses/:id
router.delete('/:id', protect, deleteHouse);

module.exports = router;
