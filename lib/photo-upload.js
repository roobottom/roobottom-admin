const fs = require('fs');

async function uploadPhotos(files, createGithubFile) {
  try {
    const photoPromises = files.map(async (file) => {
      const filePath = `../.cache/${file.originalname}`;
      const fileContent = fs.readFileSync(file.path, { encoding: 'base64' });
      
      await createGithubFile(filePath, fileContent, 'Added a new photo');
    });
    
    await Promise.all(photoPromises);
  } catch (error) {
    console.error('Error uploading photos', error);
    throw error;
  }
}

module.exports = uploadPhotos;