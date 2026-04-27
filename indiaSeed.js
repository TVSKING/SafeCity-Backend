const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const cities = [
  { name: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { name: 'Vijayawada', state: 'Andhra Pradesh' },
  { name: 'Guntur', state: 'Andhra Pradesh' },
  { name: 'Patna', state: 'Bihar' },
  { name: 'Gaya', state: 'Bihar' },
  { name: 'Bhagalpur', state: 'Bihar' },
  { name: 'Raipur', state: 'Chhattisgarh' },
  { name: 'Bilaspur', state: 'Chhattisgarh' },
  { name: 'Durg', state: 'Chhattisgarh' },
  { name: 'Ahmedabad', state: 'Gujarat' },
  { name: 'Surat', state: 'Gujarat' },
  { name: 'Rajkot', state: 'Gujarat' },
  { name: 'Gurugram', state: 'Haryana' },
  { name: 'Faridabad', state: 'Haryana' },
  { name: 'Panipat', state: 'Haryana' },
  { name: 'Ranchi', state: 'Jharkhand' },
  { name: 'Jamshedpur', state: 'Jharkhand' },
  { name: 'Dhanbad', state: 'Jharkhand' },
  { name: 'Bengaluru', state: 'Karnataka' },
  { name: 'Mysuru', state: 'Karnataka' },
  { name: 'Mangaluru', state: 'Karnataka' },
  { name: 'Thiruvananthapuram', state: 'Kerala' },
  { name: 'Kochi', state: 'Kerala' },
  { name: 'Kozhikode', state: 'Kerala' },
  { name: 'Bhopal', state: 'Madhya Pradesh' },
  { name: 'Indore', state: 'Madhya Pradesh' },
  { name: 'Gwalior', state: 'Madhya Pradesh' },
  { name: 'Mumbai', state: 'Maharashtra' },
  { name: 'Pune', state: 'Maharashtra' },
  { name: 'Nagpur', state: 'Maharashtra' },
  { name: 'Bhubaneswar', state: 'Odisha' },
  { name: 'Cuttack', state: 'Odisha' },
  { name: 'Rourkela', state: 'Odisha' },
  { name: 'Ludhiana', state: 'Punjab' },
  { name: 'Amritsar', state: 'Punjab' },
  { name: 'Jalandhar', state: 'Punjab' },
  { name: 'Jaipur', state: 'Rajasthan' },
  { name: 'Jodhpur', state: 'Rajasthan' },
  { name: 'Udaipur', state: 'Rajasthan' },
  { name: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Coimbatore', state: 'Tamil Nadu' },
  { name: 'Madurai', state: 'Tamil Nadu' },
  { name: 'Hyderabad', state: 'Telangana' },
  { name: 'Warangal', state: 'Telangana' },
  { name: 'Nizamabad', state: 'Telangana' },
  { name: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Kanpur', state: 'Uttar Pradesh' },
  { name: 'Varanasi', state: 'Uttar Pradesh' },
  { name: 'Dehradun', state: 'Uttarakhand' },
  { name: 'Haridwar', state: 'Uttarakhand' },
  { name: 'Haldwani', state: 'Uttarakhand' },
  { name: 'Kolkata', state: 'West Bengal' },
  { name: 'Siliguri', state: 'West Bengal' },
  { name: 'Asansol', state: 'West Bengal' },
  { name: 'Guwahati', state: 'Assam' },
  { name: 'Imphal', state: 'Manipur' },
  { name: 'Shillong', state: 'Meghalaya' }
];

const seedShortIndia = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/safecity_db');
    console.log('Connected to MongoDB. Starting Shortened Nationwide Seed...');

    // Clean up first
    await User.deleteMany({ role: 'department' });
    await Department.deleteMany({});
    
    let credentialsText = "SAFECITY NATIONWIDE CREDENTIALS\n================================\n\n";

    for (const city of cities) {
      const types = [
        { label: 'Police', type: 'police' },
        { label: 'Fire', type: 'fire' },
        { label: 'Hospital', type: 'ambulance' }
      ];

      // Create a short prefix (e.g., Visakhapatnam -> visa, Rajkot -> rajk)
      const prefix = city.name.substring(0, 4).toLowerCase();

      for (const t of types) {
        const cleanName = `${city.name} ${t.label}`;
        const shortId = `${prefix}${t.type.substring(0, 4)}`;
        
        const userData = {
          name: cleanName,
          email: `${shortId}@safe.com`,
          password: `${shortId}123`,
          role: 'department',
          departmentType: t.type,
          address: `${cleanName} HQ, ${city.name}, ${city.state}`,
          phone: '100',
          isActive: true
        };

        const newUser = await User.create(userData);
        await Department.create({
          name: newUser.name,
          departmentType: newUser.departmentType,
          email: newUser.email
        });
        
        credentialsText += `City: ${city.name} (${city.state}) | Dept: ${t.label}\nEmail: ${userData.email}\nPassword: ${userData.password}\n--------------------------------\n`;
        console.log(`✅ Created: ${newUser.name} (${userData.email})`);
      }
    }

    // Write file outside the project folder (Hackathon folder)
    const filePath = path.join(__dirname, '..', '..', 'city_credentials.txt');
    fs.writeFileSync(filePath, credentialsText);
    console.log(`\n📄 Credentials saved to: ${filePath}`);

    console.log('Nationwide Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedShortIndia();
