const mongoose = require('mongoose');

const strategySchema = new mongoose.Schema(
  {
    clinicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinician',
      required: true,
      index: true,
    },

    // English title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Kannada explanation/instruction
    kannadaText: {
      type: String,
      trim: true,
      default: '',
    },

    // Optional demo video
    demoVideoUrl: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

strategySchema.index({ clinicianId: 1, title: 1 }, { unique: true });

const Strategy = mongoose.model('Strategy', strategySchema);

module.exports = { Strategy };