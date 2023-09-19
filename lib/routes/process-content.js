const express = require('express');
const router = express.Router();
const { createMarkdown } = require('../markdown');
const createGithubFiles = require('../github');
const path = require('path');
const fs = require('fs');
const { 
  uploadsPath,
  uploadsUrl,
  remoteUrl
} = require('../../roobottom-admin.settings.json');
const {
  naturalLanguageStringToIsoDate,
  isoDateToFilename,
  isoDateToYear,
  slugify,
  generateRandomId,
} = require('../utils');

router.post('/', async (req, res) => {
  try {
    //get the data from the form
    let { summary, date, tags, compendium, content } = req.body;
    console.log('req.body', req.body);

    //get photo and alt data from the session
    const photoData = req.session.filePaths || [];
    const isoDate = naturalLanguageStringToIsoDate(date);

    //rename all the photos in the data AND on disk
    photoData.forEach((photo, index) => {
      const newFilename = `${isoDateToFilename(isoDate)}-${generateRandomId()}.${photo.extension}`;
      fs.renameSync(`${uploadsPath}${path.basename(photo.url)}`, `${uploadsPath}${newFilename}`);
      photo.url = `${uploadsUrl}${newFilename}`;
      photo.remoteUrl = `${remoteUrl}${isoDateToYear(isoDate)}/${newFilename}`
    });

    if (!summary) {
      summary =  generateRandomId()
    }

    const data = {
      summary,
      date: isoDate,
      author: req.auth.user,
      content
    }

    if (photoData) {
      data.photos = photoData;
    }

    if (compendium == 'false') {
      data.compendium = 'false'
    }

    if (tags && tags != '') {
      data.tags = tags;
    }

    //create a markdown file with `data`
    const markdownData = createMarkdown(data);

    // Create a list of files to be committed, including the markdown file
    const filesToCommit = [
      {
        path: `source/diary/${isoDateToFilename(isoDate)}-${slugify(summary)}.md`,
        content: markdownData,
      },
      ...photoData.map(photo => ({
        path: `source/assets/images/diary/${isoDateToYear(isoDate)}/${path.basename(photo.url)}`,
        content: fs.readFileSync(`public/${photo.url}`).toString('base64'),
      })),
    ];

    // Commit files to GitHub
    try {
      await createGithubFiles(filesToCommit, `New post “${summary}”`);
      console.log('Files committed successfully');
      req.session.data = data;
      res.redirect('/diary/complete');
    } catch (githubError) {
      console.error('Error committing files to GitHub', githubError);
      throw githubError;  // Rethrow the error after logging it
    }

  } catch (error) {
    console.log(error)
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
