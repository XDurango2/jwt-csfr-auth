import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',  // Vite dev
  'http://127.0.0.1:5173',
  'http://localhost:3000',  // React dev
  'http://127.0.01:3000',
  // agrega tu dominio de producción aquí
];

export const corsMiddleware = cors({
  origin: function (origin, callback) {
    // permitir requests sin origin (ej: Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('No permitido por CORS'));
  },

  credentials: true, // 🔴 CRÍTICO para cookies

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-csrf-token',
    'x-api-key'
  ],
});