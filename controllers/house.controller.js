const House = require('../models/House');

// ─────────────────────────────────────────────────────────────
// @desc    Get all houses (paginated)
// @route   GET /api/houses?page=1&limit=10
// @access  Public
// ─────────────────────────────────────────────────────────────
const getHouses = async (req, res, next) => {
  try {
    // Parse & sanitise pagination params
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip  = (page - 1) * limit;

    const [houses, total] = await Promise.all([
      House.find().skip(skip).limit(limit).sort({ name: 1 }),
      House.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      count: houses.length,
      data: houses,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get a single house by ID
// @route   GET /api/houses/:id
// @access  Public
// ─────────────────────────────────────────────────────────────
const getHouseById = async (req, res, next) => {
  try {
    const house = await House.findById(req.params.id);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: `House not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: house });
  } catch (error) {
    // Mongoose CastError = invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid id format: ${req.params.id}`,
      });
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Create a new house
// @route   POST /api/houses
// @access  Protected
// ─────────────────────────────────────────────────────────────
const createHouse = async (req, res, next) => {
  try {
    const { name, founder, colors, animal, traits } = req.body;

    const house = await House.create({ name, founder, colors, animal, traits });

    res.status(201).json({ success: true, data: house });
  } catch (error) {
    // Duplicate key (unique name constraint)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `A house named "${req.body.name}" already exists`,
      });
    }
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update a house
// @route   PUT /api/houses/:id
// @access  Protected
// ─────────────────────────────────────────────────────────────
const updateHouse = async (req, res, next) => {
  try {
    const { name, founder, colors, animal, traits } = req.body;

    const house = await House.findByIdAndUpdate(
      req.params.id,
      { name, founder, colors, animal, traits },
      {
        new: true,          // Return the updated document
        runValidators: true, // Re-run schema validators on update
      }
    );

    if (!house) {
      return res.status(404).json({
        success: false,
        message: `House not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: house });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid id format: ${req.params.id}`,
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `A house named "${req.body.name}" already exists`,
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete a house
// @route   DELETE /api/houses/:id
// @access  Protected
// ─────────────────────────────────────────────────────────────
const deleteHouse = async (req, res, next) => {
  try {
    const house = await House.findByIdAndDelete(req.params.id);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: `House not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `House "${house.name}" deleted successfully`,
      data: {},
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid id format: ${req.params.id}`,
      });
    }
    next(error);
  }
};

module.exports = { getHouses, getHouseById, createHouse, updateHouse, deleteHouse };
