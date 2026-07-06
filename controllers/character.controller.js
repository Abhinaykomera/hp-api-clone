const Character  = require('../models/Character');
const cloudinary = require('../config/cloudinary');

// ── Shared helpers ─────────────────────────────────────────────
const parsePagination = (query) => {
  const page  = Math.max(1, parseInt(query.page,  10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

const handleMongooseError = (error, body, res, next) => {
  if (error.name === 'CastError')
    return res.status(400).json({ success: false, message: `Invalid id format` });
  if (error.code === 11000)
    return res.status(409).json({ success: false, message: `A character named "${body?.name}" already exists` });
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }
  next(error);
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all characters (paginated, filterable)
// @route   GET /api/characters?page=1&limit=10&name=harry&house=<id>
// @access  Public
// ─────────────────────────────────────────────────────────────
const getCharacters = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    // Build filter — both params are optional and combinable
    const filter = {};
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }
    if (req.query.house) {
      filter.house = req.query.house; // expects a valid House ObjectId
    }

    const [characters, total] = await Promise.all([
      Character.find(filter).skip(skip).limit(limit).sort({ name: 1 }),
      Character.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      pagination: {
        total, page, limit, totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      count: characters.length,
      data: characters,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get a single character by ID
// @route   GET /api/characters/:id
// @access  Public
// ─────────────────────────────────────────────────────────────
const getCharacterById = async (req, res, next) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character)
      return res.status(404).json({ success: false, message: `Character not found with id: ${req.params.id}` });

    res.status(200).json({ success: true, data: character });
  } catch (error) {
    handleMongooseError(error, null, res, next);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Create a character
// @route   POST /api/characters
// @access  Protected
// ─────────────────────────────────────────────────────────────
const createCharacter = async (req, res, next) => {
  try {
    const { name, house, species, patronus, wand, image } = req.body;
    const character = await Character.create({ name, house, species, patronus, wand, image });
    res.status(201).json({ success: true, data: character });
  } catch (error) {
    handleMongooseError(error, req.body, res, next);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update a character
// @route   PUT /api/characters/:id
// @access  Protected
// ─────────────────────────────────────────────────────────────
const updateCharacter = async (req, res, next) => {
  try {
    const { name, house, species, patronus, wand, image } = req.body;
    const character = await Character.findByIdAndUpdate(
      req.params.id,
      { name, house, species, patronus, wand, image },
      { new: true, runValidators: true }
    );
    if (!character)
      return res.status(404).json({ success: false, message: `Character not found with id: ${req.params.id}` });

    res.status(200).json({ success: true, data: character });
  } catch (error) {
    handleMongooseError(error, req.body, res, next);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete a character
// @route   DELETE /api/characters/:id
// @access  Protected
// ─────────────────────────────────────────────────────────────
const deleteCharacter = async (req, res, next) => {
  try {
    const character = await Character.findByIdAndDelete(req.params.id);
    if (!character)
      return res.status(404).json({ success: false, message: `Character not found with id: ${req.params.id}` });

    res.status(200).json({
      success: true,
      message: `Character "${character.name}" deleted successfully`,
      data: {},
    });
  } catch (error) {
    handleMongooseError(error, null, res, next);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Upload / replace a character's image via Cloudinary
// @route   POST /api/characters/:id/image
// @access  Protected
// ─────────────────────────────────────────────────────────────
const uploadCharacterImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Send the file under the field name "image".',
      });
    }

    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).json({
        success: false,
        message: `Character not found with id: ${req.params.id}`,
      });
    }

    // If the character already has a Cloudinary image, delete the old one
    // so we don't accumulate orphaned assets.
    if (character.image && character.image.includes('cloudinary.com')) {
      // Extract public_id from the URL  (last path segment without extension)
      const parts   = character.image.split('/');
      const file    = parts[parts.length - 1];
      const folder  = parts[parts.length - 2];
      const publicId = `${folder}/${file.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId).catch(() => {}); // non-fatal
    }

    // Stream the in-memory buffer to Cloudinary
    const secure_url = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'hp-api-clone/characters',
          resource_type: 'image',
          // Use the character's MongoDB id as a stable public_id so
          // re-uploads automatically overwrite the old asset.
          public_id: character._id.toString(),
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      stream.end(req.file.buffer);
    });

    // Persist the new URL
    character.image = secure_url;
    await character.save();

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { image: secure_url },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid id format' });
    }
    next(error);
  }
};

module.exports = {
  getCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  uploadCharacterImage,
};
