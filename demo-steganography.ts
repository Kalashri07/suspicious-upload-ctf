// Demonstration script for steganography functionality
// This script shows how to use the steganography embedding function

import * as path from 'path';
import { initializeSteganography } from './src/steganography';

console.log('=== Steganography Demonstration ===\n');

const uploadsDir = path.join(__dirname, 'uploads');
const clueFilePath = path.join(__dirname, 'challenge_files', 'clue.txt');

console.log('Configuration:');
console.log(`  Uploads directory: ${uploadsDir}`);
console.log(`  Clue file: ${clueFilePath}`);
console.log(`  Output image: ${path.join(uploadsDir, 'dev_backup.png')}`);
console.log(`  Password: backup123`);
console.log();

console.log('Initializing steganography...\n');

const success = initializeSteganography(uploadsDir, clueFilePath);

console.log();
if (success) {
  console.log('✓ SUCCESS: Steganography setup complete!');
  console.log();
  console.log('To extract the hidden clue, run:');
  console.log('  steghide extract -sf uploads/dev_backup.png');
  console.log('  Enter passphrase: backup123');
  console.log();
  console.log('The extracted clue.txt will contain:');
  console.log('  Admin portal: /admin_portal');
  console.log('  Parameter hint: access=user');
} else {
  console.log('✗ FAILED: Steganography setup failed');
  console.log();
  console.log('This is likely because steghide is not installed.');
  console.log('To install steghide:');
  console.log('  - On Ubuntu/Debian: sudo apt-get install steghide');
  console.log('  - On macOS: brew install steghide');
  console.log('  - On Windows: Download from http://steghide.sourceforge.net/');
  console.log();
  console.log('Note: The image file has been created, but the clue has not been embedded.');
}

console.log();
console.log('=== End of Demonstration ===');
