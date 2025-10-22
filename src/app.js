// app.js
import express from 'express';
import dotenv from 'dotenv';
import { initDB } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';
import routes from './routes/index.js';
import job from './config/cron.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const app = express();

if (process.env.NODE_ENV === "production") job.start();

// Configuration Swagger
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const swaggerDocument = YAML.load(join(__dirname, './docs/swagger.yaml'));

// middleware
app.use(rateLimiter);
app.use(express.json());

// Route de documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 3000;

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", routes);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is up and running on PORT:", PORT);
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  });
});