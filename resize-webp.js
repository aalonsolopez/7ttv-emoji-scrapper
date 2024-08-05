import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = './emotes';
const outputDir = './resized-webp';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.readdirSync(inputDir).forEach(file => {
  if (path.extname(file) === '.webp') {
    sharp(path.join(inputDir, file))
      .resize(512, 512, { fit: 'inside' })
      .toFile(path.join(outputDir, file), (err, info) => {
        if (err) {
          console.error('Error resizing image:', file, err);
        } else {
          console.log('Resized:', file);
        }
      });
  }
});
