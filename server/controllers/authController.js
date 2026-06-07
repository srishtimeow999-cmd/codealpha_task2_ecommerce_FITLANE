// /server/controllers/authController.js
// Contains functions for user registration, login, and logout

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Generate JWT Token
 * Creates a token that identifies the user
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role }, // payload (data to encode)
    process.env.JWT_SECRET, // secret key to sign with
    { expiresIn: process.env.JWT_EXPIRE } // token expiration time
  );
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    // Validation: check if all required fields are provided
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Validation: check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login.'
      });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password // Password will be hashed automatically by the model's pre-save hook
    });
    
    // Save user to database
    await user.save();
    
    // Generate token for automatic login after registration
    const token = generateToken(user._id, user.role);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering user'
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation: check if email and password provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Find user by email
    // We use 'select: false' on password in the schema, so we need to explicitly select it
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Compare entered password with hashed password in database
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate token for this session
    const token = generateToken(user._id, user.role);
    
    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in'
    });
  }
};

/**
 * Get current logged-in user
 * GET /api/auth/me
 * Protected route - requires authentication
 */
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the verifyAuth middleware
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user'
    });
  }
};

/**
 * Update user profile
 * PUT /api/auth/update
 * Protected route - requires authentication
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    // Find and update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined
      },
      { new: true } // Return updated user data
    );
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 * (Token is deleted from client-side storage)
 */
export const logoutUser = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully! Token has been removed from your device.'
  });
};
