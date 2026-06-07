// /server/routes/cartRoutes.js
// Routes for shopping cart management

import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart
} from '../controllers/cartController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// All cart routes require authentication
router.use(verifyAuth); // Middleware to check authentication for all cart routes

router.get('/', getCart); // Get user's cart
router.post('/add', addToCart); // Add product to cart
router.delete('/remove/:productId', removeFromCart); // Remove from cart
router.put('/update/:productId', updateCartQuantity); // Update quantity
router.delete('/clear', clearCart); // Clear entire cart

export default router;
