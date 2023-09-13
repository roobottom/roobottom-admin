const express = require('express');
const router = express.Router();
const { createMarkdown } = require('../markdown');
const createGithubFiles = require('../github');
const chrono = require('chrono-node')
const { diaryCreateValidationRules, validate } = require('../validation.js');
const path = require('path');
const fs = require('fs');

function processDateString(date) {
  if (!date) {
    return new Date().toISOString();
  }
  else {
    let parsedDate = chrono.parseDate(date);

    if (parsedDate) {
      return parsedDate.toISOString();
    } else {
      console.warn('Could not parse date input, using current date and time instead.');
      return new Date().toISOString();
    }
  }
}

function isoDateToFilename(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isoDateToYear(date) {
  const d = new Date(date);
  return d.getFullYear();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-{2,}/g, '-');
}

function generateRandomId(length = 5) {
  const characters = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

router.post('/', diaryCreateValidationRules(), validate, async (req, res) => {
  try {
    //get the data from the form
    const { summary, date, tags, content } = req.body;

    //get photo and alt data from the session
    const photoData = req.session.filePaths || [];
    const isoDate = processDateString(date);

    //rename all the photos in the data AND on disk
    photoData.forEach((photo, index) => {
      const newFilename = `${isoDateToFilename(isoDate)}-${photo.originalName}.${photo.extension}`;
      fs.renameSync(`app/uploads/${path.basename(photo.url)}`, `app/uploads/${newFilename}`);
      photo.url = `uploads/${newFilename}`;  // update photo data with new filename
    });

    if (!summary) {
      summary =  generateRandomId()
    }

    const data = {
      summary,
      date: isoDate,
      content
    }

    if (photoData) {
      data.photos = photoData;
    }

    if (tags) {
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
        content: fs.readFileSync(`app/${photo.url}`).toString('base64'),
      })),
    ];

    // Commit files to GitHub
    try {
      await createGithubFiles(filesToCommit, `Create new diary entry with photos`);
      console.log('Files committed successfully');
    } catch (githubError) {
      console.error('Error committing files to GitHub', githubError);
      throw githubError;  // Rethrow the error after logging it
    }

    //on success, render the completion page
    res.render('./diary/complete.njk', data);
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: error.message });
  }
});

module.exports = { router, processDateString };
