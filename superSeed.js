const mongoose = require('mongoose');
const User = require('./models/User');
const Alert = require('./models/Alert');
require('dotenv').config();

const superSeed = async () => {
  const dbNames = ['test', 'safecity_db', 'production'];
  const baseUri = process.env.MONGODB_URI.split('?')[0];
  const options = process.env.MONGODB_URI.includes('?') ? '?' + process.env.MONGODB_URI.split('?')[1] : '';

  for (const dbName of dbNames) {
    try {
      const uri = `${baseUri.endsWith('/') ? baseUri : baseUri + '/'}${dbName}${options}`;
      console.log(`\n🚀 SYNCING DATABASE: ${dbName}...`);
      
      const conn = await mongoose.createConnection(uri).asPromise();
      const UserModel = conn.model('User', User.schema);
      const AlertModel = conn.model('Alert', Alert.schema);

      // 1. Create a Test Alert for Gujarat to verify
      await AlertModel.deleteMany({ reporterName: 'SYSTEM_TEST' });
      await AlertModel.create({
        reporterName: 'SYSTEM_TEST',
        reporterPhone: '9999999999',
        type: 'Fire',
        description: 'System Verified Regional Routing Alert',
        location: { lat: 23.0225, lng: 72.5714 },
        state: 'Gujarat',
        assignedDepartment: 'fire',
        status: 'Pending'
      });

      console.log(`✅ Success: Alert created in ${dbName}`);
      await conn.close();
    } catch (err) {
      console.log(`❌ Skipped ${dbName}: ${err.message}`);
    }
  }
  console.log('\n✨ UNIVERSAL SYNC COMPLETE! Refresh your website now.');
  process.exit(0);
};

superSeed();
