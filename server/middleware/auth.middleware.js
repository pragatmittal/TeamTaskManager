import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';

export async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', details: ['Missing or invalid token'] });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', details: ['User not found'] });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized', details: ['Invalid or expired token'] });
  }
}
