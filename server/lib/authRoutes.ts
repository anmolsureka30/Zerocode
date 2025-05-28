// server/lib/authRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { getDB } from './mongodb.js';
import { UserModel } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

// Extend Express Request interface globally to avoid conflicts
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

// Create router
const authRouter = Router();

// Get JWT secret from environment or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_for_development';
const JWT_EXPIRY = '7d'; // Token validity period

// Middleware to validate request body
const validateRegisterInput = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

const validateLoginInput = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Generate JWT token - Fixed type definition
const generateToken = (user: { _id: any; email: string }) => {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

// Authentication middleware - Use standard Request type
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register a new user
authRouter.post('/register', validateRegisterInput, async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email, password } = req.body;
    
    // Get database connection
    const db = await getDB();
    
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(db, email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create new user
    const newUser = await UserModel.createUser(db, { name, email, password });
    
    // Ensure _id exists before generating token
    if (!newUser._id) {
      throw new Error('Failed to create user - no ID returned');
    }
    
    // Generate token
    const token = generateToken({ _id: newUser._id, email: newUser.email });
    
    // Return user data and token (exclude password)
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      user: userWithoutPassword,
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
authRouter.post('/login', validateLoginInput, async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    // Get database connection
    const db = await getDB();
    
    // Find user by email
    const user = await UserModel.findByEmail(db, email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isPasswordValid = await UserModel.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Ensure _id exists before generating token
    if (!user._id) {
      throw new Error('User ID not found');
    }
    
    // Generate token
    const token = generateToken({ _id: user._id, email: user.email });
    
    // Return user data and token (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile - CHANGED FROM AuthRequest TO Request
authRouter.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Get database connection
    const db = await getDB();
    
    // Find user by ID
    const user = await UserModel.findById(db, req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data (exclude password)
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile - CHANGED FROM AuthRequest TO Request
authRouter.put('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Get database connection
    const db = await getDB();
    
    // Update user
    const updatedUser = await UserModel.updateUser(db, req.user.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return updated user data (exclude password)
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update specific preferences - CHANGED FROM AuthRequest TO Request
authRouter.patch('/me/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Get database connection
    const db = await getDB();
    
    // Update only preferences
    const { preferences } = req.body;
    if (!preferences) {
      return res.status(400).json({ message: 'Preferences object is required' });
    }
    
    // Find user first
    const user = await UserModel.findById(db, req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Merge existing preferences with new ones
    const updatedPreferences = {
      ...user.preferences,
      ...preferences
    };
    
    // Update user
    const updatedUser = await UserModel.updateUser(db, req.user.id, {
      preferences: updatedPreferences,
      updatedAt: new Date()
    });
    
    // Return just the updated preferences
    res.json({ preferences: updatedUser?.preferences });
    
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password - CHANGED FROM AuthRequest TO Request
authRouter.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Get database connection
    const db = await getDB();
    
    // Find user
    const user = await UserModel.findById(db, req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isPasswordValid = await UserModel.comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update with new password
    await UserModel.updateUser(db, req.user.id, { password: newPassword });
    
    res.json({ message: 'Password updated successfully' });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token validity - CHANGED FROM AuthRequest TO Request
authRouter.get('/verify-token', authenticateToken, (req: Request, res: Response) => {
  res.json({ valid: true, user: req.user });
});

export default authRouter;