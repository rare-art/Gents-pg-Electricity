const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedData = async () => {
  try {
    console.log('🌱 Checking database setup...');

    // Seed Owner User if missing
    let owner = await User.findOne({ role: 'owner' });
    if (!owner) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Anil@8080', salt);
      owner = await User.create({
        username: 'owner',
        email: 'gorisjohn0@gmail.com',
        password: hashedPassword,
        name: 'GentsPG Owner',
        role: 'owner'
      });
      console.log('✅ Owner account created (gorisjohn0@gmail.com)');
    } else {
      console.log('ℹ️ Owner account already exists');
    }

    console.log('🎉 Database readiness check complete!');
  } catch (err) {
    console.error('❌ Error during database setup:', err.message);
  }
};

module.exports = seedData;
