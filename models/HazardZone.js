const mongoose = require('mongoose');

const HazardZoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Gas Leak', 'Structural Collapse', 'Fire Outbreak', 'Flooding', 'Chemical Spill'], required: true },
  severity: { type: String, enum: ['Moderate', 'High', 'Critical'], default: 'High' },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  radius: { type: Number, default: 500 }, // in meters
  state: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  deployedResources: [{
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
    quantity: { type: Number, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HazardZone', HazardZoneSchema);
