const express = require('express');
const router = express.Router();
const matter = require('gray-matter');
const fs = require('fs');
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,  // Make sure to set this environment variable
});

router.post('/', async (req, res) => {
  const { summary, date, tags, content } = req.body;

  let errors = {};

  if (!summary) {
    errors.summary = 'Summary is required';
  }

  if (Object.keys(errors).length > 0) {
    res.render('index', { errors, summary, date, tags, content });
    return;
  }

  //create diary post
  const data = {
    //date: isoDate,
    tags: tags.split(',').map(tag => tag.trim()), // Convert tags from CSV to array
  }

  try {
    const markdownString = matter.stringify(content, data); // Creating the markdown string here
    await createGithubFile(summary, markdownString);  // Pass the markdown string directly
    res.send('File created successfully');
  } catch (error) {
    res.send('Error creating file');
  }

});

async function createGithubFile(filename, content) {
  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: 'roobottom',  // Replace with your GitHub username
      repo: 'roobottom-2022',  // Replace with your repository name
      path: `source/test/${filename}.md`,  // Adjust the path as needed
      message: 'Created new diary entry',
      content: Buffer.from(content).toString('base64'),  // The file content, encoded as Base64
      branch: 'main',  // Adjust the branch as needed
    });
    console.log(`File ${filename}.md created successfully on GitHub`);
  } catch (error) {
    console.error('Error creating file on GitHub', error);
  }
}



module.exports = router;