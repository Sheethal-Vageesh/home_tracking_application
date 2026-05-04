const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function safeExt(originalName) {
  const ext = path.extname(originalName || '').toLowerCase();
  // Only allow common video extensions; fallback to .bin
  if (['.mp4', '.mov', '.webm', '.m4v'].includes(ext)) return ext;
  return '.bin';
}

function createUploader({ subdir }) {
  ensureUploadsDir();
  const dir = path.join(UPLOADS_DIR, subdir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = safeExt(file.originalname);
      const name = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
      cb(null, name);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (_req, file, cb) => {
      if (file.mimetype && file.mimetype.startsWith('video/')) return cb(null, true);
      return cb(new Error('Only video files are allowed'));
    },
  });
}

function toPublicUploadUrl(req, absFilePath) {
  // absFilePath should be inside <root>/uploads
  const rel = path.relative(UPLOADS_DIR, absFilePath).split(path.sep).join('/');
  return `${req.protocol}://${req.get('host')}/uploads/${rel}`;
}

module.exports = { UPLOADS_DIR, createUploader, toPublicUploadUrl };

