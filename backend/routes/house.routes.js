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

router.get('/', getHouses);


router.get('/:id', getHouseById);


router.post('/', protect, createHouse);

router.put('/:id', protect, updateHouse);

router.delete('/:id', protect, deleteHouse);

module.exports = router;
