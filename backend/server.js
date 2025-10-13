const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Load environment variables - try config.env first, then fall back to process.env
try {
  require('dotenv').config({ path: './config.env' });
} catch (error) {
  // If config.env doesn't exist, dotenv will use process.env automatically
  require('dotenv').config();
}

const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/links');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const User = require('./models/User');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration - dynamic based on environment
const isDev = (process.env.NODE_ENV !== 'production');
const allowedOrigins = [
  'https://transcendent-hamster-452c1c.netlify.app',
  'https://your-custom-domain.netlify.app', // Add your custom domain if you have one
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (isDev) {
      // In development, allow localhost and private network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      const privateNetRegex = /^http:\/\/(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])):\d+$/;
      if (privateNetRegex.test(origin)) return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Explicitly handle preflight in case proxies drop it
app.options('*', cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Database connection with better error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/link-manager';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Ensure dependrasingh027@gmail.com is admin
async function ensureAdminUser() {
  const adminEmail = 'dependrasingh027@gmail.com';
  const adminUsername = 'dependrasingh027';
  const defaultPassword = 'Admin@123'; // You should change this after first login

  let user = await User.findOne({ email: adminEmail });
  if (!user) {
    user = new User({
      username: adminUsername,
      email: adminEmail,
      password: defaultPassword,
      role: 'admin',
      isEmailVerified: true
    });
    await user.save();
    console.log('Admin user created:', adminEmail);
  } else if (user.role !== 'admin') {
    user.role = 'admin';
    user.isEmailVerified = true;
    await user.save();
    console.log('User promoted to admin:', adminEmail);
  } else {
    console.log('Admin user already exists:', adminEmail);
  }
}

// Call ensureAdminUser after DB connection
connectDB().then(() => {
  ensureAdminUser();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ 
      message: 'Database connected successfully',
      database: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS error: Origin not allowed' });
  }
  
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 