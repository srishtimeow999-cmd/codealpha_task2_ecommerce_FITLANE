// /server/models/User.js
// Defines the structure of User documents in MongoDB

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

/**
 * User Schema
 * Stores user information with password encryption
 */
const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters']
    },
    
    // User's email - must be unique
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    
    // Hashed password (never stored as plain text!)
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password by default when querying
    },
    
    // User role - can be 'user' or 'admin'
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    
    // User's shipping address
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    
    // User's phone number
    phone: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true // Automatically add createdAt and updatedAt fields
  }
);

/**
 * Hash password before saving
 * This middleware runs before we save a user to ensure password is encrypted
 */
userSchema.pre('save', async function (next) {
  // Only hash if password is modified/new
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt (random string for hashing)
    const salt = await bcryptjs.genSalt(10);
    // Hash the password with the salt
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare passwords during login
 * User enters password -> compare with hashed password in DB
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
