// /server/models/Cart.js
// Defines the structure of Cart documents in MongoDB
// Each user has their own cart

import mongoose from 'mongoose';

/**
 * Cart Item Schema
 * Represents a single item in a cart
 */
const cartItemSchema = new mongoose.Schema({
  // Reference to the product
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // Product name (stored for quick access)
  productName: String,
  
  // Product price at time of adding to cart
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Quantity of this product in cart
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [10, 'Quantity cannot be more than 10']
  },
  
  // Total price for this line item (price * quantity)
  total: {
    type: Number,
    required: true
  }
});

/**
 * Cart Schema
 * Each user has one cart containing multiple items
 */
const cartSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this cart
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // Each user can have only one cart
    },
    
    // Array of items in cart
    items: [cartItemSchema],
    
    // Total price of all items in cart
    totalPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Number of items in cart
    totalItems: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Cart', cartSchema);
