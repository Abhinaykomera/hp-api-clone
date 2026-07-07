const Student    = require('../models/Student');
const sendEmail  = require('../utils/sendEmail');
const logToSheet = require('../utils/logToSheet');

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
    return res.status(409).json({ success: false, message: `A student named "${body?.name}" already exists` });
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }
  next(error);
};

const getStudents = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const filter = {};
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }
    if (req.query.house) {
      filter.house = req.query.house; 
    }

    const [students, total] = await Promise.all([
      Student.find(filter).skip(skip).limit(limit).sort({ name: 1 }),
      Student.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      pagination: {
        total, page, limit, totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student)
      return res.status(404).json({ success: false, message: `Student not found with id: ${req.params.id}` });

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    handleMongooseError(error, null, res, next);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const { name, house, year, bloodStatus } = req.body;
    const student = await Student.create({ name, house, year, bloodStatus });

    // Notify — failures are caught and logged; the API response is unaffected
    try {
      console.log(`[createStudent] ▶ Sending email notification for "${student.name}"…`);
      await Promise.all([
        sendEmail({
          type  : 'Student',
          name  : student.name,
          fields: {
            Name          : student.name,
            House         : student.house ?? 'N/A',
            Year          : student.year ?? 'N/A',
            'Blood Status': student.bloodStatus || 'unknown',
          },
        }),
        logToSheet({
          entityType: 'Student',
          name      : student.name,
          data      : student.toObject(),
        }),
      ]);
      console.log(`[createStudent] ✅ Email notification sent successfully for "${student.name}"`);
    } catch (notifyErr) {
      console.error(`[createStudent] ❌ Notification error (non-fatal): ${notifyErr.message}`, notifyErr);
    }

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    handleMongooseError(error, req.body, res, next);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { name, house, year, bloodStatus } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, house, year, bloodStatus },
      { new: true, runValidators: true }
    );
    if (!student)
      return res.status(404).json({ success: false, message: `Student not found with id: ${req.params.id}` });

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    handleMongooseError(error, req.body, res, next);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student)
      return res.status(404).json({ success: false, message: `Student not found with id: ${req.params.id}` });

    res.status(200).json({
      success: true,
      message: `Student "${student.name}" deleted successfully`,
      data: {},
    });
  } catch (error) {
    handleMongooseError(error, null, res, next);
  }
};

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent };
