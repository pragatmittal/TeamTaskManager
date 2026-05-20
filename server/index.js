import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import userRoutes from './routes/user.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', details: ['Route not found'] });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Validation failed', details });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Conflict', details: ['Duplicate value'] });
  }
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  const details = err.details;
  res.status(status).json({ error: message, ...(details ? { details } : {}) });
});

await connectDB();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
