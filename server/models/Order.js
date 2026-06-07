// /server/models/Order.js
// Defines the structure of Order documents in MongoDB
// Stores order history for users

import mongoose from 'mongoose';

/**
 * Order Item Schema
 * Represents products in an order
 */
const orderItemSchema = new mongoose.Schema({
  // Reference to the product
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // Product details at time of order
  productName: String,
  productImage: String,
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  total: {
    type: Number,
    required: true
  }
});

/**
 * Order Schema
 * Stores complete order information
 */
const orderSchema = new mongoose.Schema(
  {
    // Reference to the user who placed the order
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Items in this order
    items: [orderItemSchema],
    
    // Shipping address
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    
    // Pricing information
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    
    // Tax amount (10% of subtotal)
    tax: {
      type: Number,
      required: true,
      min: 0
    },
    
    // Shipping cost
    shippingCost: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Total order price
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },

    // Order number for customer-facing receipts
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    
    // Order status
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    
    // Payment status
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    
    // Payment method
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'upi'],
      default: 'credit_card'
    },
    
    // Tracking number (for shipping)
    trackingNumber: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true // createdAt and updatedAt for order date tracking
  }
);

export default mongoose.model('Order', orderSchema);
