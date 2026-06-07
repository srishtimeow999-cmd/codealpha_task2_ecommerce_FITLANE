# 🔧 Troubleshooting Guide

Common issues and their solutions for ShopHub E-Commerce Store

## 🚫 Backend Issues

### Issue: "Cannot find module 'express'"

**Error Message:**
```
Error: Cannot find module 'express'
```

**Causes:**
- Dependencies not installed
- Wrong directory

**Solutions:**
1. Make sure you're in `ecommerce-store` directory
2. Run: `npm install`
3. Wait for all packages to install
4. Then run: `npm run dev`

---

### Issue: "MongoDB connection failed"

**Error Message:**
```
Error connecting to MongoDB: connect ECONNREFUSED
```

**Causes:**
- MongoDB not running
- Wrong connection string in .env
- MongoDB port (27017) already in use

**Solutions:**

**Option 1: Local MongoDB**
```bash
# Windows
net start MongoDB

# Mac (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Option 2: MongoDB Atlas**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (takes 5-10 minutes)
4. Get connection string
5. Update MONGODB_URI in .env:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce-store
   ```

---

### Issue: "Port 5000 already in use"

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Causes:**
- Another app using port 5000
- Previous server instance still running

**Solutions:**

**Option 1: Kill the process**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

**Option 2: Use different port**
1. Edit `.env` file
2. Change: `PORT=5001`
3. Restart server

---

### Issue: "CORS error" in browser console

**Error Message:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Causes:**
- Frontend URL not in CORS whitelist
- CLIENT_URL mismatch

**Solutions:**
1. Check `.env` file
2. Verify CLIENT_URL matches your frontend URL:
   ```
   CLIENT_URL=http://localhost:3000
   ```
3. If using different port, update accordingly
4. Restart backend server

---

### Issue: "Invalid token" or "Token expired"

**Error Message:**
```
Invalid or expired token. Please login again.
```

**Causes:**
- Token expired (7 days default)
- Invalid JWT_SECRET
- Token corrupted in localStorage

**Solutions:**
1. Clear browser localStorage:
   ```javascript
   // In browser console (F12)
   localStorage.clear()
   ```
2. Log out and log in again
3. Or refresh page and try again

---

### Issue: Seed data not creating

**Error Message:**
```
No admin user created
Products not added
```

**Causes:**
- MongoDB not connected
- Collections already exist
- Permissions issue

**Solutions:**
1. Verify MongoDB is running
2. Clear database collections (if needed)
3. Run seed again: `npm run seed`
4. Check terminal output for errors

---

## 🖥️ Frontend Issues

### Issue: "Cannot connect to server" or "API error"

**Error Message:**
```
Failed to fetch
```

**Causes:**
- Backend not running
- Wrong API URL
- CORS issue

**Solutions:**
1. Verify backend is running: `npm run dev`
2. Check API URL in `client/js/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```
3. Test API health: `http://localhost:5000/api/health`

---

### Issue: Page not loading or blank screen

**Causes:**
- JavaScript error
- Wrong file path
- CORS headers missing

**Solutions:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Verify all file paths are correct
5. Check if backend is running

---

### Issue: "Cannot GET /index.html"

**Causes:**
- Not using Live Server
- File path incorrect
- Wrong working directory

**Solutions:**
1. Use Live Server extension (easiest)
2. Or use: `cd client && python -m http.server 3000`
3. Or use: `http-server` npm package
4. Don't directly open file in browser

---

### Issue: Cart not persisting / showing empty

**Error Message:**
```
Your cart is empty
```

**Causes:**
- Not logged in
- Cart data lost
- localStorage cleared
- Different browser/device

**Solutions:**
1. Ensure you're logged in
2. Check if logged in: Look at navbar
3. Add items to cart again
4. Cart is per-user, not global

---

### Issue: Images not loading

**Error Message:**
```
Broken image icon / 404
```

**Causes:**
- Using placeholder URLs (intentional)
- Real image URLs not updated
- Image server down

**Solutions:**
1. This is normal - using placeholder images
2. To use real images:
   - Find image URLs
   - Update product image field in database
   - Or seed new data with real URLs

---

### Issue: Checkout form not submitting

**Causes:**
- Validation errors
- Network error
- Invalid data

**Solutions:**
1. Fill all fields (marked with *)
2. Use valid format for addresses
3. Check browser console for errors
4. Verify backend is running

---

## 🔐 Authentication Issues

### Issue: Cannot register account

**Error Message:**
```
Email already registered
or
Passwords do not match
```

**Solutions:**
1. **Email already exists:**
   - Use different email address
   - Or clear database and reseed

2. **Passwords don't match:**
   - Make sure confirmation password is identical
   - Check for extra spaces or caps lock

3. **Password too short:**
   - Minimum 6 characters required

---

### Issue: Cannot login

**Error Message:**
```
Invalid email or password
```

**Solutions:**
1. Verify email is correct (case-sensitive)
2. Verify password is correct
3. Check CAPS LOCK is off
4. Make sure account was registered
5. Try demo account: `admin@ecommerce.com` / `admin123`

---

### Issue: Logout not working

**Causes:**
- JavaScript error
- Token not being cleared

**Solutions:**
1. Manual logout:
   ```javascript
   // In browser console
   localStorage.clear()
   location.reload()
   ```
2. Check if logout button is visible
3. Verify backend is running

---

## 📱 Mobile/Responsive Issues

### Issue: Page not responsive on mobile

**Causes:**
- Viewport meta tag missing
- CSS media queries not applied
- JavaScript not handling touch

