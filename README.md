# Servidor REST de Tareas con JWT y Cookies HTTP-Only

Servidor REST sencillo para manejar tareas (To-do) con autenticación JWT y protección CSRF usando cookies HTTP-Only.

## Características

- ✅ Autenticación con JWT almacenado en cookie HTTP-Only
- ✅ Protección CSRF con doble cookie pattern
- ✅ API Key para autenticación inicial
- ✅ Endpoints REST para tareas (GET y POST)
- ✅ Middleware de autenticación robusto
- ✅ Manejo de errores adecuado
- ✅ Ejemplo de cliente incluido

## Estructura del Proyecto

```
.
├── server.js              # Servidor principal
├── .env                   # Variables de entorno
├── middleware/
│   └── auth.js           # Middleware de autenticación
├── controllers/
│   ├── authController.js # Controlador de autenticación
│   └── tareasController.js # Controlador de tareas
├── routes/
│   ├── auth.js           # Rutas de autenticación
│   └── tareas.js         # Rutas de tareas
├── ejemplo_cliente.js     # Ejemplo de cliente para pruebas
└── README.md             # Este archivo
```

## Instalación

1. Clonar o descargar el proyecto
2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno (el archivo `.env` ya está creado con valores por defecto)

## Configuración

El archivo `.env` contiene:

```env
PORT=3000
CLIENT_URL=http://localhost:3001
JWT_SECRET=mi_secreto_super_seguro_para_jwt_2024
JWT_EXPIRES_IN=1h
API_KEY=mi_api_key_secreta_12345
COOKIE_MAX_AGE=3600000
CSRF_TOKEN_SECRET=mi_secreto_csrf_super_seguro
```

## Uso

### Iniciar el servidor

```bash
node server.js
```

El servidor estará disponible en `http://localhost:3000`

### Endpoints de la API

#### Autenticación

**POST /api/auth/login**
- Requiere header: `x-api-key: mi_api_key_secreta_12345`
- Body: `{ "email": "usuario@ejemplo.com" }`
- Configura cookies HTTP-Only para JWT y CSRF
- Devuelve token CSRF en la respuesta

**POST /api/auth/logout**
- Requiere autenticación JWT
- Elimina las cookies de sesión

**GET /api/auth/verify**
- Requiere autenticación JWT
- Verifica el estado de autenticación

#### Tareas (requieren autenticación)

**GET /api/tareas**
- Obtiene todas las tareas del usuario
- Headers requeridos:
  - `x-csrf-token: [token_csrf]`
  - Cookie: `jwt_token` (HTTP-Only, automática)

**GET /api/tareas/:id**
- Obtiene una tarea específica por ID
- Headers requeridos igual que arriba

**POST /api/tareas**
- Crea una nueva tarea
- Body: `{ "titulo": "Tarea ejemplo", "descripcion": "Descripción", "completada": false }`
- Headers requeridos igual que arriba

### Flujo de Autenticación

1. **Login inicial**: 
   - Cliente envía API key en header y email en body
   - Servidor genera JWT y token CSRF
   - JWT se almacena en cookie HTTP-Only
   - Token CSRF se devuelve en respuesta y en cookie no HTTP-Only

2. **Solicitudes protegidas**:
   - Cliente incluye automáticamente la cookie JWT (HTTP-Only)
   - Cliente envía token CSRF en header `x-csrf-token`
   - Servidor verifica:
     - JWT válido y no expirado
     - Token CSRF coincide con el del JWT
     - API key en JWT es válida

3. **Protección CSRF**:
   - Doble cookie pattern: JWT en HTTP-Only, CSRF en cookie regular
   - Token CSRF debe coincidir en header y JWT
   - Previene ataques CSRF mientras mantiene seguridad

## Ejemplo de Uso

### Probar con el cliente de ejemplo

1. Instalar dependencias adicionales:
   ```bash
   npm install axios tough-cookie axios-cookiejar-support
   ```

2. Ejecutar el servidor:
   ```bash
   node server.js
   ```

3. En otra terminal, ejecutar el cliente de ejemplo:
   ```bash
   node ejemplo_cliente.js
   ```

### Ejemplo manual con curl

1. Login (obtener tokens):
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "x-api-key: mi_api_key_secreta_12345" \
     -H "Content-Type: application/json" \
     -d '{"email":"usuario@ejemplo.com"}' \
     -c cookies.txt
   ```

2. Extraer token CSRF de la respuesta y guardarlo

3. Crear tarea (usando cookies y CSRF):
   ```bash
   curl -X POST http://localhost:3000/api/tareas \
     -H "x-csrf-token: [TOKEN_CSRF_AQUI]" \
     -H "Content-Type: application/json" \
     -d '{"titulo":"Mi tarea","descripcion":"Descripción"}' \
     -b cookies.txt
   ```

## Seguridad

- **JWT en HTTP-Only cookie**: Previene acceso desde JavaScript (XSS)
- **CSRF Protection**: Doble cookie pattern para prevenir CSRF
- **API Key**: Autenticación inicial adicional
- **SameSite Strict**: Cookies solo en solicitudes del mismo sitio
- **Expiración**: Tokens con tiempo de vida limitado

## Notas de Producción

1. **Cambiar secretos**: Usa secretos fuertes y únicos en producción
2. **HTTPS**: Siempre usa HTTPS en producción para cookies seguras
3. **Base de datos**: Reemplazar almacenamiento en memoria por base de datos real
4. **Rate limiting**: Implementar límite de solicitudes
5. **Logging**: Agregar logging apropiado para auditoría
6. **CORS**: Configurar orígenes permitidos específicamente

## Licencia

MIT