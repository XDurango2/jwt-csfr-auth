// server.js
import express from 'express'
import https from 'https'      // 👈 agregar
import fs from 'fs'            // 👈 agregar
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { corsMiddleware } from './middleware/cors.js'
import { verificarToken } from './middleware/auth.js'
import tareasRoutes from './routes/tareas.js'
import authRoutes from './routes/auth.js'
import { conectarDB } from './db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3003

const options = {
  key:  fs.readFileSync(process.env.SSL_KEY_PATH  || 'localhost-key.pem'),  // 👈 readFileSync
  cert: fs.readFileSync(process.env.SSL_CERT_PATH || 'localhost.pem')       // 👈 readFileSync
}

app.use(express.json())
app.use(cookieParser())
app.use(corsMiddleware)

app.use('/api/auth',   authRoutes)
app.use('/api/tareas', verificarToken, tareasRoutes)

conectarDB()
  .then(() => {
    https.createServer(options, app).listen(PORT, () => {  // 👈 https.createServer
      console.log(`Servidor escuchando en https://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('No se pudo conectar a la DB:', err)
    process.exit(1)
  })