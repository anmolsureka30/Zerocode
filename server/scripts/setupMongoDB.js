// server/scripts/setupMongoDB.js
/**
 * This script sets up the MongoDB collections and indexes for the ZeroCode app.
 * Run it once after setting up your MongoDB connection.
 */

import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
// First try server/.env, then try root .env
const serverEnvPath = resolve(__dirname, '..', '.env');
const rootEnvPath = resolve(__dirname, '..', '..', '.env');

if (fs.existsSync(serverEnvPath)) {
  config({ path: serverEnvPath });
  console.log('Loaded environment from server/.env');
} else if (fs.existsSync(rootEnvPath)) {
  config({ path: rootEnvPath });
  console.log('Loaded environment from root .env');
} else {
  config();
  console.log('No specific .env file found, using environment variables');
}

// MongoDB connection options to fix TLS errors
const options = {
  tls: true,
  tlsAllowInvalidCertificates: process.env.NODE_ENV === 'development',
  tlsAllowInvalidHostnames: process.env.NODE_ENV === 'development',
  ssl: true,
  family: 4
};

async function setupMongoDB() {
  // Get MongoDB URI from environment variables
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI environment variable is not defined');
    process.exit(1);
  }
  
  console.log(`Connecting to MongoDB at ${uri.split('@')[1]?.split('/')[0] || 'database'}...`);
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(uri, options);
    await client.connect();
    console.log('Connected successfully to MongoDB');
    
    // Get database reference - use zerocode as the database name
    const db = client.db('zerocode');
    
    // Create collections if they don't exist
    console.log('Setting up collections...');
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('projects')) {
      await db.createCollection('projects');
      console.log('Created projects collection');
    } else {
      console.log('Projects collection already exists');
    }
    
    if (!collectionNames.includes('generations')) {
      await db.createCollection('generations');
      console.log('Created generations collection');
    } else {
      console.log('Generations collection already exists');
    }
    
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log('Created users collection');
    } else {
      console.log('Users collection already exists');
    }
    
    if (!collectionNames.includes('waitlist')) {
      await db.createCollection('waitlist');
      console.log('Created waitlist collection');
    } else {
      console.log('Waitlist collection already exists');
    }
    
    // Create indexes for better performance
    console.log('Setting up indexes...');
    
    // Projects collection indexes
    await db.collection('projects').createIndex({ userId: 1 });
    await db.collection('projects').createIndex({ updatedAt: -1 });
    console.log('Created indexes for projects collection');
    
    // Generations collection indexes
    await db.collection('generations').createIndex({ 
      prompt: 1, 
      'settings.framework': 1,
      'settings.styling': 1,
      'settings.stateManagement': 1 
    });
    await db.collection('generations').createIndex({ lastAccessed: -1 });
    console.log('Created indexes for generations collection');
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ updatedAt: -1 });
    console.log('Created indexes for users collection');
    
    // Waitlist collection indexes
    await db.collection('waitlist').createIndex({ email: 1 }, { unique: true });
    await db.collection('waitlist').createIndex({ submittedAt: -1 });
    await db.collection('waitlist').createIndex({ status: 1 });
    console.log('Created indexes for waitlist collection');
    
    console.log('MongoDB setup completed successfully!');
  } catch (error) {
    console.error('Error setting up MongoDB:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the setup function
setupMongoDB().catch(console.error);