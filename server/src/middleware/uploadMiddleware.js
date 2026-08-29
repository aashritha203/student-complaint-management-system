const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage disk details
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`);
  },
});

// Configure file formatting validation rules
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|pdf|webp/;
  const isExtNameValid = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const isMimeTypeValid = allowedExtensions.test(file.mimetype.toLowerCase());

  if (isExtNameValid || isMimeTypeValid) {
    cb(null, true);
  } else {
    cb(new Error('Uploading files failed. Only images (jpeg, jpg, png, gif, webp) and PDFs are accepted'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB size limit
  fileFilter,
});

module.exports = upload;
