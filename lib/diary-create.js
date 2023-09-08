const express = require('express');
const router = express.Router();
const createMarkdown = require('./createMarkdown');
const createGithubFile = require('./github');
const { diaryCreateValidationRules, validate } = require('./validator.js');

router.post('/', diaryCreateValidationRules(), validate, async (req, res) => {
  try {
    const { summary, date, tags, content } = req.body;

    const errors = validateInput({ summary, date, tags, content });
    if (Object.keys(errors).length > 0) {
      res.status(400).send({ errors });
      return;
    }

    const markdownData = createMarkdown({ summary, date, tags, content });
    await createGithubFile(summary, markdownData);
    res.send('File created successfully');
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
