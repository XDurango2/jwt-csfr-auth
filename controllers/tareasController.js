// controllers/tareasController.js
import Tarea from '../models/Tarea.js'

/**
 * GET /api/tareas
 * Obtener todas las tareas del usuario autenticado
 */
export const obtenerTareas = async (req, res) => {
  try {
    const tareas = await Tarea.findAll({
      where: { usuarioId: req.usuario.id },
      order: [['created_at', 'DESC']],
    })
    res.json(tareas)
  } catch (error) {
    console.error('Error al obtener tareas:', error)
    res.status(500).json({ error: 'Error al obtener tareas' })
  }
}

/**
 * GET /api/tareas/:id
 * Obtener una tarea específica del usuario
 */
export const obtenerTareaPorId = async (req, res) => {
  try {
    const tarea = await Tarea.findOne({
      where: { id: req.params.id, usuarioId: req.usuario.id },
    })
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' })
    res.json(tarea)
  } catch (error) {
    console.error('Error al obtener tarea:', error)
    res.status(500).json({ error: 'Error al obtener tarea' })
  }
}

/**
 * POST /api/tareas
 * Crear una nueva tarea
 * Body esperado: { titulo, texto, categoria }
 */
export const crearTarea = async (req, res) => {
  try {
    const { titulo, texto, categoria } = req.body

    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({ error: 'El título es requerido' })
    }

    const tarea = await Tarea.create({
      usuarioId: req.usuario.id,
      titulo:    titulo.trim(),
      texto:     texto?.trim() ?? '',
      categoria: categoria ?? '',
      completada: false,
    })

    res.status(201).json(tarea)
  } catch (error) {
    console.error('Error al crear tarea:', error)
    res.status(500).json({ error: 'Error al crear tarea' })
  }
}

/**
 * PUT /api/tareas/:id
 * Actualizar una tarea (título, texto, categoría, completada)
 * Body esperado: cualquier subconjunto de { titulo, texto, categoria, completada }
 */
export const actualizarTarea = async (req, res) => {
  try {
    const tarea = await Tarea.findOne({
      where: { id: req.params.id, usuarioId: req.usuario.id },
    })
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' })

    const { titulo, texto, categoria, completada } = req.body
    await tarea.update({
      ...(titulo     !== undefined && { titulo:     titulo.trim() }),
      ...(texto      !== undefined && { texto:      texto.trim() }),
      ...(categoria  !== undefined && { categoria }),
      ...(completada !== undefined && { completada: Boolean(completada) }),
    })

    res.json(tarea)
  } catch (error) {
    console.error('Error al actualizar tarea:', error)
    res.status(500).json({ error: 'Error al actualizar tarea' })
  }
}

/**
 * DELETE /api/tareas/:id
 * Eliminar una tarea del usuario
 */
export const eliminarTarea = async (req, res) => {
  try {
    const tarea = await Tarea.findOne({
      where: { id: req.params.id, usuarioId: req.usuario.id },
    })
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' })

    await tarea.destroy()
    res.json({ mensaje: 'Tarea eliminada exitosamente' })
  } catch (error) {
    console.error('Error al eliminar tarea:', error)
    res.status(500).json({ error: 'Error al eliminar tarea' })
  }
}