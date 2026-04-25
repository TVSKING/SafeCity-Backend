const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  departmentType: { type: String, enum: ['police', 'fire', 'ambulance'], required: true },
  email: { type: String, required: true, unique: true },
  location: {
    lat: { type: Number, default: 22.3039 },
    lng: { type: Number, default: 70.8022 }
  }
});

module.exports = mongoose.model('Department', DepartmentSchema);
