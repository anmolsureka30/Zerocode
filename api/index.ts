import { VercelRequest, VercelResponse } from '@vercel/node';
import { registerRoutes } from '../server/routes'; // we'll modify this
import fetch from 'node-fetch';

globalThis.fetch = fetch as any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
