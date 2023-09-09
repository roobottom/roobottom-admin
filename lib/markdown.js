const matter = require('gray-matter')
const chrono = require('chrono-node')

function replaceDumbQuotes(str) {
  return str
  .replace(/"([^"]*)"/g, '“$1”')  // Replace dumb double quotes with smart double quotes
  .replace(/(\W)'|'(\W)/g, '$1‘$2')  // Replace dumb single quotes with smart single quotes at the start or end of a word
  .replace(/'([^']*)'/g, '‘$1’')  // Replace remaining dumb single quotes with smart single quotes
  .replace(/(\w)'(\w)/g, '$1’$2');  // Handle contractions and possessives
}

function processDate(date) {
  if (!date) {
    return new Date().toISOString();
  }
  else {
    let parsedDate = chrono.parseDate(date);

    if (parsedDate) {
      return parsedDate.toISOString();
    } else {
      console.warn('Could not parse date input, using current date and time instead.');
      return new Date().toISOString();
    }
  }
}

module.exports = processDate;


function createMarkdown({ summary, date, tags, content }) {
  const data = {
    summary: replaceDumbQuotes(summary),
    date: processDate(date),
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
  };

  const markdownString = matter.stringify(content, data); // Creating the markdown string here

  return markdownString;
}

module.exports = createMarkdown;