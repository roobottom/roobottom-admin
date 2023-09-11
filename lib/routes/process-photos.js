const express = require('express');
const router = express.Router();
const multer  = require('multer');
const uploadDir = 'app/uploads/'
const upload = multer({ dest: uploadDir });
const fs = require('fs');
const mime = require('mime');
const path = require('path');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
} 

router.post('/', upload.array('photos', 12), async (req, res) => {
  console.log('Received request');

  if (req.files) {
    console.log('Files received:', req.files);
  } else {
    console.log('No files received');
  }
  try {
    if (req.files) {
      req.session.filePaths = req.files.map(file => {
        return {
          url: `uploads/${file.filename}`,
          filename: file.filename,
          originalName: path.basename(file.originalname),
          extension: mime.getExtension(file.mimetype)
        }
      });

      res.redirect('/diary/alt');  // replace with your next step route
    } else {
      res.status(400).send('No files were uploaded.');
    }
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).send('Server error.');
  }
});

module.exports = router;
