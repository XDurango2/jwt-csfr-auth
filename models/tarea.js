// src/models/Tarea.js
import { DataTypes } from 'sequelize'
import { sequelize } from '../config/sequelize.js'

const Tarea = sequelize.define('Tarea', {
  id: {
    type:          DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey:    true,
  },
  usuarioId: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  titulo: {
    type:      DataTypes.STRING(150),
    allowNull: false,
  },
  texto: {
    // El frontend envía "texto", el campo anterior se llamaba "descripcion"
    type:         DataTypes.TEXT,
    allowNull:    true,
    defaultValue: '',
  },
  categorias: {                      // ← renombrado de "categoria"
    type:         DataTypes.JSON,    // ← JSON en lugar de ARRAY (MySQL)
    allowNull:    true,
    defaultValue: [],                // ← array vacío, no string
  },
  completada: {
    type:         DataTypes.BOOLEAN,
    allowNull:    false,
    defaultValue: false,
  },
}, {
  tableName:  'tareas',
  timestamps: true,               // agrega createdAt y updatedAt automáticamente
  underscored: true,              // columnas en snake_case: usuario_id, created_at...
})

export default Tarea