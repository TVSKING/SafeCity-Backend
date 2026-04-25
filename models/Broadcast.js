const mongoose = require('mongoose');

const BroadcastSchema = new mongoose.Schema({
  message: { type: String, required: true },
  scope: { type: String, enum: ['All', 'Geo-fenced'], default: 'All' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  radius: { type: Number }, // in meters for geo-fenced
  isActive: { type: Boolean, default: true },
  sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Broadcast', BroadcastSchema);
