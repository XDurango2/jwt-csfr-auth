// src/db.js
// Conexión central a MariaDB/MySQL via Sequelize.
// XAMPP usa por defecto: host=localhost, puerto=3306, user=root, password=''

import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

export const sequelize = new Sequelize(
  process.env.DB_NAME     || 'tareas_demo',
  process.env.DB_USER     || 'root',
  process.env.DB_PASSWORD || '',
  {
    host:    process.env.DB_HOST || 'localhost',
    port:    process.env.DB_PORT || 3306,
    dialect: 'mysql',      // Sequelize usa el driver mysql2 para MariaDB también
    logging: false,        // Cambiar a console.log para ver las queries en desarrollo
  }
)

/**
 * Probar conexión e inicializar tablas.
 * Llamar una vez al arrancar el servidor.
 * sync({ alter: true }) actualiza columnas si el modelo cambia,
 * sin borrar datos existentes.
 */
export async function conectarDB() {
  await sequelize.authenticate()
  console.log('✅ Conectado a MariaDB')
  await sequelize.sync({ alter: true })
  console.log('✅ Tablas sincronizadas')
}