const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  reporterName: { type: String, required: true },
  reporterPhone: { type: String, required: true },
  type: { type: String, enum: ['Fire', 'Medical', 'Crime', 'Accident', 'SOS'], required: true },
  description: { type: String },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  mediaUrls: [{ type: String }], // URLs for photos/videos/voice notes
  triageLevel: { type: Number, min: 1, max: 5, default: 3 }, // 1: Low, 5: Critical
  triageResponses: [{ question: String, answer: String }],
  assignedDepartment: { type: String, enum: ['police', 'fire', 'ambulance', 'other', 'none'], default: 'none' },
  status: { type: String, enum: ['Pending', 'Accepted', 'In Progress', 'Resolved'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', AlertSchema);

