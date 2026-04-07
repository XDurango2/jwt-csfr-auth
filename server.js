// server.js
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import { verificarToken } from './middleware/auth.js'
import tareasRoutes from './routes/tareas.js'
import authRoutes from './routes/auth.js'
import { conectarDB } from './db.js'   

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3003

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true,
}))

app.use('/api/auth',   authRoutes)
app.use('/api/tareas', verificarToken, tareasRoutes)

app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor REST de Tareas con JWT y Cookies HTTP-Only' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' })
})

// Conectar a la DB antes de levantar el servidor
conectarDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('No se pudo conectar a la DB:', err)
    process.exit(1)
  })