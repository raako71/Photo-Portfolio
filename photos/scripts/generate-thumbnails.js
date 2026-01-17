import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '..', 'public', 'images');
const thumbnailSize = 200;
const webSize = 1920; // Max dimension for web-sized images

async function generateThumbnails() {
  try {
    // Get all album directories
    const albums = fs.readdirSync(imagesDir).filter(file => {
      return fs.statSync(path.join(imagesDir, file)).isDirectory();
    });

    const manifest = {};

    for (const album of albums) {
      const albumPath = path.join(imagesDir, album);
      const thumbDir = path.join(albumPath, 'thumbs');
      const webDir = path.join(albumPath, 'web');

      // Create thumbs and web directories if they don't exist
      if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir, { recursive: true });
      }
      if (!fs.existsSync(webDir)) {
        fs.mkdirSync(webDir, { recursive: true });
      }

      // Get all image files
      const files = fs.readdirSync(albumPath).filter(file => {
        return /\.(jpg|jpeg|png|gif)$/i.test(file);
      });

      console.log(`Processing album: ${album} (${files.length} images)`);
      
      manifest[album] = files.sort();

      for (const file of files) {
        const inputPath = path.join(albumPath, file);
        const thumbPath = path.join(thumbDir, file);
        const webPath = path.join(webDir, file);

        try {
          // Generate thumbnail
          await sharp(inputPath)
            .rotate()
            .resize(thumbnailSize, thumbnailSize, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toFile(thumbPath);

          // Generate web-sized image
          await sharp(inputPath)
            .rotate()
            .resize(webSize, webSize, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ quality: 85 })
            .toFile(webPath);

          console.log(`  ✓ Created thumbnail and web image: ${file}`);
        } catch (error) {
          console.error(`  ✗ Error processing ${file}:`, error.message);
        }
      }
    }

    // Write manifest file
    const manifestPath = path.join(__dirname, '..', 'public', 'albums-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`\nCreated albums manifest: ${manifestPath}`);

    console.log('Thumbnail generation complete!');
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    process.exit(1);
  }
}

generateThumbnails();
