const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión y obtener tokens
 * @access  Público (pero requiere API key en header)
 */
router.post('/login', authMiddleware.validarApiKey, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión y eliminar cookies
 * @access  Privado (requiere token JWT)
 */
router.post('/logout', authMiddleware.verificarToken, authController.logout);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar estado de autenticación
 * @access  Privado (requiere token JWT)
 */
router.get('/verify', authMiddleware.verificarToken, authController.verificarAuth);

module.exports = router;