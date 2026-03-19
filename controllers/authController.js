const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generar un token CSRF seguro
 */
const generarTokenCSRF = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Login - Generar tokens JWT y CSRF
 */
const login = (req, res) => {
  try {
    // En un sistema real, aquí validarías credenciales contra una base de datos
    // Para este ejemplo, asumimos que la API key ya fue validada por el middleware
    
    const { email } = req.body;
    
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'El email es requerido' });
    }
    
    // Generar token CSRF
    const csrfToken = generarTokenCSRF();
    
    // Crear payload para JWT
    const payload = {
      id: 1, // En producción, esto vendría de la base de datos
      email: email.trim(),
      apiKey: process.env.API_KEY,
      csrfToken: csrfToken
    };
    
    // Generar token JWT
    const tokenJWT = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Configurar cookie HTTP-Only para el token JWT
    res.cookie('jwt_token', tokenJWT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'strict',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE)
    });
    
    // Configurar cookie para el token CSRF (no HTTP-Only para que el cliente pueda leerlo)
    res.cookie('csrf_token', csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE)
    });
    
    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: payload.id,
        email: payload.email
      },
      csrfToken: csrfToken // También devolver en la respuesta para conveniencia
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el proceso de login' });
  }
};

/**
 * Logout - Eliminar cookies
 */
const logout = (req, res) => {
  try {
    // Eliminar cookie JWT
    res.clearCookie('jwt_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    // Eliminar cookie CSRF
    res.clearCookie('csrf_token', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.json({ mensaje: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error en el proceso de logout' });
  }
};

/**
 * Verificar estado de autenticación
 */
const verificarAuth = (req, res) => {
  try {
    // El middleware ya verificó el token, así que solo devolvemos la info del usuario
    res.json({
      autenticado: true,
      usuario: req.usuario
    });
  } catch (error) {
    console.error('Error al verificar auth:', error);
    res.status(500).json({ error: 'Error al verificar autenticación' });
  }
};

module.exports = {
  login,
  logout,
  verificarAuth,
  generarTokenCSRF
};