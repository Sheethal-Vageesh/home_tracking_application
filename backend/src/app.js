const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { notFoundHandler, errorHandler } = require('./middleware/errors');
const { authRouter } = require('./routes/auth');
const { clinicianRouter } = require('./routes/clinicians');
const { parentRouter } = require('./routes/parents');

function createApp() {
  const app = express();

  // Needed so videos served from the API (port 5000) can be played in the UI (port 5173)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRouter);
  app.use('/api/clinicians', clinicianRouter);
  app.use('/api/parents', parentRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

