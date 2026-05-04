function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const message = status >= 500 ? 'Server error' : err.message;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message, details: err.details });
}

module.exports = { notFoundHandler, errorHandler };

