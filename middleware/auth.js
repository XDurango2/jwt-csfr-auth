import jwt from 'jsonwebtoken';

/**
 * Middleware para verificar el token JWT desde la cookie HTTP-Only
 * y validar el token CSRF
 */
export const verificarToken = (req, res, next) => {
  try {
    // Obtener el token JWT de la cookie HTTP-Only
    const tokenJWT = req.cookies.jwt_token;
    
    if (!tokenJWT) {
      return res.status(401).json({ error: 'Token JWT no proporcionado' });
    }

    // Obtener el token CSRF del header
    const csrfToken = req.headers['x-csrf-token'];
    
    if (!csrfToken) {
      return res.status(401).json({ error: 'Token CSRF no proporcionado' });
    }

    // Verificar el token JWT
    const decoded = jwt.verify(tokenJWT, process.env.JWT_SECRET);
    
    // En verificarToken, reemplaza la comparación de CSRF por:
    const csrfCookie = req.cookies.csrf_token
    if (!csrfCookie || csrfCookie !== csrfToken) {
      return res.status(401).json({ error: 'Token CSRF inválido en el middleware' })
    }

    // Agregar información del usuario a la request
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error('Error en verificación de token:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token JWT inválido' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token JWT expirado' });
    }
    
    return res.status(500).json({ error: 'Error en autenticación' });
  }
};

/**
 * Middleware para validar la API key en el header (para login)
 */
export const validarApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API Key no proporcionada' });
  }
  
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'API Key inválida' });
  }
  
  next();
};