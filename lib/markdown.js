const matter = require('gray-matter')

function replaceDumbQuotes(str) {
  return str
  .replace(/"([^"]*)"/g, '“$1”')  // Replace dumb double quotes with smart double quotes
  .replace(/(\W)'|'(\W)/g, '$1‘$2')  // Replace dumb single quotes with smart single quotes at the start or end of a word
  .replace(/'([^']*)'/g, '‘$1’')  // Replace remaining dumb single quotes with smart single quotes
  .replace(/(\w)'(\w)/g, '$1’$2');  // Handle contractions and possessives
}

function createMarkdown({ photos, summary, date, tags, author, compendium, content }) {
  const data = {
    summary: replaceDumbQuotes(summary),
    date: typeof date === 'string' ? new Date(date) : date,
    author: author
  };

  if (tags) {
    data.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
  }

  if (photos) {
    data.photo = photos.map(photo => ({ url: photo.remoteUrl, alt: replaceDumbQuotes(photo.alt) }));
  }

  if (compendium) {
    data.compendium = compendium;
  }

  const markdownString = matter.stringify(content, data); // Creating the markdown string here

  return markdownString;
}

module.exports = { replaceDumbQuotes, createMarkdown };