// Server startup and initialization script
// Requirements: 3.1, 6.1, 11.5, 13.2

import * as fs from 'fs';
import * as path from 'path';
import { generateLogFiles, createZipArchive } from './index';
import { initializeSteganography } from './steganography';
import { fileCache } from './fileCache';

/**
 * Configuration for server startup
 * Requirements: 11.1, 10.5
 */
export interface ServerConfig {
  port: number;
  challengeFilesDir: string;
  uploadsDir: string;
  clueFilePath: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

/**
 * Default server configuration
 * Requirements: 11.1, 10.5
 */
export const DEFAULT_CONFIG: ServerConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  challengeFilesDir: path.join(process.cwd(), 'challenge_files'),
  uploadsDir: path.join(process.cwd(), 'uploads'),
  clueFilePath: path.join(process.cwd(), 'challenge_files', 'clue.txt'),
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: 100, // 100 requests per window
};

/**
 * Verify that all required directories exist, create them if they don't
 * Requirements: 13.2
 * @param config Server configuration
 * @returns true if all directories exist or were created successfully
 */
export function verifyDirectories(config: ServerConfig): boolean {
  try {
    const directories = [
      config.challengeFilesDir,
      config.uploadsDir,
    ];
    
    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        console.log(`Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    
    return true;
  } catch (error: any) {
    console.error('Error verifying directories:', error.message);
    return false;
  }
}

/**
 * Pre-generate log files on startup
 * Requirements: 3.1, 11.5
 * @param config Server configuration
 * @returns true if log files were generated successfully
 */
export async function generateChallengeLogFiles(config: ServerConfig): Promise<boolean> {
  try {
    console.log('Generating challenge log files...');
    
    // Generate log files
    const logFiles = generateLogFiles();
    
    // Create zip archive
    const zipBuffer = await createZipArchive(logFiles);
    
    // Write zip file to disk
    const zipPath = path.join(config.challengeFilesDir, 'server_logs.zip');
    fs.writeFileSync(zipPath, zipBuffer);
    
    console.log(`✓ Log files generated and archived: ${zipPath}`);
    console.log(`  Size: ${(zipBuffer.length / 1024).toFixed(2)} KB`);
    
    return true;
  } catch (error: any) {
    console.error('✗ Error generating log files:', error.message);
    return false;
  }
}

/**
 * Create clue.txt file if it doesn't exist
 * Requirements: 6.2, 6.3
 * @param config Server configuration
 * @returns true if clue.txt exists or was created successfully
 */
export function createClueFile(config: ServerConfig): boolean {
  try {
    if (fs.existsSync(config.clueFilePath)) {
      console.log('✓ clue.txt already exists');
      return true;
    }
    
    console.log('Creating clue.txt...');
    
    const clueContent = `Admin portal: /admin_portal
Parameter hint: access=user`;
    
    fs.writeFileSync(config.clueFilePath, clueContent, 'utf-8');
    
    console.log(`✓ clue.txt created: ${config.clueFilePath}`);
    
    return true;
  } catch (error: any) {
    console.error('✗ Error creating clue.txt:', error.message);
    return false;
  }
}

/**
 * Embed steganography in image on startup
 * Requirements: 6.1
 * @param config Server configuration
 * @returns true if steganography was embedded successfully
 */
export function embedChallengeStego(config: ServerConfig): boolean {
  try {
    console.log('Embedding steganography in image...');
    
    const success = initializeSteganography(config.uploadsDir, config.clueFilePath);
    
    if (!success) {
      console.error('✗ Failed to embed steganography');
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('✗ Error embedding steganography:', error.message);
    return false;
  }
}

/**
 * Verify that all challenge files exist and are properly generated
 * Requirements: 13.2
 * @param config Server configuration
 * @returns true if all challenge files exist
 */
export function verifyChallengeFiles(config: ServerConfig): boolean {
  try {
    const requiredFiles = [
      path.join(config.challengeFilesDir, 'server_logs.zip'),
      path.join(config.challengeFilesDir, 'clue.txt'),
      path.join(config.uploadsDir, 'dev_backup.png'),
    ];
    
    let allFilesExist = true;
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        console.error(`✗ Required file missing: ${file}`);
        allFilesExist = false;
      } else {
        const stats = fs.statSync(file);
        console.log(`✓ ${path.basename(file)} (${(stats.size / 1024).toFixed(2)} KB)`);
      }
    }
    
    return allFilesExist;
  } catch (error: any) {
    console.error('Error verifying challenge files:', error.message);
    return false;
  }
}

/**
 * Cache challenge files in memory for performance
 * Requirements: 11.2, 11.3, 11.4
 * @param config Server configuration
 * @returns true if files were cached successfully
 */
export function cacheFilesInMemory(config: ServerConfig): boolean {
  try {
    console.log('Caching challenge files in memory...');
    
    // Cache server_logs.zip
    const zipPath = path.join(config.challengeFilesDir, 'server_logs.zip');
    if (!fileCache.cacheFile(zipPath, 'application/zip')) {
      return false;
    }
    
    // Cache dev_backup.png
    const imagePath = path.join(config.uploadsDir, 'dev_backup.png');
    if (!fileCache.cacheFile(imagePath, 'image/png')) {
      return false;
    }
    
    // Display cache statistics
    const stats = fileCache.getStats();
    console.log(`✓ Cached ${stats.count} files (${(stats.totalSize / 1024).toFixed(2)} KB total)`);
    
    return true;
  } catch (error: any) {
    console.error('✗ Error caching files:', error.message);
    return false;
  }
}

/**
 * Invalidate cache and regenerate challenge files
 * Requirements: 11.4 - Cache invalidation strategy
 * This function should be called when challenge files need to be regenerated
 * @param config Server configuration
 * @returns true if regeneration and re-caching was successful
 */
export async function regenerateChallengeFiles(config: ServerConfig = DEFAULT_CONFIG): Promise<boolean> {
  console.log('Regenerating challenge files...');
  
  // Step 1: Invalidate cache
  console.log('[1/4] Invalidating cache...');
  fileCache.invalidateAll();
  console.log();
  
  // Step 2: Regenerate log files
  console.log('[2/4] Regenerating log files...');
  if (!await generateChallengeLogFiles(config)) {
    console.error('✗ Failed to regenerate log files');
    return false;
  }
  console.log();
  
  // Step 3: Setup image (manual steganography embedding)
  console.log('[3/4] Setting up image...');
  if (!embedChallengeStego(config)) {
    console.error('✗ Failed to setup image');
    return false;
  }
  console.log();
  
  // Step 4: Re-cache files
  console.log('[4/4] Re-caching files...');
  if (!cacheFilesInMemory(config)) {
    console.error('✗ Failed to re-cache files');
    return false;
  }
  console.log();
  
  console.log('✓ Challenge files regenerated and cached successfully');
  return true;
}

/**
 * Initialize the challenge server
 * Pre-generates all challenge files and verifies system requirements
 * Requirements: 3.1, 6.1, 11.5, 13.2
 * @param config Server configuration (optional, uses defaults if not provided)
 * @returns true if initialization was successful
 */
export async function initializeServer(config: ServerConfig = DEFAULT_CONFIG): Promise<boolean> {
  console.log('='.repeat(60));
  console.log('The Suspicious Upload CTF Challenge - Server Initialization');
  console.log('='.repeat(60));
  console.log();
  
  // Step 1: Verify all required directories exist
  console.log('[1/5] Verifying required directories...');
  if (!verifyDirectories(config)) {
    console.error('✗ Failed to verify/create directories');
    return false;
  }
  console.log('✓ All directories verified');
  console.log();
  
  // Step 2: Create clue.txt file
  console.log('[2/5] Creating clue.txt file...');
  if (!createClueFile(config)) {
    console.error('✗ Failed to create clue.txt');
    return false;
  }
  console.log();
  
  // Step 3: Pre-generate log files and create zip archive
  console.log('[3/5] Generating log files and zip archive...');
  if (!await generateChallengeLogFiles(config)) {
    console.error('✗ Failed to generate log files');
    return false;
  }
  console.log();
  
  // Step 4: Setup image for steganography (manual embedding required)
  console.log('[4/5] Setting up challenge image...');
  if (!embedChallengeStego(config)) {
    console.error('✗ Failed to setup image');
    return false;
  }
  console.log();
  
  // Step 5: Verify all challenge files exist
  console.log('[5/5] Verifying all challenge files...');
  if (!verifyChallengeFiles(config)) {
    console.error('✗ Some challenge files are missing');
    return false;
  }
  console.log();
  
  // Step 6: Cache files in memory for performance
  console.log('[6/6] Caching files in memory...');
  if (!cacheFilesInMemory(config)) {
    console.error('✗ Failed to cache files in memory');
    return false;
  }
  console.log();
  
  console.log('='.repeat(60));
  console.log('✓ Server initialization complete!');
  console.log('='.repeat(60));
  console.log();
  console.log(`Server will start on port ${config.port}`);
  console.log(`Challenge files directory: ${config.challengeFilesDir}`);
  console.log(`Uploads directory: ${config.uploadsDir}`);
  console.log();
  
  return true;
}
