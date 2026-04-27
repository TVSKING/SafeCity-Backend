const mongoose = require('mongoose');
const Alert = require('./models/Alert');
require('dotenv').config();

const clearAlerts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/safecity_db');
    console.log('Clearing all old alerts to reset the state-wise system...');
    const result = await Alert.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} old alerts.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

clearAlerts();
