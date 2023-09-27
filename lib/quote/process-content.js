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
  toLowerCase,
  replaceDumbQuotes,
  stripStartEndQuotes,
} = require('../utils');


router.post('/', async (req, res) => {
  try {

    let { summary, date, cite, compendium, content } = req.body;
    let error = {}
    const isoDate = naturalLanguageStringToIsoDate(date);

    if (!summary) {
      error.summary = "You must provide a quote"
    }

    if (!cite) {
      error.cite = "You must choose who said this"
    }

    //process summary
    summary = stripStartEndQuotes(summary)
    summary = replaceDumbQuotes(summary)
    summary = `“${summary}”`

    const data = {
      summary,
      date: isoDate,
      author: req.auth.user,
      cite
    }

    if (compendium == 'false') {
      data.compendium = 'false'
    }

    data.tags = `stuff ${toLowerCase(cite)} says`

    content ? data.content = content : data.content = '';

    //create a markdown file with `data`
    const markdownData = createMarkdown(data);

    //escape this madness
    if (Object.keys(error).length !== 0) {
      res.render('../app/quote/content', {
        title: "Error: Quote",
        error: error,
        existingData: req.body
      })
    } 
    
    else {
      const filesToCommit = [
        {
          path: `source/diary/${isoDateToFilename(isoDate)}-${slugify(summary)}.md`,
          content: Buffer.from(markdownData).toString('base64'),
          basename: `${isoDateToFilename(isoDate)}-${slugify(summary)}.md`
        }
      ];

      try {
        await createGithubFiles(filesToCommit, `New quote ${summary}`);
        req.session.data = data;
        res.redirect('/quote/complete');
      } catch (githubError) {
        console.error('Error committing files to GitHub', githubError);
        throw githubError;
      }
    }
    

  } catch (error) {
    console.log(error)
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
