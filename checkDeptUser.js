const mongoose = require('mongoose');
require('dotenv').config();

const checkDeptUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    const ahmFire = await db.collection('users').findOne({ name: /Ahmedabad Fire/i });
    if (ahmFire) {
      console.log('Ahmedabad Fire User Found:', {
        name: ahmFire.name,
        role: ahmFire.role,
        state: ahmFire.state,
        city: ahmFire.city
      });
    } else {
      console.log('Ahmedabad Fire User NOT found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkDeptUser();
