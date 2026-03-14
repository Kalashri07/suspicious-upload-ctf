// The Suspicious Upload CTF Challenge
// Main entry point

import archiver from 'archiver';
import { Readable } from 'stream';
import { LogEntry, LogFiles, generateTimestamp } from './types';

console.log('The Suspicious Upload CTF Challenge - Server starting...');

/**
 * Generate a realistic log entry with random message and log level
 * Requirements: 3.1, 3.5, 3.6
 * @param baseTime Base timestamp for chronological ordering
 * @param offsetMs Millisecond offset from base time
 * @returns A realistic LogEntry object
 */
export function generateRealisticLogEntry(baseTime: Date, offsetMs: number): LogEntry {
  const timestamp = generateTimestamp(new Date(baseTime.getTime() + offsetMs));
  
  // Realistic log messages for a web server
  const logMessages = [
    { level: 'INFO' as const, message: 'Server started successfully on port 3000' },
    { level: 'INFO' as const, message: 'Database connection established' },
    { level: 'INFO' as const, message: 'User authentication successful' },
    { level: 'INFO' as const, message: 'Request processed successfully' },
    { level: 'INFO' as const, message: 'Cache cleared successfully' },
    { level: 'INFO' as const, message: 'Session created for user' },
    { level: 'INFO' as const, message: 'File upload completed' },
    { level: 'INFO' as const, message: 'Configuration loaded' },
    { level: 'DEBUG' as const, message: 'Processing incoming request' },
    { level: 'DEBUG' as const, message: 'Validating user credentials' },
    { level: 'DEBUG' as const, message: 'Checking file permissions' },
    { level: 'DEBUG' as const, message: 'Loading configuration from disk' },
    { level: 'DEBUG' as const, message: 'Initializing middleware' },
    { level: 'DEBUG' as const, message: 'Parsing request body' },
    { level: 'DEBUG' as const, message: 'Executing database query' },
    { level: 'DEBUG' as const, message: 'Rendering template' },
    { level: 'WARN' as const, message: 'Slow query detected (>500ms)' },
    { level: 'WARN' as const, message: 'High memory usage detected' },
    { level: 'WARN' as const, message: 'Deprecated API endpoint accessed' },
    { level: 'WARN' as const, message: 'Rate limit approaching threshold' },
    { level: 'WARN' as const, message: 'Invalid session token provided' },
    { level: 'WARN' as const, message: 'File size exceeds recommended limit' },
    { level: 'ERROR' as const, message: 'Failed to connect to database' },
    { level: 'ERROR' as const, message: 'Authentication failed for user' },
    { level: 'ERROR' as const, message: 'File not found' },
    { level: 'ERROR' as const, message: 'Permission denied' },
    { level: 'ERROR' as const, message: 'Invalid request format' },
    { level: 'ERROR' as const, message: 'Timeout waiting for response' },
  ];
  
  // Select a random log message
  const randomIndex = Math.floor(Math.random() * logMessages.length);
  const { level, message } = logMessages[randomIndex];
  
  return {
    timestamp,
    level,
    message,
  };
}

/**
 * Format a log entry as a string for writing to log files
 * @param entry LogEntry object
 * @returns Formatted log string
 */
function formatLogEntry(entry: LogEntry): string {
  return `${entry.timestamp} [${entry.level}] ${entry.message}`;
}

/**
 * Generate logs.txt with correct clue at line 47 and fake clues
 * Requirements: 3.1, 3.2, 3.3
 * @param baseTime Base timestamp for log generation
 * @returns Array of log lines (100+ lines)
 */
function generateMainLog(baseTime: Date): string[] {
  const lines: string[] = [];
  const correctClue = '[DEBUG] Backup image stored in /uploads/dev_backup.png';
  const fakeClues = [
    '[DEBUG] Old backup found at /uploads/backup_old.jpg',
    '[DEBUG] Test image uploaded to /uploads/test_image.png',
    '[DEBUG] Development file saved: /uploads/dev_test.png',
  ];
  
  // Generate 100+ lines
  for (let i = 0; i < 105; i++) {
    const lineNumber = i + 1;
    
    if (lineNumber === 47) {
      // Insert correct clue at line 47
      const timestamp = generateTimestamp(new Date(baseTime.getTime() + i * 1000));
      lines.push(`${timestamp} ${correctClue}`);
    } else if (lineNumber === 23) {
      // Insert fake clue at line 23
      const timestamp = generateTimestamp(new Date(baseTime.getTime() + i * 1000));
      lines.push(`${timestamp} ${fakeClues[0]}`);
    } else if (lineNumber === 56) {
      // Insert fake clue at line 56
      const timestamp = generateTimestamp(new Date(baseTime.getTime() + i * 1000));
      lines.push(`${timestamp} ${fakeClues[1]}`);
    } else if (lineNumber === 78) {
      // Insert fake clue at line 78
      const timestamp = generateTimestamp(new Date(baseTime.getTime() + i * 1000));
      lines.push(`${timestamp} ${fakeClues[2]}`);
    } else {
      // Generate realistic log entry
      const entry = generateRealisticLogEntry(baseTime, i * 1000);
      lines.push(formatLogEntry(entry));
    }
  }
  
  return lines;
}

/**
 * Generate access.log with realistic HTTP access log entries
 * Requirements: 3.1
 * @param baseTime Base timestamp for log generation
 * @returns Array of log lines (100+ lines)
 */
