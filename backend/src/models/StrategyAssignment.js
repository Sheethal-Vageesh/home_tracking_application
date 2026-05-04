const mongoose = require('mongoose');

const strategyAssignmentSchema = new mongoose.Schema(
  {
    clinicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinician', required: true, index: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true, index: true },
    strategyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Strategy', required: true, index: true },
    assignedAt: { type: Date, required: true, default: Date.now },
    active: { type: Boolean, default: true, index: true },
    completedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

strategyAssignmentSchema.index({ parentId: 1, strategyId: 1 }, { unique: true });

const StrategyAssignment = mongoose.model('StrategyAssignment', strategyAssignmentSchema);

module.exports = { StrategyAssignment };

