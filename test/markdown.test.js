const { createMarkdown } = require('../lib/markdown'); // Change the path accordingly
const matter = require('gray-matter');

test('Test createMarkdown with minimal options', () => {
  const data = {
    content: "Hello, this is content."
  };

  const result = createMarkdown(data);
  const parsedResult = matter(result);

  expect(parsedResult.content.trim()).toBe("Hello, this is content.");
});

test('Test createMarkdown with some frontmatter', () => {
  const data = {
    content: "More content here",
    summary: 'This is a summary',
    date: '2023-09-26'
  };

  const result = createMarkdown(data);
  const parsedResult = matter(result);

  expect(parsedResult.data.summary).toBe('This is a summary');
  expect(parsedResult.data.date).toEqual(new Date('2023-09-26'));
});

test('Test createMarkdown with photos and tags', () => {
  const data = {
    content: "Even more content",
    photos: [{ remoteUrl: '/assets/images/diary/photo1.jpg', alt: 'photo1' }],
    tags: 'tag1, tag2'
  };

  const result = createMarkdown(data);
  const parsedResult = matter(result);

  expect(parsedResult.data.photo[0]).toEqual({ url: '/assets/images/diary/photo1.jpg', alt: 'photo1' });
  expect(parsedResult.data.tags).toEqual(['tag1', 'tag2']);
});

test('Test createMarkdown with a boolean and an object', () => {
  const data = {
    content: "Let's add some booleans and objects",
    isDraft: true,
    metadata: { author: 'Jon' }
  };

  const result = createMarkdown(data);
  const parsedResult = matter(result);

  expect(parsedResult.data.isDraft).toBe(true);
  expect(parsedResult.data.metadata).toBe(JSON.stringify({ author: 'Jon' }));
});
