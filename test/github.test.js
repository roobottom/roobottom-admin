const nock = require('nock');
const { expect } = require('chai');
const createGithubFiles = require('../lib/github.js'); // replace with the actual path

describe('createGithubFiles function', () => {
  beforeEach(() => {
    nock('https://api.github.com')
      .get('/repos/roobottom/roobottom-2022/git/refs/heads/main')
      .reply(200, {
        data: { object: { sha: 'baseTreeShaMock' } }
      })
      .get('/repos/roobottom/roobottom-2022/git/trees/baseTreeShaMock?recursive=1')
      .reply(200, {
        data: { tree: 'baseTreeMock' }
      })
      .post('/repos/roobottom/roobottom-2022/git/trees')
      .reply(200, {
        data: { sha: 'newTreeShaMock' }
      })
      .post('/repos/roobottom/roobottom-2022/git/commits')
      .reply(200, {
        data: { sha: 'newCommitShaMock' }
      })
      .patch('/repos/roobottom/roobottom-2022/git/refs/heads/main')
      .reply(200);
  });

  it('should commit files successfully', async () => {
    try {
      const files = [
        { path: 'testPath1', content: 'testContent1' },
        { path: 'testPath2', content: 'testContent2' },
      ];
      await createGithubFiles(files);
    } catch (error) {
      expect.fail(`Test failed with error: ${error.message}`);
    }
  });

  afterEach(() => {
    nock.cleanAll();
  });
});
