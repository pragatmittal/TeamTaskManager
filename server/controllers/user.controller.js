import { User } from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ name: 1 });
  return res.json({ data: users });
});
