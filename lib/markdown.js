const matter = require('gray-matter');

function createMarkdown({ summary, date, tags, content }) {
  const data = {
    // Add logic to handle 'date' appropriately
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [], // Convert tags from CSV to array
  };

  const markdownString = matter.stringify(content, data); // Creating the markdown string here

  return markdownString;
}

module.exports = createMarkdown;