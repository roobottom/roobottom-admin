const matter = require('gray-matter')
const { replaceDumbQuotes } = require('./utils.js')

function createMarkdown({ content, ...frontmatter }) {
  let data = {};

  for (const [key, value] of Object.entries(frontmatter)) {

    //handle known keys
    if (key === 'tags' && typeof value === 'string') {
      data[key] = value.split(',').map(tag => tag.trim());
      continue;
    }
    if (key === 'photos' && typeof value === 'object') {
      data['photo'] = value.map(photo => ({ url: photo.remoteUrl, alt: replaceDumbQuotes(photo.alt) }));
      continue;
    }
    if (key === 'date' && typeof value === 'string') {
      data[key] = new Date(value);
      continue;
    }


    //catch any random objects
    if (typeof value === 'object') {
      // Catch-all for random objects
      data[key] = JSON.stringify(value);
      continue;
    }

    //catch all strings, use replaceDumbQuotes on known keys
    data[key] = (key === 'summary') ? replaceDumbQuotes(value) : value;
  }

  const markdownString = matter.stringify(content, data);
  return markdownString;
}

module.exports = { createMarkdown };