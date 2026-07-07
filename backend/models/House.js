const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'House name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    founder: {
      type: String,
      required: [true, 'Founder name is required'],
      trim: true,
      maxlength: [100, 'Founder name cannot exceed 100 characters'],
    },

    colors: {
      type: [String],
      required: [true, 'At least one house color is required'],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Colors array must contain at least one value',
      },
    },

    animal: {
      type: String,
      required: [true, 'House animal is required'],
      trim: true,
      maxlength: [80, 'Animal name cannot exceed 80 characters'],
    },

    traits: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('House', houseSchema);
