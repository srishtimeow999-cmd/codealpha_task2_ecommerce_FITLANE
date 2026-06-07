// /server/models/Product.js
// Defines the structure of Product documents in MongoDB

import mongoose from 'mongoose';

/**
 * Product Schema
 * Stores product information for the e-commerce store
 */
const productSchema = new mongoose.Schema(
  {
    // Product title
    title: {
      type: String,
      required: [true, 'Please provide a product title'],
      trim: true,
      maxlength: [200, 'Product title cannot be more than 200 characters']
    },
    
    // Product description
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    
    // Product price
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
      max: [999999, 'Price cannot be more than 999999']
    },
    
    // Product category
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Tops', 'T-Shirts', 'Shorts', 'Pants', 'Sports Bra', 'Socks', 'Leggings', 'Sets', 'Accessories'],
      default: 'Tops'
    },

    // Product gender category
    gender: {
      type: String,
      required: [true, 'Please provide a gender category'],
      enum: ['Men', 'Women'],
      default: 'Men'
    },
    
    // Product image URLs
    images: {
      type: [String],
      default: ['https://via.placeholder.com/300x300?text=Product+Image']
    },

    // Legacy single product image
    image: {
      type: String
    },
    
    // Stock quantity
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative']
    },
    
    // Featured product flag
    featured: {
      type: Boolean,
      default: false
    },
    
    // Admin/seller who created this product
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true // Automatically add createdAt and updatedAt fields
  }
);

export default mongoose.model('Product', productSchema);
