const jwt = require('jsonwebtoken');

// Middleware estricto - exige token valido
function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Acceso denegado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalido' });
  }
}

// Middleware opcional - anade userId si hay token, pero no exige
function optionalAuth(req, _res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
  } catch { /* ignorar token invalido */ }
  next();
}

module.exports = auth;
module.exports.optionalAuth = optionalAuth;