function generateAccessLog(baseTime: Date): string[] {
  const lines: string[] = [];
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const paths = [
    '/',
    '/api/users',
    '/api/auth/login',
    '/api/files',
    '/uploads',
    '/admin',
    '/static/css/style.css',
    '/static/js/app.js',
    '/favicon.ico',
  ];
  const statusCodes = [200, 200, 200, 201, 304, 400, 401, 403, 404, 500];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  ];
  
  // Generate 100+ lines
  for (let i = 0; i < 110; i++) {
    const timestamp = generateTimestamp(new Date(baseTime.getTime() + i * 1000));
    const method = methods[Math.floor(Math.random() * methods.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const status = statusCodes[Math.floor(Math.random() * statusCodes.length)];
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    const ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const size = Math.floor(Math.random() * 50000) + 100;
    
    lines.push(`${ip} - - [${timestamp}] "${method} ${path} HTTP/1.1" ${status} ${size} "-" "${userAgent}"`);
  }
  
  return lines;
}

/**
 * Generate errors.log with realistic error log entries
 * Requirements: 3.1
 * @param baseTime Base timestamp for log generation
 * @returns Array of log lines (100+ lines)
 */
function generateErrorLog(baseTime: Date): string[] {
  const lines: string[] = [];
  const errorMessages = [
    'Connection timeout to database server',
    'Failed to load configuration file',
    'Invalid authentication token provided',
    'File not found: /var/www/uploads/missing.jpg',
    'Permission denied accessing /etc/config',
    'Memory allocation failed',
    'Disk space low on /var partition',
    'Network unreachable: 10.0.0.1',
    'SSL certificate validation failed',
    'Rate limit exceeded for IP',
    'Invalid JSON in request body',
    'Database query timeout after 30s',
    'Failed to write to log file',
    'Service unavailable: upstream server down',
    'Malformed request header',
  ];
  
  // Generate 100+ lines
  for (let i = 0; i < 108; i++) {
    const timestamp = generateTimestamp(new Date(baseTime.getTime() + i * 1000));
    const message = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    const level = Math.random() > 0.5 ? 'ERROR' : 'WARN';
    
    lines.push(`${timestamp} [${level}] ${message}`);
  }
  
  return lines;
}

/**
 * Generate all log files with clues embedded
 * Requirements: 3.1, 3.2, 3.3
 * @returns LogFiles object containing all three log files
 */
export function generateLogFiles(): LogFiles {
  const baseTime = new Date('2024-01-15T08:00:00.000Z');
  
  const mainLogLines = generateMainLog(baseTime);
  const accessLogLines = generateAccessLog(baseTime);
  const errorLogLines = generateErrorLog(baseTime);
  
  return {
    'logs.txt': mainLogLines.join('\n'),
    'access.log': accessLogLines.join('\n'),
    'errors.log': errorLogLines.join('\n'),
  };
}

/**
 * Create a zip archive containing log files in a server_logs/ directory
 * Requirements: 2.2, 2.3
 * @param logFiles LogFiles object containing all log file contents
 * @returns Promise<Buffer> containing the zip archive data
 */
export async function createZipArchive(logFiles: LogFiles): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression to keep size under 1MB
    });
    
    const chunks: Buffer[] = [];
    
    // Collect data chunks
    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    // Handle completion
    archive.on('end', () => {
      const buffer = Buffer.concat(chunks);
      
      // Verify size is under 1MB (Requirement 2.3)
      const sizeInMB = buffer.length / (1024 * 1024);
      if (sizeInMB >= 1) {
        reject(new Error(`Zip file size (${sizeInMB.toFixed(2)}MB) exceeds 1MB limit`));
        return;
      }
      
      resolve(buffer);
    });
    
    // Handle errors
    archive.on('error', (err: Error) => {
      reject(err);
    });
    
    // Add each log file to the archive in a server_logs/ directory
    for (const [filename, content] of Object.entries(logFiles)) {
      const stream = Readable.from([content]);
      archive.append(stream, { name: `server_logs/${filename}` });
    }
    
    // Finalize the archive
    archive.finalize();
  });
}

// Export steganography functions for use in server initialization
export { initializeSteganography } from './steganography';

// Export access validation function for admin portal
export { validateAccess } from './accessValidator';

// Export file validation functions for file access control
export { isFileAllowed, containsPathTraversal, getAllowedFiles } from './fileValidator';

// Export Express server creation function
export { createExpressApp } from './server';

// Export startup functions
export { initializeServer, DEFAULT_CONFIG, ServerConfig } from './startup';

/**
 * Main entry point - start the server
 * This is executed when running: npm start
 */
async function main() {
  // Import startup functions
  const { initializeServer, DEFAULT_CONFIG } = require('./startup');
  const { createExpressApp } = require('./server');
  
  // Initialize server (pre-generate files, embed steganography, etc.)
  const initialized = await initializeServer(DEFAULT_CONFIG);
  
  if (!initialized) {
    console.error('Server initialization failed. Exiting...');
    process.exit(1);
  }
  
  // Create Express app
  const app = createExpressApp();
  
  // Start listening
  const port = DEFAULT_CONFIG.port;
  app.listen(port, () => {
    console.log('='.repeat(60));
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log('='.repeat(60));
    console.log();
    console.log('Challenge is ready! Participants can access:');
    console.log(`  Landing page: http://localhost:${port}/`);
    console.log(`  Download logs: http://localhost:${port}/downloads/server_logs.zip`);
    console.log();
    console.log('Press Ctrl+C to stop the server');
    console.log();
  });
}

// Only run main if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
