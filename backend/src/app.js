const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const healthRoutes = require('./routes/healthRoutes');
const dbHealthRoutes = require('./routes/dbHealthRoutes');
const authRoutes = require('./routes/authRoutes');
const repositoryRoutes = require('./routes/repositoryRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const authMiddleware = require('./middleware/auth');

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL, process.env.EXTENSION_ORIGIN].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({
  verify: (req, res, buf) => {
    if (buf && buf.length) {
      req.rawBody = buf;
    }
  }
}));
app.use(cookieParser());

// Routes
app.use('/api', healthRoutes);
app.use('/api', dbHealthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/repositories', authMiddleware, repositoryRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);

module.exports = app;
