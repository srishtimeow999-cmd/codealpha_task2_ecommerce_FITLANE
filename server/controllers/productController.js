// /server/controllers/productController.js
// Contains functions for managing products

import Product from '../models/Product.js';

/**
 * Get all products with filtering and search
 * GET /api/products?category=Electronics&search=laptop
 */
export const getAllProducts = async (req, res) => {
  try {
    const { category, gender, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    let filter = {};
    
    // Filter by category if provided
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Filter by gender if provided
    const normalizedGender = typeof gender === 'string'
      ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
      : gender;

    if (normalizedGender && normalizedGender !== 'All') {
      filter.gender = normalizedGender;
    }
    
    // Search by title or description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } }, // i = case-insensitive
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Find products and count total
    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    const products = await Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email'); // Include admin/seller info
    
    const totalProducts = await Product.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      products,
      pagination: {
        totalProducts,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalProducts / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products'
    });
  }
};

/**
 * Get single product by ID
 * GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    const product = await Product.findById(id)
      .populate('createdBy', 'name email');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching product'
    });
  }
};

/**
 * Add new product (Admin only)
 * POST /api/products/admin/add
 * Protected route - requires admin authentication
 */
export const addProduct = async (req, res) => {
  try {
    const { title, description, price, category, gender, images, image, stock, featured } = req.body;
    
    // Validation
    if (!title || !description || category == null || gender == null || price == null || stock == null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Normalize image list
    const imageUrls = Array.isArray(images)
      ? images.map(url => String(url).trim()).filter(Boolean)
      : [];
    if (imageUrls.length === 0 && image) {
      imageUrls.push(String(image).trim());
    }
    const normalizedImages = imageUrls.length > 0
      ? imageUrls
      : ['https://via.placeholder.com/300x300?text=Product+Image'];

    // Check if product with same title already exists
    const existingProduct = await Product.findOne({ title });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this title already exists'
      });
    }
    
    // Create new product
    const product = new Product({
      title,
      description,
      price: parseFloat(price),
      category,
      gender,
      images: normalizedImages,
      image: normalizedImages[0],
      stock: parseInt(stock),
      featured: featured === true || featured === 'true',
      createdBy: req.user.id // Admin user ID
    });
    
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product added successfully!',
      product
    });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding product'
    });
  }
};

/**
 * Update product (Admin only)
 * PUT /api/products/admin/:id
 * Protected route - requires admin authentication
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, gender, images, image, stock, featured } = req.body;
    
    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Update fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (category) product.category = category;
    if (gender) product.gender = gender;
    if (Array.isArray(images)) {
      const imageUrls = images.map(url => String(url).trim()).filter(Boolean);
      product.images = imageUrls.length > 0
        ? imageUrls
        : ['https://via.placeholder.com/300x300?text=Product+Image'];
      product.image = product.images[0];
    } else if (image) {
      product.image = image;
      if (!product.images || product.images.length === 0) {
        product.images = [image];
      }
    }
    if (stock !== undefined) product.stock = parseInt(stock);
    if (featured !== undefined) product.featured = featured === true || featured === 'true';
    
    await product.save();
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating product'
    });
  }
};

/**
 * Delete product (Admin only)
 * DELETE /api/products/admin/:id
 * Protected route - requires admin authentication
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully!'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting product'
    });
  }
};

/**
 * Get all categories
 * GET /api/products/categories
 */
export const getCategories = async (req, res) => {
  try {
    const categories = ['Tops', 'T-Shirts', 'Shorts', 'Pants', 'Sports Bra', 'Socks', 'Leggings', 'Sets', 'Accessories'];
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching categories'
    });
  }
};
