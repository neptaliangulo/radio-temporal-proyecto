const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes   = require('./routes/authRoutes');
const songRoutes   = require('./routes/songRoutes');
const userRoutes   = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// ─── Seguridad y middlewares globales ─────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Rate limit estricto en /auth para frenar fuerza bruta ───────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos, prueba en unos minutos' }
});

// ─── Conexion a MongoDB ──────────────────────────────────────────
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => {
    console.error('Error MongoDB:', err.message);
    process.exit(1);
  });

// ─── Rutas ───────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ ok: true, ts: Date.now() }));

app.use('/api/auth',    authLimiter, authRoutes);
app.use('/api/songs',   songRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/reports', reportRoutes);

// ─── 404 ─────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

// ─── Manejador central de errores ────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Archivo demasiado grande (max 30MB)' });
  }
  res.status(err.status || 500).json({ message: err.message || 'Error del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
