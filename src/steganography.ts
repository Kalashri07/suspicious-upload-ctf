// Steganography handling for The Suspicious Upload CTF Challenge
// Requirements: 6.1, 6.6
// Note: Simplified version - participants use online tools to decode

import * as fs from 'fs';
import * as path from 'path';

/**
 * Create a simple PNG image for steganography embedding
 * This creates a minimal valid PNG file (100x100 pixel red image)
 * Requirements: 6.6
 * @param outputPath Path where the PNG file should be created
 */
export function createBasePngImage(outputPath: string): void {
  // Minimal PNG file (1x1 red pixel)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
    0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
    0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00,
    0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
    0xAE, 0x42, 0x60, 0x82
  ]);
  
  fs.writeFileSync(outputPath, pngData);
}

/**
 * Embed a text file into a PNG image using steganography
 * Requirements: 6.1, 6.6
 * NOTE: This function is deprecated - participants use online tools instead
 * @param imagePath Path to the PNG image file
 * @param payloadPath Path to the text file to embed
 * @param password Password for steganography protection
 * @returns true if embedding was successful, false otherwise
 */
export function embedSteganography(
  imagePath: string,
  payloadPath: string,
  password: string
): boolean {
  console.log('Note: Steganography embedding skipped - use online tools to embed manually');
  console.log(`  Image: ${imagePath}`);
  console.log(`  Payload: ${payloadPath}`);
  console.log(`  Suggested password: ${password}`);
  return true;
}

/**
 * Extract hidden data from a steganographic image
 * Requirements: 6.1, 6.4, 6.5
 * NOTE: This function is deprecated - participants use online tools instead
 * @param _imagePath Path to the PNG image with embedded data
 * @param _password Password for extraction
 * @param _outputPath Optional output path for extracted file
 * @returns Extracted content as string, or null if extraction fails
 */
export function extractSteganography(
  _imagePath: string,
  _password: string,
  _outputPath?: string
): string | null {
  console.log('Note: Extraction skipped - participants use online steganography tools');
  console.log(`  Suggested tools: https://stylesuxx.github.io/steganography/, https://futureboy.us/stegano/decinput.html`);
  return null;
}

/**
 * Initialize steganography for the challenge
 * Simplified version - just ensures the image exists
 * Participants will use online steganography tools to decode
 * Requirements: 6.1, 6.6
 * @param uploadsDir Directory where the image should be located
 * @param _clueFilePath Path to the clue.txt file (for reference)
 * @returns true if initialization was successful
 */
export function initializeSteganography(
  uploadsDir: string,
  _clueFilePath: string
): boolean {
  const imagePath = path.join(uploadsDir, 'dev_backup.png');
  
  try {
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Check if image exists (user must provide it manually)
    if (fs.existsSync(imagePath)) {
      console.log('✓ Using existing dev_backup.png');
      console.log('  (Image found - participants will decode using online tools)');
      console.log('  Expected clue: Admin portal info');
      return true;
    } else {
      // Image doesn't exist - user must add it manually
      console.log('✗ dev_backup.png not found!');
      console.log('  Please add your image file as: uploads/dev_backup.png');
      console.log('  Then embed steganography using online tools');
      console.log('  Clue to embed: Admin portal: /admin_portal, Parameter hint: access=user');
      return false;
    }
  } catch (error: any) {
    console.error('Error initializing steganography:', error.message);
    return false;
  }
}
