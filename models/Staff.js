const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Staff name is required'],
      unique: true,
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },

    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'House',
      default: null, 
    },

    subject: {
      type: String,
      trim: true,
      maxlength: [150, 'Subject cannot exceed 150 characters'],
      default: '',
    },

    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: 'Professor',
    },
  },
  {
    timestamps: true,
  }
);

staffSchema.pre(/^find/, function (next) {
  this.populate({ path: 'house', select: 'name animal colors' });
  next();
});

module.exports = mongoose.model('Staff', staffSchema);
