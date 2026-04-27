const mongoose = require('mongoose');
require('dotenv').config();

const checkAlerts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    const alerts = await db.collection('alerts').find({}).sort({ createdAt: -1 }).limit(3).toArray();
    console.log(`Found ${alerts.length} recent alerts.`);
    alerts.forEach(a => {
      console.log('Alert:', {
        id: a._id,
        type: a.type,
        state: a.state,
        assignedDepartment: a.assignedDepartment,
        description: a.description
      });
    });
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkAlerts();
