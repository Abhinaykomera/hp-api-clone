const mongoose = require('mongoose');

const BLOOD_STATUSES = [
  'pure-blood',
  'half-blood',
  'muggle-born',
  'squib',
  'unknown',
];

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      unique: true,
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },

    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'House',
      default: null,
    },

    year: {
      type: Number,
      min: [1, 'Year must be between 1 and 7'],
      max: [7, 'Year must be between 1 and 7'],
      default: null,
    },

    bloodStatus: {
      type: String,
      enum: {
        values: BLOOD_STATUSES,
        message: `Blood status must be one of: ${BLOOD_STATUSES.join(', ')}`,
      },
      default: 'unknown',
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.pre(/^find/, function (next) {
  this.populate({ path: 'house', select: 'name animal colors' });
  next();
});

module.exports = mongoose.model('Student', studentSchema);
