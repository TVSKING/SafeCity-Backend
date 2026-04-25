const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  departmentType: { type: String, enum: ['police', 'fire', 'ambulance', 'other', 'none'], required: true },
  name: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'units' }, // e.g., 'tanks', 'vehicles', 'personnel'
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', ResourceSchema);
