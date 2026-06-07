// /server/utils/ensureAdmin.js
// Ensures an admin account exists for the application

import User from '../models/User.js';

export const ensureAdminUser = async () => {
  const adminEmail = 'admin@ecommerce.com';
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log('✅ Admin user already exists:', adminEmail);
    return;
  }

  await User.create({
    name: 'Admin User',
    email: adminEmail,
    password: 'admin123',
    role: 'admin'
  });

  console.log('✅ Admin user created:', adminEmail);
  console.log('   Password: admin123');
};
