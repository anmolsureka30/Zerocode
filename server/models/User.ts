// server/models/User.ts
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// Define the User type for TypeScript
export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  bio?: string;
  github?: string;
  subscription?: {
    plan: 'Free' | 'Pro' | 'Enterprise';
    status: 'Active' | 'Inactive' | 'Cancelled';
    renewalDate?: string;
    price?: string;
  };
  preferences?: {
    darkMode: boolean;
    emailNotifications: boolean;
    projectUpdates: boolean;
    marketingEmails: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// User model with methods for authentication
export class UserModel {
  // Hash a password before storing
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Compare a password with the hashed version
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Create a new user document
  static async createUser(db: any, userData: Partial<User>): Promise<User> {
    const now = new Date();
    
    // Hash the password
    const hashedPassword = userData.password 
      ? await this.hashPassword(userData.password)
      : '';
    
    // Create user object with defaults
    const newUser: User = {
      name: userData.name || '',
      email: userData.email || '',
      password: hashedPassword,
      bio: userData.bio || '',
      github: userData.github || '',
      subscription: {
        plan: 'Free',
        status: 'Active'
      },
      preferences: {
        darkMode: true,
        emailNotifications: true,
        projectUpdates: true,
        marketingEmails: false
      },
      createdAt: now,
      updatedAt: now
    };
    
    // Insert into the database
    const result = await db.collection('users').insertOne(newUser);
    return { ...newUser, _id: result.insertedId };
  }

  // Find a user by email
  static async findByEmail(db: any, email: string): Promise<User | null> {
    return db.collection('users').findOne({ email });
  }

  // Find a user by ID
  static async findById(db: any, id: string): Promise<User | null> {
    try {
      const objectId = new ObjectId(id);
      return db.collection('users').findOne({ _id: objectId });
    } catch (error) {
      console.error('Invalid ID format:', error);
      return null;
    }
  }

  // Update a user - Fixed password handling
  static async updateUser(db: any, userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const objectId = new ObjectId(userId);
      
      // Don't allow updating certain fields directly
      const { password, createdAt, _id, ...allowedUpdates } = updates;
      
      // Create update data object
      const updateData: any = {
        ...allowedUpdates,
        updatedAt: new Date()
      };
      
      // If password is being updated, hash it
      if (password) {
        updateData.password = await this.hashPassword(password);
      }
      
      const result = await db.collection('users').findOneAndUpdate(
        { _id: objectId },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      return result.value;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }
}