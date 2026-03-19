import express from 'express';
import { login, logout, verificarAuth } from '../controllers/authController.js';
import { validarApiKey, verificarToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión y obtener tokens
 * @access  Público (pero requiere API key en header)
 */
router.post('/login', validarApiKey, login);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión y eliminar cookies
 * @access  Privado (requiere token JWT)
 */
router.post('/logout', verificarToken, logout);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar estado de autenticación
 * @access  Privado (requiere token JWT)
 */
router.get('/verify', verificarToken, verificarAuth);

export default router;