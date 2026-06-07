// /server/utils/seedData.js
// Script to populate database with sample products
// Run with: npm run seed

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    
    console.log('🧹 Cleared existing data');
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@ecommerce.com',
      password: 'admin123', // Will be hashed automatically
      role: 'admin'
    });
    
    console.log('👤 Admin user created:', adminUser.email);
    
    // Sample sportswear products
    const sampleProducts = [
      {
        title: 'Lifted Performance Leggings',
        description: 'High-compression leggings designed for the toughest workouts with breathable support.',
        price: 2499,
        category: 'Leggings',
        gender: 'Women',
        image: 'https://via.placeholder.com/300x300?text=Performance+Leggings',
        stock: 60,
        featured: true,
        createdBy: adminUser._id
      },
      {
        title: 'Sprint Training Shorts',
        description: 'Lightweight shorts with stretch panels and quick-dry fabric for speed and comfort.',
        price: 1799,
        category: 'Shorts',
        gender: 'Men',
        image: 'https://via.placeholder.com/300x300?text=Training+Shorts',
        stock: 48,
        featured: true,
        createdBy: adminUser._id
      },
      {
        title: 'Core Muscle Tank',
        description: 'Racerback tank with cooling mesh for gym sessions and casual wear.',
        price: 1299,
        category: 'Tops',
        gender: 'Men',
        image: 'https://via.placeholder.com/300x300?text=Muscle+Tank',
        stock: 85,
        createdBy: adminUser._id
      },
      {
        title: 'Essential Sports Bra',
        description: 'Supportive sports bra with removable pads and smooth seamless comfort.',
        price: 1499,
        category: 'Sports Bra',
        gender: 'Women',
        image: 'https://via.placeholder.com/300x300?text=Sports+Bra',
        stock: 75,
        createdBy: adminUser._id
      },
      {
        title: 'Classic Performance Tee',
        description: 'Everyday workout tee built with moisture-wicking fabric and relaxed fit.',
        price: 999,
        category: 'T-Shirts',
        gender: 'Men',
        image: 'https://via.placeholder.com/300x300?text=Performance+Tee',
        stock: 120,
        featured: true,
        createdBy: adminUser._id
      },
      {
        title: 'Comfy Yoga Set',
        description: 'Matching top and leggings set designed for yoga, pilates, and lounge days.',
        price: 3399,
        category: 'Sets',
        gender: 'Women',
        image: 'https://via.placeholder.com/300x300?text=Yoga+Set',
        stock: 40,
        createdBy: adminUser._id
      },
      {
        title: 'Urban Track Jacket',
        description: 'Slim-fit track jacket with zip pockets and breathable panels for warm-ups.',
        price: 2899,
        category: 'Tops',
        gender: 'Men',
        image: 'https://via.placeholder.com/300x300?text=Track+Jacket',
        stock: 35,
        createdBy: adminUser._id
      },
      {
        title: 'Recovery Hoodie',
        description: 'Soft hooded sweatshirt made for post-workout comfort and weekend style.',
        price: 2499,
        category: 'Tops',
        gender: 'Women',
        image: 'https://via.placeholder.com/300x300?text=Recovery+Hoodie',
        stock: 50,
        createdBy: adminUser._id
      },
      {
        title: 'All-Day Sports Socks',
        description: 'Breathable socks with arch support and extra cushioning for active days.',
        price: 499,
        category: 'Socks',
        gender: 'Women',
        image: 'https://via.placeholder.com/300x300?text=Sports+Socks',
        stock: 150,
        createdBy: adminUser._id
      },
      {
        title: 'Performance Gym Bag',
        description: 'Durable gym bag with separate shoe compartment and water-resistant finish.',
        price: 1999,
        category: 'Accessories',
        gender: 'Men',
        image: 'https://via.placeholder.com/300x300?text=Gym+Bag',
        stock: 38,
        createdBy: adminUser._id
      }
    ];
    
    // Create products
    const createdProducts = await Product.insertMany(sampleProducts);
    
    console.log(`✅ ${createdProducts.length} sample products created!`);
    console.log('📦 Products created:');
    createdProducts.forEach((product) => {
      console.log(`   - ${product.title} (₹${product.price}, Stock: ${product.stock})`);
    });
    
    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📝 Sample credentials:');
    console.log('   Email: admin@ecommerce.com');
    console.log('   Password: admin123');
    
    // Close database connection
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run seed function
seedData();
