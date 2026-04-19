require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// EXISTING ROUTES
const ingestRoutes = require('./routes/ingest');
const processRoutes = require('./routes/process');
const exportRoutes = require('./routes/export');

// ✅ NEW ROUTES
const resumeUpload = require('./routes/resumeUpload');
const resumeMatchingRoutes = require('./routes/resumeMatching');

const { loggingMiddleware } = require('./middleware/logging');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(loggingMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});
app.use(limiter);

// Routes
app.use('/api/ingest', ingestRoutes);
app.use('/api/process', processRoutes); // existing
app.use('/api/export', exportRoutes);

// ✅ ADD THESE
app.use('/api/resume', resumeUpload); // PDF upload
app.use('/api/process', resumeMatchingRoutes); // AI matching

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root check (optional fix for "Cannot GET /")
app.get('/', (req, res) => {
  res.send('SMART HIRE BACKEND RUNNING 🚀');
});

// Error handling
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[START] Server running on http://localhost:${PORT}`);
  console.log(`[ENV] NODE_ENV=${process.env.NODE_ENV}`);
});

module.exports = app;