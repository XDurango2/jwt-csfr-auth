// src/models/Usuario.js
import { DataTypes } from 'sequelize'
import { sequelize } from '../config/sequelize.js'

const Usuario = sequelize.define('Usuario', {
  id: {
    type:          DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey:    true,
  },
  nombre: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type:      DataTypes.STRING(100),
    allowNull: false,
    unique:    true,
  },
  password: {
    type:      DataTypes.STRING(255),
    allowNull: false,
  },
  
}, {
  tableName:  'usuarios',
  timestamps: true,               // agrega createdAt y updatedAt automáticamente
  underscored: true,              // columnas en snake_case: usuario_id, created_at...
})

export default Usuario