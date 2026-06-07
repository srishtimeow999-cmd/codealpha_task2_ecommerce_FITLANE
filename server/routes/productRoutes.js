// /server/routes/productRoutes.js
// Routes for product management

import express from 'express';
import {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getCategories
} from '../controllers/productController.js';
import { verifyAuth, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts); // Get all products with filters
router.get('/categories', getCategories); // Get all categories
router.get('/:id', getProductById); // Get single product

// Admin routes
router.post('/admin/add', verifyAuth, verifyAdmin, addProduct); // Add product
router.put('/admin/:id', verifyAuth, verifyAdmin, updateProduct); // Update product
router.delete('/admin/:id', verifyAuth, verifyAdmin, deleteProduct); // Delete product

export default router;
