const chrono = require('chrono-node');

function naturalLanguageStringToIsoDate(date) {
  if (!date) {
    return new Date().toISOString();
  }
  let parsedDate = chrono.parseDate(date);

  if (parsedDate) {
    return parsedDate.toISOString();
  } else {
    console.warn('Could not parse date input, using current date and time instead.');
    return new Date().toISOString();
  }
}

function isoDateToFilename(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isoDateToYear(date) {
  const d = new Date(date);
  return d.getFullYear();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-{2,}/g, '-');
}

function generateRandomId(length = 5) {
  const characters = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function replaceDumbQuotes(str) {
  return str
    .replace(/"([^"]*)"/g, '“$1”')  // Replace dumb double quotes with smart double quotes
    .replace(/(\w)'(\w)/g, '$1’$2')  // Handle contractions and possessives
    .replace(/(\W)'|'(\W)/g, '$1‘$2')  // Replace dumb single quotes with smart single quotes at the start or end of a word
    .replace(/'([^']*)'/g, '‘$1’');  // Replace remaining dumb single quotes with smart single quotes
}

function toLowerCase (str) {
  if (typeof str !== 'string') {
    return str
  }
  return str.toLowerCase();
};

const stripStartEndQuotes = (str) => {
  if (typeof str !== 'string') {
    return str;
  }
  str = str.replace(/^["'“‘]/, '');
  str = str.replace(/["'”’]$/, '');

  return str;
};

module.exports = {
  naturalLanguageStringToIsoDate,
  isoDateToFilename,
  isoDateToYear,
  slugify,
  generateRandomId,
  replaceDumbQuotes,
  toLowerCase,
  stripStartEndQuotes,
};
