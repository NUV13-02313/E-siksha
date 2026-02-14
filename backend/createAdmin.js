require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Use your actual User model from Server.js
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'student' },
  isActive: { type: Boolean, default: true }
});
const User = mongoose.model('User', userSchema);

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const email = 'admin@esiksha.com';
  const password = 'Admin@123'; // CHANGE THIS AFTER FIRST LOGIN!
  
  // Check if admin exists
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('✅ Admin user already exists');
    process.exit(0);
  }

  // Create admin
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    fullName: 'E-Siksha Admin',
    email,
    password: hashedPassword,
    role: 'admin',
    isActive: true
  });
  
  console.log(`✅ ADMIN CREATED SUCCESSFULLY!`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  console.log(`⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!`);
  
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});