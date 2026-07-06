const express = require('express');
const {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
} = require('../controllers/staff.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// ── Public ──────────────────────────────────────────────────
router.get('/',    getStaff);
router.get('/:id', getStaffById);

// ── Protected ────────────────────────────────────────────────
router.post('/',    protect, createStaff);
router.put('/:id',  protect, updateStaff);
router.delete('/:id', protect, deleteStaff);

module.exports = router;
