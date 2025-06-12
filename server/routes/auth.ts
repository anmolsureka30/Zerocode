import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb.js';
import cors from 'cors';

// Create the router
export const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'abcdzerocrazycode';
const TOKEN_EXPIRY = '7d'; // Token valid for 7 days

// Debug middleware
router.use((req: Request, res: Response, next) => {
  console.log(`AUTH REQUEST: ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  next();
});

// User Registration
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    console.log('Registration data validated. Proceeding to store user...');
    
    try {
      // Use the clientPromise
      const client = await clientPromise;
      const db = client.db('zerocode');
      
      // Check for existing user
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'User with this email already exists' 
        });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user object
      const newUser = {
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Insert user
      console.log('Attempting to insert user into MongoDB...');
      const result = await db.collection('users').insertOne(newUser);
      console.log('MongoDB insert result:', result);
      
      // Return success
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please log in.',
        userId: result.insertedId
      });
    } catch (dbError: any) {
      console.error('DATABASE ERROR:', dbError);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error',
        error: dbError.message
      });
    }
  } catch (error: any) {
    console.error('REGISTRATION ERROR:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// User Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }
    
    try {
      // Use the clientPromise
      const client = await clientPromise;
      const db = client.db('zerocode');
      
      // Find user
      const user = await db.collection('users').findOne({ email });
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      // Create token
      const payload = {
        id: user._id,
        email: user.email
      };
      
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
      
      // Return success with token
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: userWithoutPassword
      });
    } catch (dbError: any) {
      console.error('DATABASE ERROR:', dbError);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error',
        error: dbError.message
      });
    }
  } catch (error: any) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Use named export for the router
// export default router; // Remove this line - we're using named export instead

// After router is created
router.options('*', cors());