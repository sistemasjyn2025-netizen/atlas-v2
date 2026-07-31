// apps/atlas-api/src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import projectsRouter from './routes/projects'; 

// Cargamos variables de entorno (.env)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Middlewares de Seguridad y Parseo
app.use(helmet()); // Ofuscar cabeceras HTTP

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Aplicar Clerk globalmente
app.use(clerkMiddleware());

// Rate Limiting para las rutas de API (prevención de DDoS y abusos)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, 
  legacyHeaders: false, 
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', apiLimiter);

// Parseo estricto del JSON (vital para recibir el ProjectInput DTO sin crashear)
app.use(express.json({ limit: '10mb' })); 

// 2. Healthcheck (Para Vercel/Railway ping)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', engine: 'ATLASv2 API' });
});

// 3. Montaje de Rutas Core
app.use('/api/projects', projectsRouter);

// 4. Manejo de Errores Global (Evita que el hilo de Node muera por un unhandled exception)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ATLAS Error]:', err.stack);
  res.status(err.status || 500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Inicialización
app.listen(PORT, () => {
  console.log(`🚀 ATLASv2 Core API escuchando en el puerto ${PORT}`);
  console.log(`🔒 CORS configurado para: ${process.env.CORS_ALLOWED_ORIGINS || 'localhost'}`);
});