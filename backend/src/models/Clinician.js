const mongoose = require('mongoose');

const clinicianSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    clinicName: { type: String, required: false, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const Clinician = mongoose.model('Clinician', clinicianSchema);

module.exports = { Clinician };

