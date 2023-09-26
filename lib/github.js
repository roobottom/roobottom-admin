let { Octokit } = require("@octokit/rest");
const settings = require('../roobottom-admin.settings.json')
const githubToken = process.env.GITHUB_TOKEN;

const {
  repoOwner,
  repoName,
  branchName,
  committerName,
  committerEmail
} = settings;

const octokit = new Octokit({
  auth: githubToken,
});

async function commitFile(content, path, message) {
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      message: message,
      path: path,
      content: content,
      branch: branchName,
      committer: {
        name: committerName,
        email: committerEmail,
      },
      author: {
        name: committerName,
        email: committerEmail,
      },
    });

    console.log(`${path} committed`);
  } catch (err) {
    console.error("An error occurred", err);
  }
}

async function createGithubFiles(files, message = 'New commit from roobottom-admin') {
  try {
    for (const file of files) {
      await commitFile(file.content, file.path, `${message}: ${file.basename}`);
    }

  } catch (error) {
    console.error('Error committing files to GitHub', error.response.data);
    throw error;
  }
}


module.exports = createGithubFiles;
