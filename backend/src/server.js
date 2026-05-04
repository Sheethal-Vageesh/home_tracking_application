require('dotenv').config();

const { createApp } = require('./app');
const { connectToDb } = require('./utils/db');

const PORT = process.env.PORT || 5000;

async function main() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  await connectToDb(process.env.MONGODB_URI);

  const app = createApp();

  app.listen(PORT, () => {
    // Intentionally minimal: avoids leaking env/config
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

