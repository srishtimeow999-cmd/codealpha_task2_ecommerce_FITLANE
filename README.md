# ShopHub - E-Commerce Store

A complete, beginner-friendly e-commerce platform built with HTML, CSS, JavaScript, Node.js, Express, and MongoDB.

## 🎯 Features

### User Features
- ✅ User registration and login
- ✅ JWT authentication
- ✅ Profile management
- ✅ Secure password encryption with bcrypt

### Product Features
- ✅ Product listing with search
- ✅ Category filtering
- ✅ Product details page
- ✅ Admin product management (add, edit, delete)
- ✅ Stock management

### Shopping Cart
- ✅ Add/remove items
- ✅ Update quantities
- ✅ Cart persistence per user
- ✅ Real-time totals with tax calculation

### Order Management
- ✅ Checkout process
- ✅ Order history
- ✅ Order tracking
- ✅ Admin order management

### UI/UX
- ✅ Modern, responsive design
- ✅ Mobile-first approach
- ✅ Toast notifications
- ✅ Loading states
- ✅ Clean ecommerce design

## 📁 Project Structure

```
ecommerce-store/
├── client/                 # Frontend files
│   ├── css/
│   │   └── style.css      # All styling (responsive)
│   ├── js/
│   │   ├── api.js         # API communication layer
│   │   ├── auth.js        # Auth state management
│   │   ├── home.js        # Homepage logic
│   │   ├── login.js       # Login page
│   │   ├── register.js    # Registration page
│   │   ├── products.js    # Products page with filters
│   │   ├── cart.js        # Cart management
│   │   └── checkout.js    # Checkout process
│   ├── images/            # Product images (placeholder URLs used)
│   ├── index.html         # Homepage
│   ├── products.html      # Products listing page
│   ├── product.html       # Single product page (optional)
│   ├── cart.html          # Shopping cart page
│   ├── checkout.html      # Checkout page
│   ├── login.html         # Login page
│   └── register.html      # Registration page
│
├── server/                # Backend files
│   ├── config/
│   │   └── database.js    # MongoDB connection
│   ├── models/
│   │   ├── User.js        # User schema
│   │   ├── Product.js     # Product schema
│   │   ├── Cart.js        # Cart schema
│   │   └── Order.js       # Order schema
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── productController.js # Product logic
│   │   ├── cartController.js    # Cart logic
│   │   └── orderController.js   # Order logic
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── productRoutes.js     # Product endpoints
│   │   ├── cartRoutes.js        # Cart endpoints
│   │   └── orderRoutes.js       # Order endpoints
│   ├── middleware/
│   │   └── auth.js        # JWT verification middleware
│   ├── utils/
│   │   ├── errorHandler.js # Error handling
│   │   └── seedData.js    # Database seeding
│   └── server.js          # Main server file
│
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore file
├── package.json          # Dependencies
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone or navigate to project directory**
```bash
cd ecommerce-store
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
# Create .env file from template
cp .env.example .env

# Edit .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/ecommerce-store
# PORT=5000
# JWT_SECRET=your_super_secret_key
# CLIENT_URL=http://localhost:3000
```

4. **Seed sample data (optional)**
```bash
npm run seed
```

This will create:
- Admin user: `admin@ecommerce.com` / `admin123`
- 12 sample products across different categories

5. **Start the server**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run at: `http://localhost:5000`

6. **Open frontend**
- Open `client/index.html` in a browser
- Or use Live Server extension in VS Code

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/update` - Update profile (protected)
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories` - Get categories
- `POST /api/products/admin/add` - Add product (admin only)
- `PUT /api/products/admin/:id` - Update product (admin only)
- `DELETE /api/products/admin/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user's cart (protected)
- `POST /api/cart/add` - Add to cart (protected)
- `DELETE /api/cart/remove/:productId` - Remove from cart (protected)
- `PUT /api/cart/update/:productId` - Update quantity (protected)
- `DELETE /api/cart/clear` - Clear cart (protected)

### Orders
- `POST /api/orders/create` - Create order (protected)
- `GET /api/orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get order details (protected)
- `PUT /api/orders/admin/:id/status` - Update order (admin only)
- `GET /api/orders/admin/stats` - Order statistics (admin only)

## 🔐 Authentication

