import express from 'express'
import { obtenerUsuarios, crearUsuario, obtenerTareasDeUsuario, eliminarUsuario } from '../controllers/adminController.js'

const router = express.Router()

router.get('/usuarios',                  obtenerUsuarios)
router.post('/usuarios',                 crearUsuario)
router.get('/usuarios/:userId/tareas',   obtenerTareasDeUsuario)
router.delete('/usuarios/:userId',       eliminarUsuario)

export default router
