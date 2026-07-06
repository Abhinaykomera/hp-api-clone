const Staff = require('../models/Staff');

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

const getStaff = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const filter = {};
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }
    if (req.query.house) {
      filter.house = req.query.house; 
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

const createStaff = async (req, res, next) => {
  try {
    const { name, house, subject, title } = req.body;
    const member = await Staff.create({ name, house, subject, title });
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    handleMongooseError(error, req.body, res, next);
  }
};

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
