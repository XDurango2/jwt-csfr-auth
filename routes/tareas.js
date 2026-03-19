import express from 'express';
import { obtenerTareas, obtenerTareaPorId, crearTarea } from '../controllers/tareasController.js';

const router = express.Router();

/**
 * @route   GET /api/tareas
 * @desc    Obtener todas las tareas del usuario
 * @access  Privado (requiere token JWT)
 */
router.get('/', obtenerTareas);

/**
 * @route   GET /api/tareas/:id
 * @desc    Obtener una tarea específica por ID
 * @access  Privado (requiere token JWT)
 */
router.get('/:id', obtenerTareaPorId);

/**
 * @route   POST /api/tareas
 * @desc    Crear una nueva tarea
 * @access  Privado (requiere token JWT)
 */
router.post('/', crearTarea);

export default router;