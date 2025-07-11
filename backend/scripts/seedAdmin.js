const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cargo-shipment-tracker');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@cargotracker.com',
      password: 'Admin123!@#',
      role: 'admin',
      department: 'IT Administration',
      phone: '+1234567890',
      isActive: true,
      emailVerified: true
    });

    console.log('Admin user created successfully:');
    console.log('Email:', adminUser.email);
    console.log('Password: Admin123!@#');
    console.log('Role:', adminUser.role);
    console.log('\nPlease change the password after first login!');

    // Create a manager user for testing
    const managerUser = await User.create({
      firstName: 'John',
      lastName: 'Manager',
      email: 'manager@cargotracker.com',
      password: 'Manager123!@#',
      role: 'manager',
      department: 'Operations',
      phone: '+1234567891',
      isActive: true,
      emailVerified: true
    });

    console.log('\nManager user created successfully:');
    console.log('Email:', managerUser.email);
    console.log('Password: Manager123!@#');
    console.log('Role:', managerUser.role);

    // Create a regular user for testing
    const regularUser = await User.create({
      firstName: 'Jane',
      lastName: 'User',
      email: 'user@cargotracker.com',
      password: 'User123!@#',
      role: 'user',
      department: 'Customer Service',
      phone: '+1234567892',
      isActive: true,
      emailVerified: true
    });

    console.log('\nRegular user created successfully:');
    console.log('Email:', regularUser.email);
    console.log('Password: User123!@#');
    console.log('Role:', regularUser.role);

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

// Run the seed function
seedAdmin();
