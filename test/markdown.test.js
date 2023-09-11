const { expect } = require('chai');
const { createMarkdown, replaceDumbQuotes } = require('../lib/markdown');  // update with the correct path

describe('Markdown module', function() {

  describe('replaceDumbQuotes function', function() {
    it('should replace dumb quotes with smart quotes', function() {
      const input = `She said, "I'm loving it."`;
      const output = replaceDumbQuotes(input);
      const expectedOutput = `She said, “I’m loving it.”`;
      expect(output).to.equal(expectedOutput);
    });
  });

  describe('createMarkdown function', function() {
    it('should create a markdown string with the correct front matter', function() {
      const inputData = {
        summary: 'Test Summary comin\'s "atcha"',
        date: new Date('2023-09-10T18:24:31.534Z'),
        tags: 'test1, test2',
        content: 'Test Content _markdown_',
      };
      const output = createMarkdown(inputData);
      const expectedOutput = `---
summary: Test Summary comin’s “atcha”
date: 2023-09-10T18:24:31.534Z
tags:
  - test1
  - test2
---
Test Content _markdown_
`;
      expect(output).to.equal(expectedOutput);
    });

    // add more test cases to check different inputs
  });
});
