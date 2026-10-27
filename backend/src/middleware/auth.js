import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getJwtSecret } from '../config/security.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const token = req.cookies?.token || bearerToken;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Invalid or expired session.' });
    }

    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = { id: user._id.toString(), email: user.email, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session.' });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  }

  next();
};
