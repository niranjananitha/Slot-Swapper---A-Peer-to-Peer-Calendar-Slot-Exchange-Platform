const mongoose = require('mongoose');
require('dotenv').config();

const dropEmailIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/slotswapper');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    try {
      await collection.dropIndex('email_1');
      console.log('Dropped email unique index');
    } catch (error) {
      console.log('Email index does not exist or already dropped');
    }
    
    console.log('Index cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('Index cleanup failed:', error);
    process.exit(1);
  }
};

dropEmailIndex();