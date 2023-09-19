const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const fs = require('fs');

async function compressImage(filePath, outputPath) {
  try {
    await imagemin([filePath], {
      destination: outputPath,
      plugins: [
        imageminJpegtran(),
        imageminPngquant({ quality: [0.6, 0.8] }) // Adjust the quality as needed
      ]
    });
    console.log(`Image compressed: ${filePath}`);
  } catch (error) {
    console.error(`Failed to compress image: ${filePath}`, error);
  }
}
module.exports = compressImage;