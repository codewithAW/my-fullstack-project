require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middleware/errorMiddleware');

// Connect to database
connectDB();

const app = express();

// Middleware
const corsOptions = {
  origin: function(origin, callback) {
    // Allow same-origin (Vercel, no origin header) and configured FRONTEND_URL
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Be permissive for now in production; tighten after testing
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve static upload files (local dev only; production uses Cloudinary)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/complaints', require('./src/routes/complaintRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only bind to a port for local dev (Vercel sets VERCEL=1 automatically)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
