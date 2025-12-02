// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String }, // required for registered accounts
  role: { type: String, enum: ['farmer', 'consumer'], required: true },
  createdAt: { type: Date, default: Date.now },
  meta: { type: mongoose.Schema.Types.Mixed } // extra profile data
});

module.exports = mongoose.model('User', userSchema);
