// Script to copy Leaflet marker icons to build/ after each build for Electron compatibility
const fs = require('fs');
const path = require('path');

const icons = ['marker-icon.png', 'marker-shadow.png'];
const srcDir = path.join(__dirname, 'public');
const destDir = path.join(__dirname, 'build');

icons.forEach(icon => {
  const src = path.join(srcDir, icon);
  const dest = path.join(destDir, icon);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${icon} to build/`);
  } else {
    console.warn(`${icon} not found in public/`);
  }
});
