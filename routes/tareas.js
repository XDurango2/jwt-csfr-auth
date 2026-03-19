const express = require('express');
const router = express.Router();
const tareasController = require('../controllers/tareasController');

/**
 * @route   GET /api/tareas
 * @desc    Obtener todas las tareas del usuario
 * @access  Privado (requiere token JWT)
 */
router.get('/', tareasController.obtenerTareas);

/**
 * @route   GET /api/tareas/:id
 * @desc    Obtener una tarea específica por ID
 * @access  Privado (requiere token JWT)
 */
router.get('/:id', tareasController.obtenerTareaPorId);

/**
 * @route   POST /api/tareas
 * @desc    Crear una nueva tarea
 * @access  Privado (requiere token JWT)
 */
router.post('/', tareasController.crearTarea);

module.exports = router;