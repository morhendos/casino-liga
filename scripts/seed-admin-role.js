require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { MongoClient, ObjectId } = require('mongodb');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/casino_liga';
const DB_NAME = process.env.MONGODB_DATABASE || 'casino_liga';
const USER_EMAIL = process.argv[2]; // Get the email from command line argument

// Admin role definition
const ADMIN_ROLE = { id: '2', name: 'admin' };
const USER_ROLE = { id: '1', name: 'user' };

async function main() {
  if (!USER_EMAIL) {
    console.error('Please provide an email address as an argument.');
    console.error('Usage: node scripts/seed-admin-role.js user@example.com');
    process.exit(1);
  }

  let client;
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    
    // Find the user by email
    const user = await usersCollection.findOne({ email: USER_EMAIL });
    
    if (!user) {
      console.error(`User with email ${USER_EMAIL} not found.`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.name} (${user.email})`);
    
    // Check if user already has the admin role
    const hasAdminRole = user.roles && user.roles.some(role => role.id === ADMIN_ROLE.id);
    
    if (hasAdminRole) {
      console.log(`User ${USER_EMAIL} already has admin role.`);
    } else {
      // Add admin role to user's roles
      let roles = user.roles || [USER_ROLE];
      
      // Make sure we don't duplicate the user role
      if (!roles.some(role => role.id === USER_ROLE.id)) {
        roles.push(USER_ROLE);
      }
      
      // Add admin role
      roles.push(ADMIN_ROLE);
      
      // Update the user
      const result = await usersCollection.updateOne(
        { _id: user._id },
        { $set: { roles: roles } }
      );
      
      if (result.modifiedCount === 1) {
        console.log(`Successfully added admin role to user ${USER_EMAIL}.`);
      } else {
        console.error(`Failed to update user ${USER_EMAIL}.`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Database connection closed.');
    }
  }
}

main().catch(console.error);
