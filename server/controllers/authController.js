import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * @desc    Register a new CITIZEN
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  const { name, email, password, addressLine, location } = req.body;
  const [area, city] = location ? location.split(',').map(item => item.trim()) : [undefined, undefined];

  if (!city || !area) {
    return res.status(400).json({ success: false, error: 'Please select a valid Area, City from the list.' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // NOTE: This will store the password as plain text, matching the users.json file.
    const user = await User.create({
      name,
      email,
      password, // Password is NOT hashed here
      role: 'Citizen',
      addressLine,
      city,
      area,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Login for all user roles (INSECURE DEMO VERSION)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  const { email, password, role, workerId, city } = req.body;

  if (!role) {
    return res.status(400).json({ success: false, error: 'Please select a role.' });
  }

  try {
    let user;
    // IMPORTANT: .select('+password') is used to retrieve the password which is normally hidden.
    if (role === 'Citizen') {
      if (!email || !password) return res.status(400).json({ error: 'Please provide email and password.' });
      user = await User.findOne({ email, role: 'Citizen' }).select('+password');
    } else if (role === 'Worker') {
      if (!workerId || !password) return res.status(400).json({ error: 'Please provide Worker ID and password.' });
      user = await User.findOne({ workerId, role: 'Worker' }).select('+password');
    } else if (role === 'Officer') {
      if (!city || !password) return res.status(400).json({ error: 'Please select a city and provide a password.' });
      user = await User.findOne({ city, role: 'Officer' }).select('+password');
    }

    // WARNING: Insecure plain text password comparison for demonstration only.
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Helper function to create and send JWT token
 */
const sendTokenResponse = (user, statusCode, res) => {
  const payload = { id: user._id, role: user.role, city: user.city };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
  res.status(statusCode).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, city: user.city, points: user.points }
  });
};