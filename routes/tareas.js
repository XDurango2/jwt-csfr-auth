// routes/tareas.js
import express from 'express'
import {
  obtenerTareas,
  obtenerTareaPorId,
  crearTarea,
  actualizarTarea,  // ✅ antes faltaba
  eliminarTarea,    // ✅ antes faltaba
} from '../controllers/tareasController.js'

const router = express.Router()

router.get('/',     obtenerTareas)
router.get('/:id',  obtenerTareaPorId)
router.post('/',    crearTarea)
router.put('/:id',  actualizarTarea)    // ✅ nueva ruta
router.delete('/:id', eliminarTarea)   // ✅ nueva ruta

export default router