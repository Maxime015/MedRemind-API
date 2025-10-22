// app.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { initDB } from './config/db.js';
import routes from './routes/index.js';
import rateLimiter from './middleware/rateLimiter.js';
import job from './config/cron.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

 
// Configuration Swagger
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const swaggerDocument = YAML.load(join(__dirname, './docs/swagger.yaml'));

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting global (sauf pour health check)
app.use((req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  rateLimiter(req, res, next);
});


// Route de documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "MyWallet API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  }
}));


// Routes
app.use('/api', routes);



// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MedRemind API'
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialisation
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development'; 

const startServer = async () => {
  try {
    await initDB();
    
    // Démarrer le cron job
    job.start();
    console.log('🕒 Cron job started');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environnement: ${NODE_ENV || 'development'}`);
      console.log(`📚 Documentation API: http://localhost:${PORT}/api-docs`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('🛑 Shutting down server...');
  job.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Server terminated');
  job.stop();
  process.exit(0);
});

startServer();