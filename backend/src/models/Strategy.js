const mongoose = require('mongoose');

const strategySchema = new mongoose.Schema(
  {
    clinicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinician', required: true, index: true },
    title: { type: String, required: true, trim: true },
    demoVideoUrl: { type: String, trim: true, default: '' }, // optional video uploaded by clinician
  },
  { timestamps: true }
);

strategySchema.index({ clinicianId: 1, title: 1 }, { unique: true });

const Strategy = mongoose.model('Strategy', strategySchema);

module.exports = { Strategy };

