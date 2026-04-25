const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'department'], required: true },
  departmentType: { type: String, enum: ['police', 'fire', 'ambulance', 'other', 'none'], default: 'none' },
  address: { type: String, required: true, default: 'Address Not Provided' },
  phone: { type: String, default: '' },
  description: { type: String, default: 'Official SafeCity Department' },
  profileImage: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  activationKey: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
