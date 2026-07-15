import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { checkConnection } from './src/config/db.js';
import authRouter from './src/routes/auth.js';
import leadsRouter from './src/routes/leads.js';
import softwaresRouter from './src/routes/softwares.js';
import blogRouter from './src/routes/blog.js';
import testimonialsRouter from './src/routes/testimonials.js';
import faqsRouter from './src/routes/faqs.js';
import settingsRouter from './src/routes/settings.js';
import setupRouter from './src/routes/setup.js';
import uploadRouter from './src/routes/upload.js';
import visitorStatsRouter from './src/routes/visitorStats.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  })
);
app.use(express.json());

// Serve static files from public/uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'ziv-proptech-api' }));
app.use('/api/auth', authRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/softwares', softwaresRouter);
app.use('/api/blog', blogRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/faqs', faqsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/setup', setupRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/visitor-stats', visitorStatsRouter);

app.use((_req, res) => res.status(404).json({ message: 'Ressource introuvable.' }));

app.listen(PORT, async () => {
  console.log(`🚀 API ZIV PROPTECH démarrée sur http://localhost:${PORT}`);
  await checkConnection();
});
