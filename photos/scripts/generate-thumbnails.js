import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcesDir = path.join(__dirname, '..', 'sources', 'images');
const publicDir = path.join(__dirname, '..', 'public', 'images');
const thumbnailSize = 200;
const webSize = 1920; // Max dimension for web-sized images

async function generateThumbnails() {
  try {
    // Get all album directories from sources
    const albums = fs.readdirSync(sourcesDir).filter(file => {
      return fs.statSync(path.join(sourcesDir, file)).isDirectory();
    });

    const manifest = {};

    for (const album of albums) {
      const sourceAlbumPath = path.join(sourcesDir, album);
      const publicAlbumPath = path.join(publicDir, album);
      const thumbDir = path.join(publicAlbumPath, 'thumbs');
      const webDir = path.join(publicAlbumPath, 'web');

      // Create public album, thumbs and web directories if they don't exist
      if (!fs.existsSync(publicAlbumPath)) {
        fs.mkdirSync(publicAlbumPath, { recursive: true });
      }
      if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir, { recursive: true });
      }
      if (!fs.existsSync(webDir)) {
        fs.mkdirSync(webDir, { recursive: true });
      }

      // Get all image files from source
      const files = fs.readdirSync(sourceAlbumPath).filter(file => {
        return /\.(jpg|jpeg|png|gif)$/i.test(file);
      });

      console.log(`Processing album: ${album} (${files.length} images)`);
      
      manifest[album] = files.sort();

      for (const file of files) {
        const inputPath = path.join(sourceAlbumPath, file);
        const thumbPath = path.join(thumbDir, file);
        const webPath = path.join(webDir, file);

        // Skip if both files already exist
        const thumbExists = fs.existsSync(thumbPath);
        const webExists = fs.existsSync(webPath);
        
        if (thumbExists && webExists) {
          console.log(`  ⊙ Skipped (already exists): ${file}`);
          continue;
        }

        try {
          // Generate thumbnail if it doesn't exist
          if (!thumbExists) {
            await sharp(inputPath)
              .rotate()
              .resize(thumbnailSize, thumbnailSize, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
              })
              .toFile(thumbPath);
          }

          // Generate web-sized image if it doesn't exist
          if (!webExists) {
            await sharp(inputPath)
              .rotate()
              .resize(webSize, webSize, {
                fit: 'inside',
                withoutEnlargement: true
              })
              .jpeg({ quality: 85 })
              .toFile(webPath);
          }

          console.log(`  ✓ Created ${!thumbExists ? 'thumbnail' : ''} ${!thumbExists && !webExists ? 'and' : ''} ${!webExists ? 'web image' : ''}: ${file}`);
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
