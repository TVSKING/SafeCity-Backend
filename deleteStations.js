const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');
require('dotenv').config();

const deleteStations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/safecity_db');
    console.log('Cleaning up all station and department accounts...');

    const userResult = await User.deleteMany({ role: 'department' });
    const deptResult = await Department.deleteMany({});

    console.log(`✅ Deleted ${userResult.deletedCount} station accounts.`);
    console.log(`✅ Deleted ${deptResult.deletedCount} department records.`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Deletion Error:', error);
    process.exit(1);
  }
};

deleteStations();
