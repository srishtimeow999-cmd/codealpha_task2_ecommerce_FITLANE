// /server/controllers/cartController.js
// Contains functions for managing shopping cart

import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * Get user's cart
 * GET /api/cart
 * Protected route - requires authentication
 */
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      'items.product',
      'title image price'
    );
    
    // If cart doesn't exist, create an empty one
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
        totalPrice: 0,
        totalItems: 0
      });
    }
    
    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching cart'
    });
  }
};

/**
 * Add product to cart
 * POST /api/cart/add
 * Protected route - requires authentication
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Validation
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product ID and quantity'
      });
    }
    
    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }
    
    // Get or create user's cart
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
        totalPrice: 0,
        totalItems: 0
      });
    }
    
    // Check if product already in cart
    const existingItem = cart.items.find((item) => {
      try {
        return (
          String(item.product) === String(productId) ||
          String(item.product?._id) === String(productId)
        );
      } catch (e) {
        return false;
      }
    });
    
    if (existingItem) {
      // Update quantity if already in cart
      existingItem.quantity += parseInt(quantity);
      existingItem.total = existingItem.price * existingItem.quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        productName: product.title || product.name || 'Product',
        price: product.price,
        quantity: parseInt(quantity),
        total: product.price * parseInt(quantity)
      });
    }
    
    // Recalculate cart totals
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.total, 0);
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Product added to cart!',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding to cart'
    });
  }
};

/**
 * Remove product from cart
 * DELETE /api/cart/remove/:productId
 * Protected route - requires authentication
 */
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Filter out the product or cart-item id from cart
    cart.items = cart.items.filter((item) => {
      try {
        return (
          String(item.product) !== String(productId) &&
          String(item._id) !== String(productId)
        );
      } catch (e) {
        return true;
      }
    });
    
    // Recalculate totals
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.total, 0);
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Product removed from cart!',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing from cart'
    });
  }
};

/**
 * Update product quantity in cart
 * PUT /api/cart/update/:productId
 * Protected route - requires authentication
 */
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    // Validation
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    // Check if product has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }
    
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Find and update the item (match by product id or cart item id)
    const cartItem = cart.items.find((item) => {
      try {
        return (
          String(item.product) === String(productId) ||
          String(item._id) === String(productId)
        );
      } catch (e) {
        return false;
      }
    });
    
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart'
      });
    }
    
    cartItem.quantity = parseInt(quantity);
    cartItem.total = cartItem.price * cartItem.quantity;
    
    // Recalculate totals
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.total, 0);
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart updated!',
      cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating cart'
    });
  }
};

/**
 * Clear entire cart
 * DELETE /api/cart/clear
 * Protected route - requires authentication
 */
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = [];
    cart.totalPrice = 0;
    cart.totalItems = 0;
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared!',
      cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error clearing cart'
    });
  }
};
