import bcrypt from 'bcryptjs'
import Usuario from '../models/Usuario.js'
import Tarea from '../models/Tarea.js'
import { serializarTarea } from '../utils/serializarTarea.js'

/**
 * GET /api/admin/usuarios
 * Devuelve todos los usuarios con conteo de tareas.
 */
export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'email', 'nombre', 'createdAt'],
      order: [['created_at', 'ASC']],
    })

    const resultado = await Promise.all(
      usuarios.map(async (u) => {
        const tareaCount       = await Tarea.count({ where: { usuarioId: u.id } })
        const completadasCount = await Tarea.count({ where: { usuarioId: u.id, completada: true } })
        return {
          id:               u.id,
          email:            u.email,
          nombre:           u.nombre,
          tareaCount,
          completadasCount,
          fechaRegistro:    u.createdAt,
        }
      })
    )

    res.json(resultado)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
}

/**
 * GET /api/admin/usuarios/:userId/tareas
 * Devuelve todas las tareas de un usuario específico.
 */
export const obtenerTareasDeUsuario = async (req, res) => {
  try {
    const tareas = await Tarea.findAll({
      where: { usuarioId: req.params.userId },
      order: [['created_at', 'DESC']],
    })
    res.json(tareas.map(serializarTarea))
  } catch (error) {
    console.error('Error al obtener tareas del usuario:', error)
    res.status(500).json({ error: 'Error al obtener tareas' })
  }
}

/**
 * POST /api/admin/usuarios
 * Crea un nuevo usuario con email + contraseña.
 */
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body

    if (!nombre?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' })
    }

    const existente = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } })
    if (existente) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' })
    }

    const hash = await bcrypt.hash(password, 10)

    const usuario = await Usuario.create({
      nombre:   nombre.trim(),
      email:    email.trim().toLowerCase(),
      password: hash,
      esAdmin:  false,
    })

    res.status(201).json({
      id:               usuario.id,
      email:            usuario.email,
      nombre:           usuario.nombre,
      tareaCount:       0,
      completadasCount: 0,
      fechaRegistro:    usuario.createdAt,
    })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    res.status(500).json({ error: 'Error al crear usuario' })
  }
}

/**
 * DELETE /api/admin/usuarios/:userId
 * Elimina un usuario y sus tareas (CASCADE).
 */
export const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.userId)
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    if (usuario.id === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' })
    }
    await usuario.destroy()
    res.json({ mensaje: 'Usuario eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    res.status(500).json({ error: 'Error al eliminar usuario' })
  }
}
