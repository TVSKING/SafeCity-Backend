const mongoose = require('mongoose');

const MissingPersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  lastSeenLocation: { type: String },
  description: { type: String },
  photoUrl: { type: String },
  reporterContact: { type: String },
  status: { type: String, enum: ['Missing', 'Found'], default: 'Missing' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MissingPerson', MissingPersonSchema);
