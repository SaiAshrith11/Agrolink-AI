// src/app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const createRateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const orderRoutes = require('./routes/orders.routes');
const sensorRoutes = require('./routes/sensors.routes');
const salesRoutes = require('./routes/sales.routes');
const mlRoutes = require('./routes/ml.routes');
const path = require("path");


const PORT = process.env.PORT || 4000;

(async () => {
  // DB
  await connectDB(process.env.MONGO_URI);

  const app = express();

  // Security & utils
  app.use(helmet());
  app.use(cors({
    origin: true, // change to specific origin or list in production
    credentials: true
  }));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('tiny'));
  app.use(createRateLimiter(Number(process.env.RATE_LIMIT_WINDOW_MIN || 15), Number(process.env.RATE_LIMIT_MAX || 200)));

  // Static uploads
  app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));
  // Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});



  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/sensors', sensorRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/api/ml', mlRoutes);

  // Serve frontend static if you want (adjust path)
  const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
  app.use(express.static(FRONTEND_DIR));
  app.get('/', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'login.html')));

  // Error handler
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
})();
