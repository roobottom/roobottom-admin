const express = require('express');
const router = express.Router();
const createMarkdown = require('./markdown');
const createGithubFile = require('./github');
const { diaryCreateValidationRules, validate } = require('./validation.js');

router.post('/', diaryCreateValidationRules(), validate, async (req, res) => {
  try {
    const { summary, date, tags, content } = req.body;
    const markdownData = createMarkdown({ summary, date, tags, content });
    const markdownDataString = JSON.stringify(markdownData, null, 2)
    //await createGithubFile(summary, markdownData);
    res.render('index', { markdownDataString });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
