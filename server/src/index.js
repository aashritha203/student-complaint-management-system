const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Route files
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Ensure Next.js client can load falling back uploaded assets
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Http logger
app.use(morgan('dev'));

// Static assets folder for local attachment fallback uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root status page endpoint
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>CampusVoice API</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 80px 20px; background: #0f172a; color: white; }
    h1 { color: #818cf8; font-size: 32px; }
    .status { display: inline-block; background: #16a34a; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
    .info { color: #94a3b8; margin-top: 20px; font-size: 14px; }
    .card { max-width: 500px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>CampusVoice API</h1>
    <p>College Complaint Management System — Backend Server</p>
    <span class="status">● LIVE</span>
    <p class="info">This is the backend API server. It powers the CampusVoice frontend application and is not meant to be used directly in a browser.</p>
    <p class="info">Frontend: <a href="https://student-complaint-management-system-delta.vercel.app" style="color:#818cf8;">Visit CampusVoice App</a></p>
  </div>
</body>
</html>`);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'College Complaint Management System API handles requests correctly',
  });
});

// Routes middleware integration
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

// Error fallback routes
app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Centralized error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
