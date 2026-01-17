import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '..', 'public', 'images');
const thumbnailSize = 200;

async function generateThumbnails() {
  try {
    // Get all album directories
    const albums = fs.readdirSync(imagesDir).filter(file => {
      return fs.statSync(path.join(imagesDir, file)).isDirectory();
    });

    for (const album of albums) {
      const albumPath = path.join(imagesDir, album);
      const thumbDir = path.join(albumPath, 'thumbs');

      // Create thumbs directory if it doesn't exist
      if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir, { recursive: true });
      }

      // Get all image files
      const files = fs.readdirSync(albumPath).filter(file => {
        return /\.(jpg|jpeg|png|gif)$/i.test(file);
      });

      console.log(`Processing album: ${album} (${files.length} images)`);

      for (const file of files) {
        const inputPath = path.join(albumPath, file);
        const outputPath = path.join(thumbDir, file);

        try {
          await sharp(inputPath)
            .rotate()
            .resize(thumbnailSize, thumbnailSize, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toFile(outputPath);

          console.log(`  ✓ Created thumbnail: ${file}`);
        } catch (error) {
          console.error(`  ✗ Error processing ${file}:`, error.message);
        }
      }
    }

    console.log('Thumbnail generation complete!');
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    process.exit(1);
  }
}

generateThumbnails();
