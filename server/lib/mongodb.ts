// server/lib/mongodb.ts
import { MongoClient, MongoClientOptions } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables from .env file
try {
  // Get the directory name of the current module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Try different possible locations for .env file
  const serverEnvPath = path.resolve(__dirname, '..', '.env');
  const rootEnvPath = path.resolve(__dirname, '..', '..', '.env');
  
  if (fs.existsSync(serverEnvPath)) {
    dotenv.config({ path: serverEnvPath });
    console.log('MongoDB: Loaded environment from server/.env');
  } else if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
    console.log('MongoDB: Loaded environment from root .env');
  } else {
    dotenv.config();
    console.log('MongoDB: Using process environment variables');
  }
} catch (error) {
  console.warn('Error loading .env file:', error);
  // Continue execution, we'll check for the URI directly
}

// Get the MongoDB URI from the environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    'Please define the MONGODB_URI environment variable. ' +
    'Check your .env file or set the environment variable before starting the server.'
  );
}

// Log the MongoDB connection status (without showing the full URI for security)
console.log(`MongoDB: Connecting to ${uri.split('@')[1] || 'database'}...`);

// MongoDB connection options
// Use only tls: true for Atlas compatibility. If you still get SSL errors, check Atlas TLS settings, your IP whitelist, and system CA certificates.
const options: MongoClientOptions = process.env.NODE_ENV === 'development' ? {
  tls: true
} : {};

// Global cache for the MongoDB client
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In development mode, use a global variable so the value
// is preserved across module reloads
if (process.env.NODE_ENV === 'development') {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production mode, create a new client for each request
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export the MongoDB client promise
export default clientPromise;

// Helper function to get a DB instance
export async function getDB(dbName = 'zerocode') {
  const client = await clientPromise;
  return client.db(dbName);
}

// Initialize the MongoDB database
export async function initializeMongoDB() {
  try {
    console.log('Initializing MongoDB...');
    const client = await clientPromise;
    const db = client.db('zerocode');
    
    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('projects')) {
      await db.createCollection('projects');
      console.log('Created projects collection');
    }
    
    if (!collectionNames.includes('generations')) {
      await db.createCollection('generations');
      console.log('Created generations collection');
    }
    
    // Create indexes for better performance
    await db.collection('projects').createIndex({ userId: 1 });
    await db.collection('projects').createIndex({ updatedAt: -1 });
    await db.collection('generations').createIndex({ 
      prompt: 1, 
      'settings.framework': 1,
      'settings.styling': 1,
      'settings.stateManagement': 1
    });
    
    console.log('MongoDB initialization complete');
    return true;
  } catch (error) {
    console.error('MongoDB initialization error:', error);
    throw error;
  }
}
