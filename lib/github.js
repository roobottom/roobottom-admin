const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Make sure to set this environment variable
});

async function createGithubFile(filename, content) {
  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: 'roobottom', 
      repo: 'roobottom-2022', 
      path: `source/test/${filename}.md`, 
      message: 'Created new diary entry',
      content: Buffer.from(content).toString('base64'),
      branch: 'main',
    });
    console.log(`File ${filename}.md created successfully on GitHub`);
  } catch (error) {
    console.error('Error creating file on GitHub', error);
    throw error;
  }
}

module.exports = createGithubFile;
