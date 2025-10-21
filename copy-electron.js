const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'public', 'electron.js');
const dest = path.join(__dirname, 'build', 'electron.js');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('Copied public/electron.js to build/electron.js');
} else {
  console.error('public/electron.js not found!');
}
