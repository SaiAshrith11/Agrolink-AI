require('dotenv').config();
const express = require('express');
const path = require("path");
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const createRateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/db');

// ROUTES
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const orderRoutes = require('./routes/orders.routes');
const sensorRoutes = require('./routes/sensors.routes');
const salesRoutes = require('./routes/sales.routes');
const mlRoutes = require('./routes/ml.routes');

const PORT = process.env.PORT || 4000;

(async () => {
  await connectDB(process.env.MONGO_URI);

  const app = express();

  // Security
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('tiny'));
  app.use(createRateLimiter(15, 200));

  // ---------------------------
  // ✅ API ROUTES (must be BEFORE static)
  // ---------------------------
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/sensors', sensorRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/api/ml', mlRoutes);

  // ---------------------------
  // STATIC FRONTEND
  // ---------------------------
  const FRONTEND_DIR = path.join(__dirname, "../frontend");
  app.use(express.static(FRONTEND_DIR));

  app.get("/", (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "login.html"));
  });

  // ERROR HANDLER
  app.use(errorHandler);

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
