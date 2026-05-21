export const verificarAdmin = (req, res, next) => {
  if (!req.usuario?.isAdmin) {
    return res.status(403).json({ error: 'Acceso no autorizado: se requiere rol admin' })
  }
  next()
}
