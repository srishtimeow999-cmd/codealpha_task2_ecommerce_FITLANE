// /server/config/database.js
// This file handles the connection to MongoDB
// We use Mongoose as an ODM (Object Data Modeling) tool

import mongoose from 'mongoose';

/**
 * Connects to MongoDB database
 * Mongoose provides us with methods to interact with MongoDB easily
 * It also validates data according to our defined schemas
 */
const connectDB = async () => {
  try {
    // process.env.MONGODB_URI gets the database URL from .env file
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce-store';
    const conn = await mongoose.connect(mongoUri);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // Exit the process if database connection fails (restart required)
    process.exit(1);
  }
};

export default connectDB;
