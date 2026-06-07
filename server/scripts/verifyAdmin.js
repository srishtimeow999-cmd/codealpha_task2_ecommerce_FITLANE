(async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ecommerce.com', password: 'admin123' })
    });

    const login = await loginRes.json();
    console.log('LOGIN:', login);

    if (!login || !login.token) {
      console.error('Login failed, aborting');
      process.exit(1);
    }

    const token = login.token;

    const addRes = await fetch('http://localhost:5000/api/products/admin/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Product from Agent',
        description: 'Created by agent for verification',
        price: 29.99,
        category: 'T-Shirts',
        gender: 'Men',
        stock: 10,
        featured: true
      })
    });

    const add = await addRes.json();
    console.log('ADD:', add);

    const featuredRes = await fetch('http://localhost:5000/api/products?featured=true');
    const featured = await featuredRes.json();
    console.log('FEATURED:', featured);

    process.exit(0);
  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
})();
