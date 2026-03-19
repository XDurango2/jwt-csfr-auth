const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true
}));

// Importar rutas y middleware
const authMiddleware = require('./middleware/auth');
const tareasRoutes = require('./routes/tareas');
const authRoutes = require('./routes/auth');

// Rutas públicas (sin autenticación)
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
app.use('/api/tareas', authMiddleware.verificarToken, tareasRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor REST de Tareas con JWT y Cookies HTTP-Only' });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}/api`);
});