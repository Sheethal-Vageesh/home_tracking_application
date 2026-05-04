const mongoose = require('mongoose');

const practiceSubmissionSchema = new mongoose.Schema(
  {
    clinicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinician', required: true, index: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true, index: true },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StrategyAssignment', required: true, index: true },
    strategyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Strategy', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    durationSeconds: { type: Number, required: true, min: 0, max: 24 * 60 * 60 },
    practiceVideoUrl: { type: String, trim: true, default: '' }, // optional parent upload
    submittedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

const PracticeSubmission = mongoose.model('PracticeSubmission', practiceSubmissionSchema);

module.exports = { PracticeSubmission };

