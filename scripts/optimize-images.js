const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../public/images');

function optimizeImage(filePath) {
  const tempPath = filePath + '.tmp';
  const ext = path.extname(filePath).toLowerCase();
  
  let pipeline = sharp(filePath);
  
  if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({ quality: 80, progressive: true });
  } else if (ext === '.png') {
    pipeline = pipeline.png({ quality: 80, compressionLevel: 8 });
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({ quality: 80 });
  } else {
    // Skip other formats
    return;
  }

  pipeline
    .toFile(tempPath)
    .then(() => {
      fs.renameSync(tempPath, filePath);
      console.log(`Optimized: ${filePath}`);
    })
    .catch(err => {
      console.error(`Error optimizing ${filePath}:`, err);
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    });
}

function processDirectory(directory) {
  fs.readdirSync(directory).forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else {
      optimizeImage(fullPath);
    }
  });
}

console.log('Starting image optimization...');
processDirectory(imagesDir);
