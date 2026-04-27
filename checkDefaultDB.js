const mongoose = require('mongoose');
require('dotenv').config();

const checkDefaultDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('Connected to DB:', mongoose.connection.name);
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    const users = await db.collection('users').find({}).toArray();
    console.log(`Total Users: ${users.length}`);
    if (users.length > 0) {
      console.log('Sample User:', { name: users[0].name, role: users[0].role, state: users[0].state });
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkDefaultDB();
