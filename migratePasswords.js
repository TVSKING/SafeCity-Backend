const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/safecity_db';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for migration...');

    // Find all users who don't have a password but have a plainPassword
    // Wait, the model now has 'password' as required.
    // However, MongoDB might still have documents with plainPassword but missing password.
    
    const users = await User.find({ password: { $exists: false } });
    console.log(`Found ${users.length} users needing migration.`);

    for (let user of users) {
      // Use raw collection to get plainPassword if it's not in the schema anymore
      const rawUser = await mongoose.connection.db.collection('users').findOne({ _id: user._id });
      
      if (rawUser && rawUser.plainPassword) {
        user.password = rawUser.plainPassword;
        await user.save(); // This will trigger the pre-save hook and hash it
        console.log(`Migrated user: ${user.email}`);
      }
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
