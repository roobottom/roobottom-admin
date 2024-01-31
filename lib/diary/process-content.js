const express = require('express');
const fs = require('fs').promises; // Use the promise-based version of fs
const path = require('path');
const { createMarkdown } = require('../markdown');
const createGithubFiles = require('../github');
const uploadPhotos = require('../photo-upload');
const settings = require('../../roobottom-admin.settings.json');
const utils = require('../utils');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const formData = extractFormData(req);
    const photoData = await processPhotos(req.session.filePaths || [], formData.date);
    const markdownData = createMarkdown(composeMarkdownData(formData, photoData));

    await uploadPhotosToImageKit(photoData, formData.date);
    await commitFilesToGitHub(markdownData, formData);

    req.session.data = { ...formData, photos: photoData };
    res.redirect('/diary/complete');
  } catch (error) {
    console.error('Error processing form:', error);
    res.status(500).send({ error: error.message });
  }
});

async function processPhotos(photoFiles, date) {
  for (let i = 0; i < photoFiles.length; i++) {
    const photo = photoFiles[i];
    const oldPath = path.join(settings.uploadsPath, path.basename(photo.url));
    const newFilename = `${utils.isoDateToFilename(date)}-${utils.generateRandomId()}.${photo.extension}`;
    const newPath = path.join(settings.uploadsPath, newFilename);

    // Rename the file on disk
    await fs.rename(oldPath, newPath);

    // Update the photo object with new information
    photo.path = newPath; // Update the path
    photo.originalname = newFilename; // Update the original name
    photo.url = `${settings.imagekitFolder}${utils.isoDateToYear(date)}/${newFilename}`; // Update the URL
  }

  console.log(photoFiles); // This will now contain the updated photo information
  return photoFiles; // Return the updated array
}


function extractFormData(req) {
  let { summary, date, tags, compendium, content } = req.body;

  // Convert the natural language date to ISO date format
  const isoDate = utils.naturalLanguageStringToIsoDate(date);

  // Use the generated random ID as a fallback for summary if it's not provided
  summary = summary || utils.generateRandomId();

  //ensure that content contains something
  content = content || '';

  // Initialize the formData with mandatory and non-conditional fields
  const formData = {
    summary,
    date: isoDate, // Use the processed ISO date
    compendium: compendium === 'false' ? 'false' : '',
    content,
    author: req.auth.user,
    tags
  };

  return formData;
}



function composeMarkdownData(formData, photoData) {
  return {
    ...formData,
    photos: photoData.map(photo => ({
      ...photo,
      remoteUrl: photo.url // Assuming the 'url' is updated after ImageKit upload
    }))
  };
}

async function uploadPhotosToImageKit(photoData, date) {
  const folder = `${settings.imagekitFolder}${utils.isoDateToYear(date)}/`;
  const uploadResults = await uploadPhotos(photoData.map(photo => ({ path: photo.path, originalname: photo.originalname })), folder);

  for (const [index, result] of uploadResults.entries()) {
    if (result.status === 'success') {
      photoData[index].url = result.result.url; // Update the URL to the remote URL
      await fs.unlink(photoData[index].path); // Clean up the local file
    } else {
      throw new Error(`Failed to upload photo: ${result.reason}`);
    }
  }
}

async function commitFilesToGitHub(markdownData, formData) {
  const markdownFilePath = `source/diary/${utils.isoDateToFilename(formData.date)}-${utils.slugify(formData.summary)}.md`;
  const filesToCommit = [
    {
      path: markdownFilePath,
      content: Buffer.from(markdownData).toString('base64'),
      basename: path.basename(markdownFilePath)
    }
  ];

  await createGithubFiles(filesToCommit, `New post “${formData.summary}”`);
}

module.exports = router;
