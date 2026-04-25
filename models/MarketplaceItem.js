const mongoose = require('mongoose');

const MarketplaceItemSchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  resourceName: { type: String, required: true },
  quantity: { type: String },
  type: { type: String, enum: ['Water', 'Food', 'Tool', 'Vehicle', 'Medical', 'Other'], default: 'Other' },
  location: { type: String },
  contact: { type: String },
  availability: { type: String, enum: ['Available', 'In Use', 'Unavailable'], default: 'Available' },
  photoUrl: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketplaceItem', MarketplaceItemSchema);
