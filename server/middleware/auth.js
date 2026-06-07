// /server/middleware/auth.js
// This middleware checks if a user is logged in using JWT tokens
// JWT tokens are sent in the Authorization header as "Bearer token"

import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT token
 * This protects routes that require authentication
 * 
 * How it works:
 * 1. Client sends JWT token in Authorization header
 * 2. We extract the token and verify it with our JWT_SECRET
 * 3. If valid, we attach user info to the request and proceed
 * 4. If invalid or missing, we reject the request
 */
export const verifyAuth = (req, res, next) => {
  try {
    // Get token from Authorization header (format: "Bearer token")
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Please login.' });
    }
    
    // Extract token by removing "Bearer " prefix
    const token = authHeader.split(' ')[1];
    
    // Verify token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded user info to request for use in other middlewares/routes
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token. Please login again.' });
  }
};

/**
 * Middleware to verify if user is an admin
 * Use this to protect admin-only routes
 * NOTE: This should be used AFTER verifyAuth in the middleware chain
 */
export const verifyAdmin = (req, res, next) => {
  try {
    // req.user is already set by verifyAuth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'No token provided. Please login.' });
    }
    
    // Check if user is admin
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admin rights required.' });
    }
  } catch (error) {
    res.status(403).json({ message: 'Unauthorized access.' });
  }
};
