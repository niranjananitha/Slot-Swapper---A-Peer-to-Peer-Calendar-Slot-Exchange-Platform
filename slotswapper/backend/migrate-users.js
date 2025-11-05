const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const migrateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/slotswapper');
    
    const users = await User.find({ familyId: { $exists: false } });
    
    for (const user of users) {
      const familyId = user.email.replace(/[^a-z0-9]/g, '');
      user.familyId = familyId;
      await user.save();
      console.log(`Updated user ${user.name} with familyId: ${familyId}`);
    }
    
    console.log('Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateUsers();