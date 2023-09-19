const fs = require('fs');
const path = require('path');

const uploadsPath = 'public/uploads';
const maxAge = 3600000; // Files older than 1 hour will be deleted

fs.readdir(uploadsPath, (err, files) => {
  if (err) throw err;

  files.forEach(file => {
    const filePath = path.join(uploadsPath, file);
    fs.stat(filePath, (err, stats) => {
      if (err) throw err;
      
      if (Date.now() - stats.mtime.getTime() > maxAge) {
        fs.unlink(filePath, err => {
          if (err) throw err;
          console.log(`Deleted: ${filePath}`);
        });
      }
    });
  });
});
