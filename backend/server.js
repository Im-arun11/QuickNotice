import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables FIRST (before any config imports)
dotenv.config();

// Dynamic imports — ensures dotenv has loaded before these modules read process.env
const { default: authRoutes } = await import('./routes/authRoutes.js');
const { default: noticeRoutes } = await import('./routes/noticeRoutes.js');
const { default: applicationRoutes } = await import('./routes/applicationRoutes.js');

const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow Vite client requests
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup ESM dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static uploaded files locally
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/applications', applicationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'QuickNotice API is active and running (Supabase).' });
});

// Root fallback route
app.get('/', (req, res) => {
  res.send('QuickNotice backend server is running. Access API endpoints at /api/...');
});

// Error handling middleware for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `API Endpoint Not Found: [${req.method}] ${req.url}` });
});

// Global server error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Supabase URL: ${process.env.SUPABASE_URL ? '✓ configured' : '✗ MISSING'}`);
  console.log(`Supabase Service Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ configured' : '✗ MISSING'}`);
});
