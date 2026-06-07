// /server/routes/authRoutes.js
// Routes for user authentication

import express from 'express';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser,
  updateProfile 
} from '../controllers/authController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Handle CORS preflight requests
router.options('*', (req, res) => {
  res.status(200).end();
});

// Public routes
router.post('/register', registerUser); // Register new user
router.post('/login', loginUser); // Login user
router.post('/logout', logoutUser); // Logout user

// Protected routes (require authentication)
router.get('/me', verifyAuth, getCurrentUser); // Get current user info
router.put('/update', verifyAuth, updateProfile); // Update user profile

export default router;
