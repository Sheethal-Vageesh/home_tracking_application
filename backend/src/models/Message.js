const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    clinicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinician', required: true, index: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true, index: true },
    childId: { type: String, required: true, trim: true }, // Parent.childId (human-readable)
    senderRole: { type: String, enum: ['clinician', 'parent'], required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };

