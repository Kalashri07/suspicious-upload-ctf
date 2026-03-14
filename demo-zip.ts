// Demo script to test the zip archive generator
import { generateLogFiles, createZipArchive } from './src/index';
import * as fs from 'fs';
import * as path from 'path';

async function demo() {
  console.log('Generating log files...');
  const logFiles = generateLogFiles();
  
  console.log('\nLog file sizes:');
  console.log(`  logs.txt: ${(logFiles['logs.txt'].length / 1024).toFixed(2)} KB`);
  console.log(`  access.log: ${(logFiles['access.log'].length / 1024).toFixed(2)} KB`);
  console.log(`  errors.log: ${(logFiles['errors.log'].length / 1024).toFixed(2)} KB`);
  
  const totalSize = logFiles['logs.txt'].length + 
                    logFiles['access.log'].length + 
                    logFiles['errors.log'].length;
  console.log(`  Total uncompressed: ${(totalSize / 1024).toFixed(2)} KB`);
  
  console.log('\nCreating zip archive...');
  const zipBuffer = await createZipArchive(logFiles);
  
  console.log(`\nZip archive created successfully!`);
  console.log(`  Compressed size: ${(zipBuffer.length / 1024).toFixed(2)} KB`);
  console.log(`  Compression ratio: ${((zipBuffer.length / totalSize) * 100).toFixed(1)}%`);
  console.log(`  Size check: ${zipBuffer.length < 1024 * 1024 ? '✓ Under 1MB' : '✗ Exceeds 1MB'}`);
  
  // Optionally save to disk
  const outputPath = path.join(__dirname, 'challenge_files', 'server_logs.zip');
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, zipBuffer);
  console.log(`\nZip file saved to: ${outputPath}`);
}

demo().catch(console.error);
