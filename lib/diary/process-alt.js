const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  try {
    if (req.session.filePaths) {
      // Loop through all keys in the request body
      for (const key of Object.keys(req.body)) {
        if (key.startsWith('alt-')) {
          // Get the index from the key name and use it to find the correct file in the session
          const index = parseInt(key.split('-')[1], 10);
          req.session.filePaths[index].alt = req.body[key];  // Adding the alt text to the corresponding file object
        }
      }
    }
    console.log(req.session.filePaths);
    res.redirect('/diary/content'); 
  } catch (error) {
    console.error('Error processing alt text:', error);
    res.status(500).send('Server error.');
  }
})

module.exports = router;