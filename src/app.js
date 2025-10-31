import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDB } from './config/db.js';
import routes from './routes/index.js';
import job from './config/cron.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import rateLimiter from "./middleware/rateLimiter.js";


const app = express();

if (process.env.NODE_ENV === "production") job.start();

// Configuration Swagger
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const swaggerDocument = YAML.load(join(__dirname, './docs/swagger.yaml'));

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Route de documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api', routes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Démarrage du serveur

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is up and running on PORT:", PORT);
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  });
});
 