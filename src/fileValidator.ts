// File access control and validation logic
// Requirements: 4.2, 4.4, 10.1, 10.2, 10.3

/**
 * Whitelist of allowed files that can be accessed
 * Requirements: 10.2
 */
const ALLOWED_FILES = new Set([
  'dev_backup.png',
  'server_logs.zip',
]);

/**
 * Check if a filename contains path traversal characters
 * Requirements: 4.4, 10.1
 * 
 * @param filename The filename to check
 * @returns true if path traversal detected, false otherwise
 */
export function containsPathTraversal(filename: string): boolean {
  // Check for common path traversal patterns
  return filename.includes('../') || 
         filename.includes('..\\') ||
         filename.includes('%2e%2e') || // URL-encoded ..
         filename.includes('%252e%252e'); // Double URL-encoded ..
}

/**
 * Validate if a filename is allowed to be accessed
 * Requirements: 4.2, 10.2, 10.3
 * 
 * Preconditions:
 * - filename is defined (may be empty string)
 * 
 * Postconditions:
 * - Returns true if filename is in whitelist and contains no path traversal
 * - Returns false otherwise
 * - No side effects
 * 
 * @param filename The filename to validate
 * @returns true if file is allowed, false otherwise
 */
export function isFileAllowed(filename: string): boolean {
  // Reject empty filenames
  if (!filename || filename.trim() === '') {
    return false;
  }
  
  // Check for path traversal attempts
  // Requirement: 4.4, 10.1
  if (containsPathTraversal(filename)) {
    return false;
  }
  
  // Check against whitelist
  // Requirements: 4.2, 10.2, 10.3
  return ALLOWED_FILES.has(filename);
}

/**
 * Get the list of allowed files (for testing purposes)
 * @returns Array of allowed filenames
 */
export function getAllowedFiles(): string[] {
  return Array.from(ALLOWED_FILES);
}
