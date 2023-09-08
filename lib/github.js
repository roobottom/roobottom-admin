const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Make sure to set this environment variable
});

async function createGithubFile(filename, content) {
  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: 'roobottom', // Replace with your GitHub username
      repo: 'roobottom-2022', // Replace with your repository name
      path: `source/test/${filename}.md`, // Adjust the path as needed
      message: 'Created new diary entry',
      content: Buffer.from(content).toString('base64'), // The file content, encoded as Base64
      branch: 'main', // Adjust the branch as needed
    });
    console.log(`File ${filename}.md created successfully on GitHub`);
  } catch (error) {
    console.error('Error creating file on GitHub', error);
    throw error;
  }
}

module.exports = createGithubFile;
