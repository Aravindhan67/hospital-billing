import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import patientsRouter from './routes/patients.js';
import doctorsRouter from './routes/doctors.js';
import bedsRouter from './routes/beds.js';
import invoicesRouter from './routes/invoices.js';
import pharmacyRouter from './routes/pharmacy.js';
import diagnosticsRouter from './routes/diagnostics.js';
import tariffsRouter from './routes/tariffs.js';
import insuranceRouter from './routes/insurance.js';
import reportsRouter from './routes/reports.js';
import settingsRouter from './routes/settings.js';
import printersRouter from './routes/printers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB if available
connectDB();

// API Routes
app.use('/api/patients', patientsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/beds', bedsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/pharmacy', pharmacyRouter);
app.use('/api/diagnostics', diagnosticsRouter);
app.use('/api/tariffs', tariffsRouter);
app.use('/api/insurance', insuranceRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/printers', printersRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'CuraFlow Hospital Billing & HIS API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend build from client/dist if present
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      status: 'active',
      system: 'CuraFlow Hospital Billing & HIS API',
      message: 'Backend API is running. Build frontend with npm run build to serve UI.',
      endpoints: '/api/health'
    });
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏥 CuraFlow Hospital Billing Backend running on port ${PORT}`);
  console.log(`📡 API Endpoints available at http://localhost:${PORT}/api/`);
  console.log(`🖥️ Frontend Web App accessible at http://localhost:${PORT}/`);
  console.log(`=======================================================`);
});
