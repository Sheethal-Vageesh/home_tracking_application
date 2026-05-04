const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const childIdAlphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // avoids 0/O/1/I confusion
const CHILD_ID_LENGTH = 8;

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function generateChildId() {
  const bytes = crypto.randomBytes(CHILD_ID_LENGTH);
  let out = '';
  for (let i = 0; i < CHILD_ID_LENGTH; i++) {
    out += childIdAlphabet[bytes[i] % childIdAlphabet.length];
  }
  return out;
}

module.exports = { hashPassword, verifyPassword, signToken, generateChildId };

