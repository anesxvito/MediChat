const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Creating admin user...');

    // Hash password
    const passwordHash = await bcrypt.hash('password123', 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@medichat.com',
        passwordHash: passwordHash,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        emailVerified: true,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: password123');
    console.log('Role:', admin.role);
    console.log('ID:', admin.id);

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ Admin user already exists!');
    } else {
      console.error('Error creating admin:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
