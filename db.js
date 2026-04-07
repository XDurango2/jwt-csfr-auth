// src/db.js
// Conexión central a MariaDB/MySQL via Sequelize.
// XAMPP usa por defecto: host=localhost, puerto=3306, user=root, password=''

import { sequelize } from './config/sequelize.js'
import Usuario from './models/Usuario.js'
import Tarea from './models/Tarea.js'

// Registrar modelos
export { Usuario, Tarea, sequelize }

// Definir relaciones entre modelos
Usuario.hasMany(Tarea, { foreignKey: 'usuarioId', onDelete: 'CASCADE' })
Tarea.belongsTo(Usuario, { foreignKey: 'usuarioId' })

/**
 * Probar conexión e inicializar tablas.
 * Llamar una vez al arrancar el servidor.
 * sync({ alter: true }) actualiza columnas si el modelo cambia,
 * sin borrar datos existentes.
 */
export async function conectarDB() {
  await sequelize.authenticate()
  console.log('✓ Conectado a MariaDB')
  await sequelize.sync({ alter: true })
  console.log('✓ Tablas sincronizadas')
}