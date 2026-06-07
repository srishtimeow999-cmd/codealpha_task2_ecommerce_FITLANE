// /server/server.js
// Main server file - Entry point for the backend application

import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { ensureAdminUser } from './utils/ensureAdmin.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const baseDir = path.resolve();

// ============= MIDDLEWARE =============

// Enable CORS (allows frontend to communicate with backend)
// Accept requests from any origin in development, including file:// loads.
app.use(cors({
  origin: true,
  credentials: true
}));
app.options('*', cors());

// Parse incoming JSON requests
// This allows us to access req.body in our routes
app.use(express.json());

// Parse URL-encoded data (for form submissions)
app.use(express.urlencoded({ extended: true }));

// ============= DATABASE CONNECTION =============
// Connect to MongoDB when server starts

const startServer = async () => {
  try {
    await connectDB();
    await ensureAdminUser();

    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
      next();
    });

    // ============= ROUTES =============

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ message: '✅ Server is running!' });
    });

    // Use routes - IMPORTANT: These must be registered BEFORE static and fallback routes
    app.use('/api/auth', authRoutes); // Authentication routes
    app.use('/api/products', productRoutes); // Product routes
    app.use('/api/cart', cartRoutes); // Cart routes
    app.use('/api/orders', orderRoutes); // Order routes

    // Serve frontend static files from the client directory
    app.use(express.static(path.join(baseDir, 'client')));

    // Fallback to index.html for frontend routes (MUST be last)
    app.get('*', (req, res) => {
      res.sendFile(path.join(baseDir, 'client', 'index.html'));
    });

    // ============= ERROR HANDLING MIDDLEWARE =============
    // Global error handler (catches all errors from routes)
    app.use((err, req, res, next) => {
      console.error(err.stack);
      
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Something went wrong!';
      
      res.status(statusCode).json({
        success: false,
        message: message,
        statusCode: statusCode
      });
    });

    // ============= 404 HANDLER =============
    // Handle requests to undefined routes (MUST be after error handler)
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });

    // ============= START SERVER =============
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📝 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
