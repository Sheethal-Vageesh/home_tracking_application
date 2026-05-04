const jwt = require('jsonwebtoken');

function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    return next(err);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (_e) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    return next(err);
  }
}

function requireRole(role) {
  return (req, _res, next) => {
    if (!req.user || req.user.role !== role) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      return next(err);
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };

