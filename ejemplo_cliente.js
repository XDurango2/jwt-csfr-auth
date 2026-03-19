// Ejemplo de cliente para probar la API de tareas
// Este archivo muestra cómo interactuar con la API desde Node.js

import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

// Configurar axios con soporte de cookies
const jar = new CookieJar();
const cliente = wrapper(axios.create({ jar }));

// Configuración
const API_BASE_URL = 'http://localhost:3003/api';
const API_KEY = 'mi_api_key_secreta_12345';

let csrfToken = '';

async function probarAPI() {
  console.log('=== Probando API de Tareas con JWT y Cookies HTTP-Only ===\n');
  
  try {
    // 1. Login para obtener tokens
    console.log('1. Realizando login...');
    const loginResponse = await cliente.post(
      `${API_BASE_URL}/auth/login`,
      { email: 'usuario@ejemplo.com' },
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Login exitoso');
    console.log('Usuario:', loginResponse.data.usuario);
    csrfToken = loginResponse.data.csrfToken;
    console.log('Token CSRF recibido:', csrfToken.substring(0, 20) + '...');
    console.log('Cookies configuradas automáticamente por axios-cookiejar-support\n');
    
    // 2. Verificar autenticación
    console.log('2. Verificando autenticación...');
    const verifyResponse = await cliente.get(
      `${API_BASE_URL}/auth/verify`,
      {
        headers: {
          'x-csrf-token': csrfToken
        }
      }
    );
    
    console.log('✅ Autenticación verificada');
    console.log('Usuario autenticado:', verifyResponse.data.usuario.email);
    console.log('API Key:', verifyResponse.data.usuario.apiKey.substring(0, 10) + '...\n');
    
    // 3. Crear una nueva tarea
    console.log('3. Creando nueva tarea...');
    const nuevaTarea = {
      titulo: 'Comprar víveres',
      descripcion: 'Leche, huevos, pan y frutas',
      completada: false
    };
    
    const crearResponse = await cliente.post(
      `${API_BASE_URL}/tareas`,
      nuevaTarea,
      {
        headers: {
          'x-csrf-token': csrfToken,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Tarea creada exitosamente');
    console.log('Tarea creada:', crearResponse.data.tarea);
    console.log('ID de tarea:', crearResponse.data.tarea.id);
    console.log('Usuario ID:', crearResponse.data.tarea.usuarioId);
    console.log('Fecha creación:', crearResponse.data.tarea.fechaCreacion);
    console.log('');
    
    // 4. Crear otra tarea
    console.log('4. Creando segunda tarea...');
    const segundaTarea = {
      titulo: 'Estudiar Node.js',
      descripcion: 'Repasar autenticación JWT y cookies',
      completada: true
    };
    
    await cliente.post(
      `${API_BASE_URL}/tareas`,
      segundaTarea,
      {
        headers: {
          'x-csrf-token': csrfToken,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Segunda tarea creada\n');
    
    // 5. Obtener todas las tareas
    console.log('5. Obteniendo todas las tareas...');
    const tareasResponse = await cliente.get(
      `${API_BASE_URL}/tareas`,
      {
        headers: {
          'x-csrf-token': csrfToken
        }
      }
    );
    
    console.log('✅ Tareas obtenidas exitosamente');
    console.log('Total de tareas:', tareasResponse.data.total);
    console.log('Lista de tareas:');
    tareasResponse.data.tareas.forEach((tarea, index) => {
      console.log(`  ${index + 1}. ${tarea.titulo} - ${tarea.completada ? '✅ Completada' : '⏳ Pendiente'}`);
    });
    console.log('');
    
    // 6. Obtener una tarea específica
    console.log('6. Obteniendo tarea específica (ID: 1)...');
    const tareaEspecifica = await cliente.get(
      `${API_BASE_URL}/tareas/1`,
      {
        headers: {
          'x-csrf-token': csrfToken
        }
      }
    );
    
    console.log('✅ Tarea específica obtenida');
    console.log('Detalles:');
    console.log('  Título:', tareaEspecifica.data.tarea.titulo);
    console.log('  Descripción:', tareaEspecifica.data.tarea.descripcion);
    console.log('  Estado:', tareaEspecifica.data.tarea.completada ? 'Completada' : 'Pendiente');
    console.log('');
    
    // 7. Intentar acceder sin token CSRF (debería fallar)
    console.log('7. Probando protección CSRF (intento sin token CSRF)...');
    try {
      await cliente.get(`${API_BASE_URL}/tareas`);
      console.log('❌ ERROR: Debería haber fallado sin token CSRF');
    } catch (error) {
      console.log('✅ Correcto: Solicitud rechazada sin token CSRF');
      console.log('  Error:', error.response?.data?.error || error.message);
    }
    console.log('');
    
    // 8. Logout
    console.log('8. Realizando logout...');
    const logoutResponse = await cliente.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      {
        headers: {
          'x-csrf-token': csrfToken,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Logout exitoso:', logoutResponse.data.mensaje);
    console.log('');
    
    // 9. Intentar acceder después de logout (debería fallar)
    console.log('9. Intentando acceder después de logout...');
    try {
      await cliente.get(
        `${API_BASE_URL}/tareas`,
        {
          headers: {
            'x-csrf-token': csrfToken
          }
        }
      );
      console.log('❌ ERROR: Debería haber fallado después de logout');
    } catch (error) {
      console.log('✅ Correcto: Acceso denegado después de logout');
      console.log('  Error:', error.response?.data?.error || error.message);
    }
    
    console.log('\n=== Todas las pruebas completadas exitosamente ===');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
    }
  }
}

// Instrucciones para ejecutar
console.log('Para ejecutar este ejemplo:');
console.log('1. Asegúrate de que el servidor esté corriendo: node server.js');
console.log('2. Instala las dependencias adicionales: npm install axios tough-cookie axios-cookiejar-support');
console.log('3. Ejecuta este archivo: node ejemplo_cliente.js\n');

// Si se ejecuta directamente, mostrar instrucciones
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Este es un archivo de ejemplo. Sigue las instrucciones arriba para probarlo.');
  probarAPI();
}

export { probarAPI };