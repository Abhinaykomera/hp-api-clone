const Staff = require('../models/Staff');

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
    return res.status(409).json({ success: false, message: `A staff member named "${body?.name}" already exists` });
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }
  next(error);
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all staff (paginated, filterable)
// @route   GET /api/staff?page=1&limit=10&name=snape&house=<id>
// @access  Public
// ─────────────────────────────────────────────────────────────
const getStaff = async (req, res, next) => {
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

    const [staff, total] = await Promise.all([
      Staff.find(filter).skip(skip).limit(limit).sort({ name: 1 }),
      Staff.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      pagination: {
        total, page, limit, totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get a single staff member by ID
// @route   GET /api/staff/:id
// @access  Public
// ─────────────────────────────────────────────────────────────
const getStaffById = async (req, res, next) => {
  try {
    const member = await Staff.findById(req.params.id);
    if (!member)
      return res.status(404).json({ success: false, message: `Staff member not found with id: ${req.params.id}` });

    res.status(200).json({ success: true, data: member });
  } catch (error) {
    handleMongooseError(error, null, res, next);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Create a staff member
// @route   POST /api/staff
// @access  Protected
// ─────────────────────────────────────────────────────────────
const createStaff = async (req, res, next) => {
  try {
    const { name, house, subject, title } = req.body;
    const member = await Staff.create({ name, house, subject, title });
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    handleMongooseError(error, req.body, res, next);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update a staff member
// @route   PUT /api/staff/:id
// @access  Protected
// ─────────────────────────────────────────────────────────────
const updateStaff = async (req, res, next) => {
  try {
    const { name, house, subject, title } = req.body;
    const member = await Staff.findByIdAndUpdate(
      req.params.id,
      { name, house, subject, title },
      { new: true, runValidators: true }
    );
    if (!member)
      return res.status(404).json({ success: false, message: `Staff member not found with id: ${req.params.id}` });

    res.status(200).json({ success: true, data: member });
  } catch (error) {
    handleMongooseError(error, req.body, res, next);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete a staff member
// @route   DELETE /api/staff/:id
// @access  Protected
// ─────────────────────────────────────────────────────────────
const deleteStaff = async (req, res, next) => {
  try {
    const member = await Staff.findByIdAndDelete(req.params.id);
    if (!member)
      return res.status(404).json({ success: false, message: `Staff member not found with id: ${req.params.id}` });

    res.status(200).json({
      success: true,
      message: `Staff member "${member.name}" deleted successfully`,
      data: {},
    });
  } catch (error) {
    handleMongooseError(error, null, res, next);
  }
};

module.exports = { getStaff, getStaffById, createStaff, updateStaff, deleteStaff };
