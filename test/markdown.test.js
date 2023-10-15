const assert = require('node:assert');
const test = require('node:test');
const { createMarkdown } = require('../lib/markdown');
const matter = require('gray-matter');

test('Test createMarkdown with minimal options', () => {
  const data = {
    content: 'Hello, this is content.'
  };
  const markdown = createMarkdown(data);
  const result = matter(markdown);

  assert.equal(result.content.trim(), "Hello, this is content.");
});

test('Test createMarkdown with some frontmatter', () => {
  const data = {
    content: 'More content here',
    summary: 'This is a summary',
    date: '2023-09-26'
  };
  const markdown = createMarkdown(data);
  const result = matter(markdown);

  assert.equal(result.data.summary, 'This is a summary');
  assert.equal(result.data.date, new Date('2023-09-26').toString());
});

test('Test createMarkdown with photos and tags', () => {
  const data = {
    content: 'Even more content',
    photos: [{
      remoteUrl: '/assets/images/diary/photo1.jpg',
      alt: 'photo1'
    }],
    tags: 'tag1, tag2'
  };
  const markdown = createMarkdown(data);
  const result = matter(markdown);

  assert.deepEqual(result.data.photo[0], {
    url: '/assets/images/diary/photo1.jpg',
    alt: 'photo1'
  });
  assert.deepEqual(result.data.tags, ['tag1', 'tag2']);
});

test('Test createMarkdown with a boolean and an object', () => {
  const data = {
    content: 'Let’s add some booleans and objects',
    isDraft: true,
    metadata: { author: 'Jon' }
  };
  const markdown = createMarkdown(data);
  const result = matter(markdown);

  assert.equal(result.data.isDraft, true);
  assert.equal(result.data.metadata, JSON.stringify({ author: 'Jon' }));
});
