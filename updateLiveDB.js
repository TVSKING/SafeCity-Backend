const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const updateLiveStates = async () => {
  try {
    // FORCE the database name to safecity_db to match Vercel
    const liveUri = process.env.MONGODB_URI.includes('?') 
      ? process.env.MONGODB_URI.replace('/?', '/safecity_db?')
      : process.env.MONGODB_URI.endsWith('/') 
        ? process.env.MONGODB_URI + 'safecity_db' 
        : process.env.MONGODB_URI + '/safecity_db';

    console.log(`Connecting to LIVE DB: ${liveUri}`);
    await mongoose.connect(liveUri);
    
    const users = await User.find({ role: 'department' });
    console.log(`Found ${users.length} department accounts. Updating states...`);

    for (const user of users) {
      // Extract state from address if it exists
      if (user.address && user.address.includes(',')) {
        const parts = user.address.split(',');
        const stateName = parts[parts.length - 1].trim();
        const cityName = parts[parts.length - 2].trim();
        
        user.state = stateName;
        user.city = cityName;
        await user.save();
        console.log(`✅ Updated: ${user.name} -> State: ${stateName}, City: ${cityName}`);
      }
    }

    console.log('Live Database Update Complete!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

updateLiveStates();
