// Type definitions for The Suspicious Upload CTF Challenge

/**
 * Log entry structure with timestamp, level, message, and optional source
 * Requirements: 3.4
 */
export interface LogEntry {
  timestamp: string; // ISO 8601 format
  level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
  message: string;
  source?: string; // Optional source identifier
}

/**
 * Structure for all log files in the challenge
 * Requirements: 2.4, 3.1
 */
export interface LogFiles {
  'logs.txt': string;
  'access.log': string;
  'errors.log': string;
}

/**
 * Generate ISO 8601 timestamp for log entries
 * Requirements: 3.4
 * @param date Optional date object, defaults to current time
 * @returns ISO 8601 formatted timestamp string
 */
export function generateTimestamp(date?: Date): string {
  const d = date || new Date();
  return d.toISOString();
}

/**
 * Base64-encoded password hint for steganography
 * Decodes to: "Backup password: backup123"
 * Requirements: 5.1, 5.2
 */
export const BASE64_PASSWORD_HINT = 'QmFja3VwIHBhc3N3b3JkOiBiYWNrdXAxMjM=';

/**
 * Result of admin portal access validation
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
export interface AccessResult {
  authorized: boolean;
  message: string;
  flag?: string; // Only present when authorized is true
}

/**
 * Admin portal request structure
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
export interface AdminRequest {
  path: string;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
}

/**
 * Challenge file structure for managing file access control
 * Requirements: 4.1, 4.2
 */
export interface ChallengeFile {
  filename: string; // Name of the file (e.g., "dev_backup.png")
  path: string; // Full path to the file
  content: Buffer | string; // File content as Buffer or string
  mimeType: string; // MIME type for HTTP response (e.g., "image/png")
  isPublic: boolean; // Whether the file can be directly accessed
}
