import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Usuario from '../models/Usuario.js';

/**
 * Generar un token CSRF seguro
 */
export const generarTokenCSRF = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Login - Generar tokens JWT y CSRF
 */
export const login = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'El email es requerido' });
    }

    const trimmedEmail = email.trim();

    // Buscar o crear el usuario en la base de datos
    const [usuario] = await Usuario.findOrCreate({
      where: { email: trimmedEmail },
      defaults: {
        nombre: trimmedEmail.split('@')[0] || trimmedEmail,
        password: crypto.randomBytes(16).toString('hex'),
      },
    });
    
    // Generar token CSRF
    const csrfToken = generarTokenCSRF();
    
    // Crear payload para JWT con el id real del usuario
    const payload = {
      id: usuario.id,
      email: usuario.email,
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
export const logout = (req, res) => {
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
export const verificarAuth = (req, res) => {
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