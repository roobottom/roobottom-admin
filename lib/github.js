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

Octokit = Octokit.plugin(require("octokit-commit-multiple-files"));

const octokit = new Octokit({
  auth: githubToken,
});

async function createGithubFiles(files, message = 'New commit from roobottom-admin') {
  try {

    const changes = [
      {
        message,
        files: files.reduce((acc, file) => {
          acc[file.path] = { contents: file.content };
          return acc;
        }, {}),
      },
    ];

    await octokit.createOrUpdateFiles({
      owner: repoOwner,
      repo: repoName,
      branch: branchName,
      changes,
      committer: {
        name: committerName,
        email: committerEmail
      },
      author: {
        name: committerName,
        email: committerEmail
      },
    });

    console.log('Files committed successfully');
  } catch (error) {
    console.error('Error committing files to GitHub', error);
    throw error;
  }
}

module.exports = createGithubFiles;
