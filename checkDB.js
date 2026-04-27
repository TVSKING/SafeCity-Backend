const mongoose = require('mongoose');
require('dotenv').config();

const checkUsers = async () => {
  try {
    const liveUri = process.env.MONGODB_URI.includes('?') 
      ? process.env.MONGODB_URI.replace('/?', '/safecity_db?')
      : process.env.MONGODB_URI.endsWith('/') 
        ? process.env.MONGODB_URI + 'safecity_db' 
        : process.env.MONGODB_URI + '/safecity_db';

    await mongoose.connect(liveUri);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    const users = await db.collection('users').find({}).toArray();
    console.log(`Total Users: ${users.length}`);
    if (users.length > 0) {
      console.log('Sample User Role:', users[0].role);
      console.log('Sample User Name:', users[0].name);
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkUsers();
