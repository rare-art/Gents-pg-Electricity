const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedData = async () => {
  try {
    console.log('🌱 Checking database setup...');

    // Seed or sync Owner User
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
      const isMatch = await bcrypt.compare('Anil@8080', owner.password);
      if (!isMatch) {
        console.log('🔄 Updating Owner password hash to default Anil@8080...');
        const salt = await bcrypt.genSalt(10);
        owner.password = await bcrypt.hash('Anil@8080', salt);
        await owner.save();
        console.log('✅ Owner password updated to default Anil@8080.');
      } else {
        console.log('ℹ️ Owner account active with verified credentials (gorisjohn0@gmail.com)');
      }
    }

    console.log('🎉 Database readiness check complete!');
  } catch (err) {
    console.error('❌ Error during database setup:', err.message);
  }
};

module.exports = seedData;
