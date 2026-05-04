const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema(
  {
    clinicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinician', required: true, index: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParentRequest', required: true, unique: true },
    childName: { type: String, required: true, trim: true },
    childAge: { type: Number, required: true, min: 1, max: 18 },
    parentName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    childId: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  },
  { timestamps: true }
);

const Parent = mongoose.model('Parent', parentSchema);

module.exports = { Parent };

