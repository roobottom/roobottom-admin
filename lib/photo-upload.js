require('dotenv').config();

const fs = require('fs');
const path = require('path');
const ImageKit = require('imagekit');

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function uploadPhotos(files, folder) {
  try {
    const uploadPromises = files.map(file => {
      // Basic security check: validate file type
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      const fileExtension = path.extname(file.originalname).toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        return Promise.reject(new Error(`Unsupported file type: ${file.originalname}`));
      }

      const fileContent = fs.readFileSync(file.path);
      return imageKit.upload({
        file: fileContent, // required
        fileName: file.originalname, // required
        useUniqueFileName: false,
        folder: folder
      });
    });

    const results = await Promise.allSettled(uploadPromises);
    const uploadResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { status: 'success', file: files[index].originalname, result: result.value };
      } else {
        return { status: 'error', file: files[index].originalname, reason: result.reason.message };
      }
    });

    // Handle each upload result individually
    uploadResults.forEach(result => {
      if (result.status === 'success') {
        console.log(`Upload successful: ${result.file}`, result.result);
      } else {
        console.error(`Error uploading ${result.file}:`, result.reason);
      }
    });

    // Return or process the uploadResults array as needed
    return uploadResults;
  } catch (error) {
    console.error('Unexpected error during the upload process:', error);
    throw error;
  }
}

module.exports = uploadPhotos;
