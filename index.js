import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import callRoutes from './routes/callRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/calls', callRoutes);
app.use('/api/v1/proposals', proposalRoutes);
app.use('/api/v1/users', userRoutes);


// Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Research Grant Portal API running on port ${port}`);
});
