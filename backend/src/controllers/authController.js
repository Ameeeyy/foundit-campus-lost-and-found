import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isValidEmail } from '../utils/validation.js';
import { getAuthCookieOptions, getJwtSecret } from '../config/security.js';

const signToken = (userId) => {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: '7d' });
};

const setAuthCookie = (res, token) => {
  res.cookie('token', token, getAuthCookieOptions());
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, campusId } = req.body;
    const normalizedCampusId = String(campusId || '').trim();

    if (!name || !email || !password || !normalizedCampusId) {
      return res.status(400).json({ message: 'Name, email, password, and campus ID are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      campusId: normalizedCampusId,
    });

    const token = signToken(user._id.toString());
    setAuthCookie(res, token);

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        campusId: user.campusId,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, campusId } = req.body;
    const normalizedCampusId = String(campusId || '').trim();

    if (!email || !password || !normalizedCampusId) {
      return res.status(400).json({ message: 'Email, password, and campus ID are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), campusId: normalizedCampusId });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email, campus ID, or password.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email, campus ID, or password.' });
    }

    const token = signToken(user._id.toString());
    setAuthCookie(res, token);

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        campusId: user.campusId,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token', getAuthCookieOptions());
  return res.json({ message: 'Logged out successfully.' });
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        campusId: user.campusId,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
