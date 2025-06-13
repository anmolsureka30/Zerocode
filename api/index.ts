import { VercelRequest, VercelResponse } from '@vercel/node';
import { registerRoutes } from '../server/routes'; // we'll modify this
import fetch from 'node-fetch';

// ... existing code ...

globalThis.fetch = fetch as any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', 'https://veertesting.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Basic routing logic
    if (req.method === 'POST' && req.url?.startsWith('/api/generate')) {
      // You will need to extract body, call route handler manually
      const result = await registerRoutes(req.body); // Adjust this
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: 'Route not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}
