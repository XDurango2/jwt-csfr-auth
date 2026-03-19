// Almacenamiento en memoria (en producción usarías una base de datos)
let tareas = [];
let siguienteId = 1;

/**
 * Obtener todas las tareas del usuario
 */
export const obtenerTareas = (req, res) => {
  try {
    // Filtrar tareas por usuario (en este ejemplo, todas son del usuario actual)
    const tareasUsuario = tareas.filter(tarea => tarea.usuarioId === req.usuario.id);
    
    res.json({
      mensaje: 'Tareas obtenidas exitosamente',
      total: tareasUsuario.length,
      tareas: tareasUsuario
    });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

/**
 * Crear una nueva tarea
 */
export const crearTarea = (req, res) => {
  try {
    const { titulo, descripcion, completada = false } = req.body;
    
    // Validar campos requeridos
    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({ error: 'El título es requerido' });
    }
    
    // Crear nueva tarea
    const nuevaTarea = {
      id: siguienteId++,
      usuarioId: req.usuario.id,
      titulo: titulo.trim(),
      descripcion: descripcion ? descripcion.trim() : '',
      completada: Boolean(completada),
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };
    
    // Agregar a la lista de tareas
    tareas.push(nuevaTarea);
    
    res.status(201).json({
      mensaje: 'Tarea creada exitosamente',
      tarea: nuevaTarea
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
};

/**
 * Obtener una tarea específica por ID
 */
export const obtenerTareaPorId = (req, res) => {
  try {
    const tareaId = parseInt(req.params.id);
    
    if (isNaN(tareaId)) {
      return res.status(400).json({ error: 'ID de tarea inválido' });
    }
    
    const tarea = tareas.find(t => 
      t.id === tareaId && t.usuarioId === req.usuario.id
    );
    
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json({
      mensaje: 'Tarea obtenida exitosamente',
      tarea
    });
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({ error: 'Error al obtener tarea' });
  }
};