const express = require('express');
const router = express.Router();
const { createMarkdown } = require('../markdown');
const createGithubFiles = require('../github');
const chrono = require('chrono-node')
const path = require('path');
const fs = require('fs');
const settings = require('../../roobottom-admin.settings.json');

const {
  uploadsPath
} = settings;

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

router.post('/', async (req, res) => {
  try {
    //get the data from the form
    let { summary, date, tags, compendium, content } = req.body;

    //get photo and alt data from the session
    const photoData = req.session.filePaths || [];
    const isoDate = processDateString(date);

    //rename all the photos in the data AND on disk
    photoData.forEach((photo, index) => {
      const newFilename = `${isoDateToFilename(isoDate)}-${index + 1}.${photo.extension}`;
      fs.renameSync(`${uploadsPath}${path.basename(photo.url)}`, `public/uploads/${newFilename}`);
      photo.url = `uploads/${newFilename}`;
      photo.remoteUrl = `/assets/images/diary/${isoDateToYear(isoDate)}/${newFilename}`
    });

    if (!summary) {
      summary =  generateRandomId()
    }

    const data = {
      summary,
      date: isoDate,
      content,
      author: req.auth.user
    }

    if (photoData) {
      data.photos = photoData;
    }

    if (compendium == 'false') {
      data.compendium = 'false'
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
        content: fs.readFileSync(`public/${photo.url}`).toString('base64'),
      })),
    ];

    // Commit files to GitHub
    try {
      await createGithubFiles(filesToCommit, `New post “${summary}”`);
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
