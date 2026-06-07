// /server/routes/orderRoutes.js
// Routes for order management

import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats
} from '../controllers/orderController.js';
import { verifyAuth, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// User routes (require authentication)
router.post('/create', verifyAuth, createOrder); // Create new order
router.get('/', verifyAuth, getUserOrders); // Get user's orders
router.get('/:id', verifyAuth, getOrderById); // Get single order

// Admin routes
router.put('/admin/:id/status', verifyAuth, verifyAdmin, updateOrderStatus); // Update order status
router.get('/admin/stats', verifyAuth, verifyAdmin, getOrderStats); // Get order statistics

export default router;