### How JWT Works
1. User logs in with email/password
2. Server validates and returns JWT token
3. Client stores token in localStorage
4. For protected routes, client sends token in Authorization header
5. Server verifies token before allowing access

### Protected Routes
Add this check on frontend before accessing protected pages:
```javascript
if (!isLoggedIn()) {
  window.location.href = 'login.html';
}
```

## 💾 Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  address: Object,
  phone: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Product
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String (URL),
  stock: Number,
  rating: Number,
  numReviews: Number,
  createdBy: User reference,
  createdAt: Date,
  updatedAt: Date
}
```

### Cart
```javascript
{
  user: User reference,
  items: [
    {
      product: Product reference,
      productName: String,
      price: Number,
      quantity: Number,
      total: Number
    }
  ],
  totalPrice: Number,
  totalItems: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  user: User reference,
  items: [OrderItem],
  shippingAddress: Object,
  subtotal: Number,
  tax: Number,
  shippingCost: Number,
  totalPrice: Number,
  status: String (pending/processing/shipped/delivered/cancelled),
  paymentStatus: String,
  paymentMethod: String,
  trackingNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🌐 Connecting Frontend and Backend

### API Configuration
Frontend automatically connects to backend at `http://localhost:5000`

To change API URL, edit in `client/js/api.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url/api';
```

### CORS Configuration
Backend allows requests from `CLIENT_URL` defined in .env

## 📱 Mobile Responsiveness

- CSS Grid and Flexbox for responsive layouts
- Mobile-first design approach
- Hamburger menu for mobile navigation
- Touch-friendly buttons and inputs
- Responsive product grid (auto-fit)
- Mobile optimized modals and forms

## 🎨 Customization

### Change Colors
Edit CSS variables in `client/css/style.css`:
```css
:root {
  --primary-color: #ff6b35;
  --secondary-color: #004e89;
  --success-color: #38a169;
  --danger-color: #e53e3e;
}
```

### Modify Product Categories
Update in `server/models/Product.js`:
```javascript
enum: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Custom']
```

## 🚀 Deployment

### Deploy Backend to Render

1. **Push code to GitHub**
   - Create GitHub repository
   - Push ecommerce-store folder

2. **Create Render account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Deploy Node.js app**
   - New → Web Service
   - Connect GitHub repo
   - Build command: `npm install`
   - Start command: `npm start`
   - Add environment variables in Render dashboard

4. **Update MongoDB URI**
   - Use MongoDB Atlas (cloud) for production
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string
   - Add to .env in Render

### Deploy Frontend to Vercel

1. **Push frontend to GitHub**
   - Create separate repo for client folder
   - Or use Vercel's import from folder option

2. **Deploy with Vercel**
   - Go to https://vercel.com
   - Import from GitHub
   - Deploy

3. **Update API URL**
   - Set in deployment environment
   - Or hardcode in production build

### Alternative: Deploy to Netlify

1. **Build frontend**
```bash
# Create dist folder with all files
# Zip client folder
```

2. **Deploy**
   - Drag and drop to Netlify
   - Or connect GitHub

## 📝 Environment Variables

Create `.env` file:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecommerce-store
# For Atlas: mongodb+srv://user:pass@cluster.mongodb.net/ecommerce-store

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- Ensure MongoDB is running
- Check connection string in .env
- Verify MongoDB port (default: 27017)

### "CORS error" 
- Check CLIENT_URL in .env
- Ensure frontend and backend URLs match

### "Token expired"
- Clear localStorage in browser
- Log in again
- Tokens expire after 7 days (configurable)

### "Product images not loading"
- Using placeholder images by default
- Replace with real image URLs
- Images stored as URLs, not local files

## 📚 Learning Resources

- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Authentication](https://jwt.io/)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [CSS Grid & Flexbox](https://css-tricks.com/)

## 💡 Next Steps to Enhance

1. Add payment gateway (Stripe, Razorpay)
2. Add product reviews and ratings
3. Add wishlist feature
4. Implement email notifications
5. Add product inventory management
6. Create admin dashboard
7. Add image upload functionality
8. Implement caching with Redis
9. Add unit tests
10. Add analytics and reporting

## 👥 Team

Built with ❤️ for learning purposes

## 📄 License

MIT License - Feel free to use for learning

## 🤝 Support

For issues or questions, please check the code comments and documentation in each file.

---

**Happy Coding! 🚀**
