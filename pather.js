const path = require('path');

function createPath(template) {
  return path.join(__dirname, '../public', template + '.ejs');
}

module.exports = createPath;