**Solutions:**
1. Check HTML head has:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```
2. Open DevTools (F12) → Toggle Device Toolbar
3. Test on different screen sizes
4. Hamburger menu should appear on mobile

---

### Issue: Hamburger menu not appearing

**Causes:**
- CSS not applied
- JavaScript not running
- Viewport not set

**Solutions:**
1. Check CSS file is linked
2. Open DevTools (F12)
3. Check if hamburger element is visible
4. Check JavaScript console for errors

---

## 📊 Database Issues

### Issue: Products not showing

**Causes:**
- No products in database
- Filter/search too strict
- Pagination issue

**Solutions:**
1. Run seed data: `npm run seed`
2. Clear filters on products page
3. Check database directly with MongoDB Compass
4. Verify API returns products: `http://localhost:5000/api/products`

---

### Issue: Cart not saving

**Causes:**
- User not logged in
- Database not saving
- Permission issue

**Solutions:**
1. Ensure logged in (check navbar)
2. Check browser console for errors
3. Verify MongoDB is running
4. Try adding again

---

## 🔍 Debugging Techniques

### Enable Debug Logging

**Backend:**
```bash
# Set environment variable
export DEBUG=* (Linux/Mac)
set DEBUG=* (Windows)

# Or view logs
npm run dev
# Look at console output
```

**Frontend:**
```javascript
// Add to api.js for more logging
const apiCall = async (endpoint, method = 'GET', data = null) => {
  console.log(`API Call: ${method} ${endpoint}`, data);
  // ... rest of function
};
```

---

### Browser DevTools

**F12 or Right-Click → Inspect**

**Useful Tabs:**
1. **Console** - JavaScript errors and logs
2. **Network** - API requests and responses
3. **Application** - localStorage and cookies
4. **Elements** - HTML/CSS inspection
5. **Sources** - JavaScript debugging

**Common Checks:**
```javascript
// Check if logged in
console.log(localStorage.getItem('token'))

// Check current user
console.log(localStorage.getItem('currentUser'))

// Check API URL
console.log(API_BASE_URL)

// Make test API call
fetch('http://localhost:5000/api/health').then(r => r.json()).then(console.log)
```

---

### MongoDB Compass (Optional)

1. Download from https://www.mongodb.com/products/compass
2. Connect to MongoDB
3. View collections
4. View documents
5. Edit/delete data

---

## ⚡ Performance Issues

### Issue: Page loading slowly

**Causes:**
- Large images
- Slow database
- Network latency

**Solutions:**
1. Optimize images
2. Reduce API response size
3. Use pagination (already implemented)
4. Check network speed
5. Check browser network tab

---

### Issue: API requests timing out

**Error Message:**
```
Failed to fetch
or
Request timeout
```

**Causes:**
- Server not responding
- Network issue
- Large payload

**Solutions:**
1. Verify server is running
2. Check internet connection
3. Monitor server CPU/memory
4. Test with Postman

---

## 🐛 Testing & Verification

### Quick Health Check

```bash
# Test 1: Backend running?
curl http://localhost:5000/api/health

# Test 2: MongoDB connected?
# (Check for error in server logs)

# Test 3: Can register?
# (Try registering new account)

# Test 4: Can login?
# (Use registered or admin account)

# Test 5: Can add to cart?
# (Add product after login)

# Test 6: Can checkout?
# (Complete full order flow)
```

---

## 📞 When to Reboot/Reinstall

### Restart Backend
```bash
# Stop current process
Ctrl+C

# Restart
npm run dev
```

### Clear Cache
```bash
# Browser
Ctrl+Shift+Delete (Windows)
Cmd+Shift+Delete (Mac)

# Or clear localStorage
localStorage.clear()
```

### Reinstall Packages
```bash
# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Reset Database
```bash
# Reseed data
npm run seed

# Or manually delete collections in MongoDB
```

---

## 📋 Checklist Before Deployment

- [ ] All pages load without errors (F12 console clear)
- [ ] Can register and login
- [ ] Can browse products
- [ ] Can add/remove from cart
- [ ] Can complete checkout
- [ ] Mobile responsive (test on mobile device)
- [ ] Images load (or verify placeholder URLs)
- [ ] No hardcoded localhost URLs
- [ ] Environment variables configured
- [ ] Database backups taken

---

## 🆘 Still Having Issues?

### Step 1: Gather Information
```
- What error message?
- Where did it happen?
- When did it start?
- What were you doing?
```

### Step 2: Check Logs
```
- Browser console (F12)
- Server terminal
- MongoDB logs
```

### Step 3: Try Solutions Above
- Search for your error message in this guide
- Follow the solution steps
- Test after each step

### Step 4: Debug Systematically
1. Verify backend is running
2. Test API endpoints with Postman
3. Check browser console
4. Review code comments
5. Check README.md

### Step 5: Last Resort
- Clear everything and restart
- Reseed database
- Reinstall packages
- Reread SETUP_GUIDE.md

---

## 📚 Documentation Links

- Main Guide: `README.md`
- Setup Instructions: `SETUP_GUIDE.md`
- Quick Start: `QUICK_START.md`
- Project Summary: `PROJECT_SUMMARY.md`
- Code Comments: In every `.js` file

---

## ✅ Known Issues & Workarounds

### Issue 1: Placeholder Images
- Using placeholder URLs by default
- **Workaround:** Replace with real image URLs in database

### Issue 2: No Email Notifications
- Email system not implemented (can be added later)
- **Workaround:** Use confirmation page instead

### Issue 3: No Payment Gateway
- Stripe/Razorpay not integrated (can be added)
- **Workaround:** Demo orders work without payment

### Issue 4: Admin Dashboard Missing
- Admin features in backend but no UI (can be added)
- **Workaround:** Use Postman or API calls

---

**Remember:** Most issues are small configuration problems. Check the logs, follow the steps above, and you'll be good to go! 🚀
