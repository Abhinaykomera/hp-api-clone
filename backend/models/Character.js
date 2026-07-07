const mongoose = require('mongoose');

const wandSchema = new mongoose.Schema(
  {
    wood:      { type: String, trim: true, default: '' },
    core:      { type: String, trim: true, default: '' },
    lengthIn:  { type: Number, min: 0, default: null },
  },
  { _id: false }
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
      default: null, 
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

characterSchema.pre(/^find/, function (next) {
  this.populate({ path: 'house', select: 'name animal colors' });
  next();
});

module.exports = mongoose.model('Character', characterSchema);
