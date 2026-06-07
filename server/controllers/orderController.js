// /server/controllers/orderController.js
// Contains functions for managing orders

import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';

/**
 * Create new order from cart
 * POST /api/orders/create
 * Protected route - requires authentication
 */
export const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    
    // Get user's cart without relying on fully populated product data
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Add products before placing an order.'
      });
    }
    
    // Validate shipping address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete shipping address'
      });
    }
    
    // Get user details for default address
    const user = await User.findById(req.user.id);
    
    // Calculate totals
    const subtotal = cart.totalPrice;
    const tax = Math.round(subtotal * 0.1 * 100) / 100; // 10% tax
    const shippingCost = subtotal > 5000 ? 0 : 100; // Free shipping over ₹5000
    const totalPrice = subtotal + tax + shippingCost;
    
    // Build order items defensively: support populated product docs, raw ObjectId refs,
    // and gracefully handle malformed/null product entries.
    const orderItems = cart.items
      .filter((ci) => ci)
      .map((ci) => {
        let productId = null;
        if (ci.product) {
          if (typeof ci.product === 'object' && ci.product._id) {
            productId = ci.product._id;
          } else if (typeof ci.product === 'string' || typeof ci.product === 'number') {
            productId = ci.product;
          }
        }

        if (!productId) {
          console.warn('Skipping cart item without valid product reference during order creation:', ci);
          return null;
        }

        return {
          product: productId,
          productName: ci.productName || (ci.product && ci.product.title) || 'Product',
          productImage: (ci.product && ci.product.image) || 'https://via.placeholder.com/300x300',
          price: ci.price,
          quantity: ci.quantity,
          total: ci.total
        };
      })
      .filter(Boolean);

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart contains invalid or unavailable items. Please update your cart and try again.'
      });
    }

    const orderNumber = `FL-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    
    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      subtotal,
      tax,
      shippingCost,
      totalPrice,
      orderNumber,
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    await order.save();
    
    // Clear the cart after order is created
    cart.items = [];
    cart.totalPrice = 0;
    cart.totalItems = 0;
    await cart.save();
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order,
      orderDetails: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        subtotal,
        tax,
        shippingCost,
        totalPrice,
        itemCount: orderItems.length
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating order'
    });
  }
};

/**
 * Get all orders for a user
 * GET /api/orders
 * Protected route - requires authentication
 */
export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Get orders
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const totalOrders = await Order.countDocuments({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      orders,
      pagination: {
        totalOrders,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching orders'
    });
  }
};

/**
 * Get single order by ID
 * GET /api/orders/:id
 * Protected route - requires authentication
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    
    const order = await Order.findById(id)
      .populate('items.product')
      .populate('user', 'name email phone');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order belongs to current user (security check)
    const orderUserId = order.user?._id || order.user;
    if (String(orderUserId) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order'
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching order'
    });
  }
};

/**
 * Update order status (Admin only)
 * PUT /api/orders/admin/:id/status
 * Protected route - requires admin authentication
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, trackingNumber } = req.body;
    
    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Update order
    const order = await Order.findByIdAndUpdate(
      id,
      {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(trackingNumber && { trackingNumber })
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Order updated successfully!',
      order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating order'
    });
  }
};

/**
 * Get order statistics (Admin only)
 * GET /api/orders/admin/stats
 */
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processedOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    
    // Calculate total revenue
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        processedOrders,
        shippedOrders,
        deliveredOrders,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching order statistics'
    });
  }
};
