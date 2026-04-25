const mongoose = require('mongoose');

const SafetyCheckSchema = new mongoose.Schema({
  title: { type: String, required: true },
  area: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  radius: { type: Number },
  responses: [{
    userId: { type: String },
    name: { type: String },
    age: { type: Number },
    status: { type: String, enum: ['Safe', 'Need Help', 'Unresponsive'], default: 'Unresponsive' },
    timestamp: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SafetyCheck', SafetyCheckSchema);
