const matter = require('gray-matter')

function replaceDumbQuotes(str) {
  return str
  .replace(/"([^"]*)"/g, '“$1”')  // Replace dumb double quotes with smart double quotes
  .replace(/(\W)'|'(\W)/g, '$1‘$2')  // Replace dumb single quotes with smart single quotes at the start or end of a word
  .replace(/'([^']*)'/g, '‘$1’')  // Replace remaining dumb single quotes with smart single quotes
  .replace(/(\w)'(\w)/g, '$1’$2');  // Handle contractions and possessives
}

function createMarkdown({ photos, summary, date, tags, content }) {
  const data = {
    summary: replaceDumbQuotes(summary),
    date: typeof date === 'string' ? new Date(date) : date,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    photos: photos.map(photo => ({ url: photo.url, alt: replaceDumbQuotes(photo.alt) })),
  };

  const markdownString = matter.stringify(content, data); // Creating the markdown string here

  return markdownString;
}

module.exports = { replaceDumbQuotes, createMarkdown };