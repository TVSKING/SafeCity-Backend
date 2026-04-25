const mongoose = require('mongoose');
const User = require('./models/User');
const Resource = require('./models/Resource');
const Department = require('./models/Department');
require('dotenv').config();


const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/safecity_db');
    console.log('Cleaning up existing users...');
    await User.deleteMany({});

    const users = [
      { name: 'System Admin', email: 'itspatel9996@gmail.com', password: 'Patel@123', role: 'admin', departmentType: 'none', address: 'Command Center, Rajkot' },
      
      // Police (Rajkot)
      { name: 'B-Division Police', email: 'bdivision@safe.com', password: 'bdivision123', role: 'department', departmentType: 'police', address: 'B-Division Police Station, Rajkot' },
      { name: 'Bhaktinagar Police', email: 'bhaktinagar@safe.com', password: 'bhaktinagar123', role: 'department', departmentType: 'police', address: 'Bhaktinagar Station, Rajkot' },
      { name: 'Gandhigram Police', email: 'gandhigram@safe.com', password: 'gandhigram123', role: 'department', departmentType: 'police', address: 'Gandhigram Station, Rajkot' },
      { name: 'Malaviyanagar Police', email: 'malaviyanagar@safe.com', password: 'malaviyanagar123', role: 'department', departmentType: 'police', address: 'Malaviyanagar Station, Rajkot' },
      { name: 'Pradyumannagar Police', email: 'pradyumannagar@safe.com', password: 'pradyumannagar123', role: 'department', departmentType: 'police', address: 'Pradyumannagar Station, Rajkot' },

      // Fire Stations (Rajkot)
      { name: 'Mochi Bazar Fire', email: 'mochibazar@safe.com', password: 'mochibazar123', role: 'department', departmentType: 'fire', address: 'Mochi Bazar, Rajkot' },
      { name: 'Nirmala Fire', email: 'nirmala@safe.com', password: 'nirmala123', role: 'department', departmentType: 'fire', address: 'Nirmala Convent Road, Rajkot' },
      { name: 'Raiya Road Fire', email: 'raiya@safe.com', password: 'raiya123', role: 'department', departmentType: 'fire', address: 'Raiya Road, Rajkot' },

      // Hospitals (Rajkot)
      { name: 'Civil Hospital', email: 'civil@safe.com', password: 'civil123', role: 'department', departmentType: 'ambulance', address: 'Civil Hospital Chowk, Rajkot' },
      { name: 'HJ Doshi Hospital', email: 'hjdoshi@safe.com', password: 'hjdoshi123', role: 'department', departmentType: 'ambulance', address: 'Malviya Nagar, Rajkot' },
      { name: 'Sterling Hospital', email: 'sterling@safe.com', password: 'sterling123', role: 'department', departmentType: 'ambulance', address: '150 Feet Ring Road, Rajkot' },
      { name: 'Christ Hospital', email: 'christ@safe.com', password: 'christ123', role: 'department', departmentType: 'ambulance', address: 'Jamnagar Highway, Rajkot' }
    ];

    console.log('Inserting seed users individually (to trigger hashing)...');
    for (const u of users) {
       await User.create(u);
    }

    const depts = users.filter(u => u.role === 'department').map(u => ({
      name: u.name,
      departmentType: u.departmentType,
      email: u.email
    }));
    await Department.deleteMany({});
    const savedDepts = await Department.insertMany(depts);
    console.log(`✅ Seeded ${savedDepts.length} departments.`);

    // Seed Resources
    await Resource.deleteMany({});
    const initialResources = [
      { departmentType: 'police', name: 'Patrol Cars', quantity: 15, unit: 'vehicles' },
      { departmentType: 'police', name: 'Riot Shields', quantity: 50, unit: 'units' },
      { departmentType: 'fire', name: 'Fire Trucks', quantity: 8, unit: 'vehicles' },
      { departmentType: 'fire', name: 'Oxygen Tanks', quantity: 40, unit: 'tanks' },
      { departmentType: 'ambulance', name: 'Ambulances', quantity: 12, unit: 'vehicles' },
      { departmentType: 'ambulance', name: 'Defibrillators', quantity: 20, unit: 'units' },
    ];
    await Resource.insertMany(initialResources);
    console.log(`✅ Seeded initial resources.`);

    mongoose.connection.close();
    console.log('Database Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
