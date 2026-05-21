import express from 'express';
import { login, loginLocal, registro, loginAdmin, logout, verificarAuth } from '../controllers/authController.js';
import { validarApiKey, verificarToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión y obtener tokens
 * @access  Público (pero requiere API key en header)
 */
router.post('/login',       validarApiKey, login);
router.post('/registro',    validarApiKey, registro);
router.post('/login-local', validarApiKey, loginLocal);
router.post('/admin-login', validarApiKey, loginAdmin);

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