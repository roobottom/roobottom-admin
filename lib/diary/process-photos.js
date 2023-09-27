const express = require('express');
const router = express.Router();
const multer  = require('multer');
const uploadDir = 'public/uploads/'
const upload = multer({ dest: uploadDir });
const fs = require('fs');
const mime = require('mime');
const path = require('path');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
} 

router.post('/', upload.array('photos', 12), async (req, res) => {


  try {
    if (req.files.length != 0) {
      req.session.filePaths = req.files.map(file => {
        return {
          url: `uploads/${file.filename}`,
          filename: file.filename,
          originalName: path.basename(file.originalname),
          extension: mime.getExtension(file.mimetype)
        }
      });

      res.redirect('/diary/alt');
    } else {
      res.render('../app/diary/photos', {
        title: "Error: Upload photos",
        error: {
          photos: "You must select at least one photo" 
        }
      })
    }
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).send('Server error.');
  }
});

module.exports = router;
