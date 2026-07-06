const express = require('express');
const {
  getCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  uploadCharacterImage,
} = require('../controllers/character.controller');
const { protect } = require('../middleware/auth.middleware');
const upload    = require('../middleware/upload.middleware');

const router = express.Router();


router.get('/',    getCharacters);
router.get('/:id', getCharacterById);

router.post('/',    protect, createCharacter);
router.put('/:id',  protect, updateCharacter);
router.delete('/:id', protect, deleteCharacter);

router.post('/:id/image', protect, upload.single('image'), uploadCharacterImage);

module.exports = router;

