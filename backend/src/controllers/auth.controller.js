// src/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('farmer','consumer').required()
});

exports.register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { username, password, role } = value;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, passwordHash, role });
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    next(err);
  }
};

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { username, password } = value;
    const user = await User.findOne({ username });
    if (!user || !user.passwordHash) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    next(err);
  }
};
