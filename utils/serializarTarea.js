/**
 * Fuerza que `categorias` siempre sea un array JS,
 * independientemente de si Sequelize/mysql2 lo entregó como
 * string JSON o como array ya parseado.
 */
function parseCat(valor) {
  if (Array.isArray(valor)) return valor
  if (typeof valor === 'string') {
    try { return JSON.parse(valor) } catch { return [] }
  }
  return []
}

export function serializarTarea(t) {
  const plain = t.toJSON()
  return {
    ...plain,
    categorias: parseCat(plain.categorias),
  }
}
