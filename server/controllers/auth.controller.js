import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function toPublicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'member' } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'Conflict', details: ['Email already registered'] });
  }
  const user = await User.create({ name, email, password, role });
  const token = signToken(user);
  return res.status(201).json({ data: { token, user: toPublicUser(user) } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized', details: ['Invalid email or password'] });
  }
  const ok = await user.comparePassword(password);
  if (!ok) {
    return res.status(401).json({ error: 'Unauthorized', details: ['Invalid email or password'] });
  }
  const token = signToken(user);
  return res.json({ data: { token, user: toPublicUser(user) } });
});

export const me = asyncHandler(async (req, res) => {
  return res.json({ data: { user: toPublicUser(req.user) } });
});
