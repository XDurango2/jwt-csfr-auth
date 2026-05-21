# Servidor REST de Tareas con JWT, CSRF y Base de Datos

API REST para gestión de tareas con autenticación JWT, protección CSRF, Google OAuth, roles de administrador y base de datos MySQL vía Sequelize.

## Características

- Autenticación con JWT almacenado en cookie HTTP-Only
- Protección CSRF con doble cookie pattern
- Login con Google OAuth 2.0
- Registro e inicio de sesión con email y contraseña
- Login de administrador con credenciales del `.env`
- Roles de usuario: usuario normal y administrador
- API Key para proteger los endpoints de autenticación
- Endpoints REST para tareas (GET, POST, DELETE)
- Panel de administración: gestión de usuarios y sus tareas
- Persistencia en MySQL con Sequelize ORM
- Migraciones de base de datos
- Servidor HTTPS con certificados locales
- Módulos ES6 (import/export)
- Tests con Playwright

## Estructura del Proyecto

```
.
├── server.js                    # Servidor principal HTTPS (ES6)
├── db.js                        # Conexión a la base de datos
├── .env                         # Variables de entorno
├── localhost.pem                # Certificado SSL local
├── localhost-key.pem            # Clave privada SSL local
├── playwright.config.js         # Configuración de Playwright
├── ejemplo_cliente.js           # Ejemplo de cliente para pruebas
├── openapi.yaml                 # Especificación OpenAPI
├── config/
│   ├── config.js                # Configuración de entornos
│   ├── config.json              # Config de Sequelize CLI
│   └── sequelize.js             # Instancia de Sequelize
├── models/
│   ├── index.js                 # Inicialización de modelos
│   ├── Usuario.js               # Modelo de usuario
│   └── Tarea.js                 # Modelo de tarea
├── migrations/
│   └── 20260407182745-baseline.js  # Migración inicial
├── controllers/
│   ├── authController.js        # Google OAuth, registro, login, logout
│   ├── adminController.js       # Gestión de usuarios (admin)
│   └── tareasController.js      # CRUD de tareas
├── routes/
│   ├── auth.js                  # Rutas de autenticación
│   ├── tareas.js                # Rutas de tareas
│   └── admin.js                 # Rutas de administración
├── middleware/
│   ├── auth.js                  # Verificación de JWT y API key
│   ├── admin.js                 # Verificación de rol administrador
│   └── cors.js                  # Configuración de CORS
├── utils/
│   └── serializarTarea.js       # Helper para serializar respuestas
└── tests/                       # Tests de Playwright
```

## Instalación

1. Clonar o descargar el proyecto
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crear la base de datos en MySQL y configurar el `.env`
4. Ejecutar migraciones:
   ```bash
   npx sequelize-cli db:migrate
   ```
5. Generar certificados SSL locales (por ejemplo con `mkcert`):
   ```bash
   mkcert localhost
   ```

## Configuración

El archivo `.env` debe contener:

```env
PORT=3003
CLIENT_URL=https://localhost:3001

# JWT
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=1h
COOKIE_MAX_AGE=3600000

# API Key (protege los endpoints de autenticación)
API_KEY=tu_api_key

# MySQL / Sequelize
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nombre_base_de_datos
DB_USER=usuario
DB_PASSWORD=contraseña

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id

# Administrador
ADMIN_EMAIL=admin@ejemplo.com
ADMIN_PASSWORD=contraseña_admin

# SSL
SSL_KEY_PATH=localhost-key.pem
SSL_CERT_PATH=localhost.pem

NODE_ENV=development
```

## Uso

### Iniciar el servidor

```bash
npm start
```

El servidor estará disponible en `https://localhost:3003`

### Endpoints de la API

#### Autenticación (`/api/auth`)

Todos los endpoints de autenticación requieren el header `x-api-key`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login con Google OAuth (body: `{ credential }`) |
| POST | `/api/auth/login-local` | Login con email y contraseña |
| POST | `/api/auth/registro` | Registro con nombre, email y contraseña |
| POST | `/api/auth/admin-login` | Login de administrador |
| POST | `/api/auth/logout` | Cierre de sesión (requiere JWT) |
| GET | `/api/auth/verify` | Verificar estado de autenticación (requiere JWT) |

El login exitoso establece:
- Cookie HTTP-Only `jwt_token` con el JWT
- Cookie `csrf_token` (accesible desde JS) con el token CSRF
- Devuelve `csrfToken` en el cuerpo de la respuesta

#### Tareas (`/api/tareas`) — requieren JWT + CSRF

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tareas` | Listar tareas del usuario autenticado |
| GET | `/api/tareas/:id` | Obtener una tarea por ID |
| POST | `/api/tareas` | Crear nueva tarea |

Body para crear tarea:
```json
{ "titulo": "Mi tarea", "descripcion": "Descripción", "completada": false }
```

Headers requeridos:
- `x-csrf-token: [token_csrf]`
- Cookie `jwt_token` (HTTP-Only, automática)

#### Administración (`/api/admin`) — requieren JWT + rol admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/usuarios` | Listar todos los usuarios con conteo de tareas |
| POST | `/api/admin/usuarios` | Crear un usuario nuevo |
| GET | `/api/admin/usuarios/:userId/tareas` | Ver tareas de un usuario |
| DELETE | `/api/admin/usuarios/:userId` | Eliminar un usuario |

### Flujo de Autenticación

1. **Login**: el cliente envía la API key en el header y las credenciales en el body.
2. El servidor genera JWT y token CSRF, los almacena en cookies y devuelve el `csrfToken`.
3. **Solicitudes protegidas**: el cliente incluye la cookie JWT automáticamente y envía el token CSRF en el header `x-csrf-token`.
4. El servidor valida que el JWT sea válido y que la cookie `csrf_token` coincida con el header.

### Protección CSRF

Se utiliza el patrón de doble cookie:
- `jwt_token`: HTTP-Only, inaccesible desde JS, previene XSS.
- `csrf_token`: accesible desde JS para incluirlo en el header.
- El servidor compara la cookie `csrf_token` con el header `x-csrf-token`; si no coinciden, rechaza la solicitud.

## Seguridad

- **JWT en HTTP-Only cookie**: previene robo de tokens por XSS
- **CSRF Protection**: doble cookie pattern
- **API Key**: capa extra para endpoints de autenticación
- **bcrypt**: hash seguro de contraseñas con salt 12
- **Google OAuth**: verificación de `id_token` con la librería oficial
- **HTTPS**: servidor con TLS, cookies con `secure: true` en producción
- **Roles**: middleware `verificarAdmin` protege las rutas de administración
- **SameSite Lax**: cookies enviadas solo en contextos seguros

## Tests

```bash
npx playwright test
```

## Notas de Producción

1. Usar secretos fuertes y únicos en todas las variables del `.env`
2. Habilitar `secure: true` en cookies (activo cuando `NODE_ENV=production`)
3. Usar certificados SSL de una CA real (no `mkcert`)
4. Configurar `CLIENT_URL` con el origen exacto del frontend
5. Implementar rate limiting en los endpoints de autenticación
6. Agregar logging de auditoría
7. Revisar y restringir los orígenes permitidos en CORS

## Licencia

MIT
