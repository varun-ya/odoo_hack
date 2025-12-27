const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    // Test user creation
    console.log('\nTesting user creation...');
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123!'
    });

    await testUser.save();
    console.log('✅ Test user created successfully');

    // Verify user exists
    const foundUser = await User.findOne({ email: 'test@example.com' });
    console.log('✅ User found in database:', foundUser.name);

    // Clean up test user
    await User.deleteOne({ email: 'test@example.com' });
    console.log('✅ Test user cleaned up');

    console.log('\n🎉 Database is working correctly!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

testDatabase();