import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Usuario from '../models/Usuario.js';
import { OAuth2Client } from 'google-auth-library'; 

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(googleClientId);

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
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Credential requerido' });
    }

    // 🔍 1. Verificar token con Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payloadGoogle = ticket.getPayload();

    const email = payloadGoogle.email;
    const nombre = payloadGoogle.name;
    const googleId = payloadGoogle.sub;

    // 🗄️ 2. Buscar o crear usuario
    const [usuario] = await Usuario.findOrCreate({
      where: { email },
      defaults: {
        nombre: nombre || email.split('@')[0],
        password: crypto.randomBytes(16).toString('hex'),
        id: googleId
      },
    });

    // 🔐 3. Generar CSRF
    const csrfToken = generarTokenCSRF();

    // 🔐 4. Payload JWT (IMPORTANTE: no metas csrf aquí)
    const payload = {
      id: usuario.id,
      email: usuario.email,
      googleId: googleId
    };

    const tokenJWT = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 🍪 5. Cookies
    res.cookie('jwt_token', tokenJWT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE)
    });

    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE)
    });

    // 📤 6. Respuesta
    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario.id,
        email: usuario.email
      },
      csrfToken
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(401).json({ error: 'Token de Google inválido' });
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
      sameSite: 'lax'
    });
    
    // Eliminar cookie CSRF
    res.clearCookie('csrf_token', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.json({ mensaje: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error en el proceso de logout' });
  }
};
export const validarCSRF = (req, res, next) => {
  const csrfCookie = req.cookies.csrf_token;
  const csrfHeader = req.headers['x-csrf-token'];

  console.log('Cookie CSRF:', csrfCookie)   // ← agrega
  console.log('Header CSRF:', csrfHeader)   // ← agrega
  console.log('¿Iguales?:', csrfCookie === csrfHeader)  // ← agrega

  if (!csrfCookie || csrfCookie !== csrfHeader) {
    return res.status(403).json({ error: 'CSRF inválido' });
  }

  next();
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