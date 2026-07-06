const express = require('express');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/student.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// ── Public ──────────────────────────────────────────────────
router.get('/',    getStudents);
router.get('/:id', getStudentById);

// ── Protected ────────────────────────────────────────────────
router.post('/',    protect, createStudent);
router.put('/:id',  protect, updateStudent);
router.delete('/:id', protect, deleteStudent);

module.exports = router;
