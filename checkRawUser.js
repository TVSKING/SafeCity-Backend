const mongoose = require('mongoose');
require('dotenv').config();

const checkRawUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Find the Ahmedabad Fire user specifically
    const user = await db.collection('users').findOne({ email: 'ahmefire@safe.com' });
    
    if (user) {
      console.log('--- RAW USER DATA ---');
      console.log(JSON.stringify(user, null, 2));
      console.log('---------------------');
    } else {
      console.log('❌ Ahmedabad Fire user not found with email: ahmefire@safe.com');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkRawUser();
