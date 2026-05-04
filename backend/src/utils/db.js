const mongoose = require('mongoose');

async function connectToDb(uri) {
  if (!uri) throw new Error('MONGODB_URI is required');

  mongoose.set('strictQuery', true);
  // Retry instead of crashing on transient DB/network issues.
  // This helps during Atlas IP-allowlist changes.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await mongoose.connect(uri);
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      console.error('MongoDB connection failed:', err?.message || err);
      console.log('Retrying MongoDB connection in 5 seconds...');
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

module.exports = { connectToDb };

