const mongoose = require('mongoose');

const wandSchema = new mongoose.Schema(
  {
    wood:      { type: String, trim: true, default: '' },
    core:      { type: String, trim: true, default: '' },
    lengthIn:  { type: Number, min: 0, default: null },
  },
  { _id: false } // embedded sub-document, no own _id needed
);

const characterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Character name is required'],
      unique: true,
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },

    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'House',
      default: null, // not every character belongs to a house
    },

    species: {
      type: String,
      trim: true,
      maxlength: [80, 'Species cannot exceed 80 characters'],
      default: 'Human',
    },

    patronus: {
      type: String,
      trim: true,
      maxlength: [100, 'Patronus cannot exceed 100 characters'],
      default: '',
    },

    wand: {
      type: wandSchema,
      default: () => ({}),
    },

    // URL or Cloudinary public_id — populated later when upload feature is added
    image: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Populate house name automatically when querying
characterSchema.pre(/^find/, function (next) {
  this.populate({ path: 'house', select: 'name animal colors' });
  next();
});

module.exports = mongoose.model('Character', characterSchema);
