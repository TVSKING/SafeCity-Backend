const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  reporterName: { type: String, required: true },
  reporterPhone: { type: String, required: true },
  type: { type: String, enum: ['Fire', 'Medical', 'Crime', 'Accident', 'SOS', 'fire', 'medical', 'crime', 'accident'], required: true },
  priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
  description: { type: String },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  state: { type: String, required: true },
  media: [{ type: String }], // Evidence URLs
  mediaUrls: [{ type: String }], // Legacy support
  triageLevel: { type: Number, min: 1, max: 5, default: 3 }, 
  triageResponses: [{ question: String, answer: String }],
  assignedDepartment: { type: String, enum: ['police', 'fire', 'ambulance', 'other', 'none'], default: 'none' },
  status: { type: String, enum: ['Pending', 'Accepted', 'In Progress', 'Resolved'], default: 'Pending' },
  statusHistory: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Middleware to track status history
AlertSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() });
  }
  next();
});

module.exports = mongoose.model('Alert', AlertSchema);

