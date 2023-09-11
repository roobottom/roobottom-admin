const express = require('express');
const router = express.Router();
const { createMarkdown } = require('../markdown');
const createGithubFile = require('../github');
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

    const data = {
      photos: photoData,
      summary,
      date: isoDate,
      tags,
      content
    }

    const markdownData = createMarkdown(data);
    //await createGithubFile(summary, markdownData);
    res.render('./diary/complete.njk', data);
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: error.message });
  }
});

module.exports = { router, processDateString };
