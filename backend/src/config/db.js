// src/config/db.js
const mongoose = require('mongoose');

const connectDB = async (uri) => {
  try {
    if (!uri) {
      console.warn('⚠️  MONGO_URI not set. Running without database. Some features may not work.');
      return;
    }
    
    await mongoose.connect(uri, {
      // optional mongoose options can go here
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.warn('⚠️  Continuing without database. Some features may not work.');
    // Don't exit - allow app to run without DB for development
  }
};

module.exports = connectDB;
