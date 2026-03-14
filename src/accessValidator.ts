// Access validation logic for admin portal
// Requirements: 7.2, 7.3, 7.4, 7.5, 7.6

import { AccessResult } from './types';

/**
 * The flag that is returned when access is granted
 * Requirements: 8.1
 */
const FLAG = 'TRACECTF{developer_upload_compromised}';

/**
 * Validate access parameter and determine authorization
 * Requirements: 7.2, 7.3, 7.4, 7.5, 7.6
 * 
 * Preconditions:
 * - accessParam is defined (may be empty string)
 * 
 * Postconditions:
 * - Returns AccessResult with valid structure
 * - result.authorized === true ⟺ accessParam === "admin" (case-insensitive, trimmed)
 * - result.flag is defined ⟺ result.authorized === true
 * - No exceptions thrown for any input value
 * 
 * @param accessParam The access parameter value from query string
 * @returns AccessResult indicating authorization status and message
 */
export function validateAccess(accessParam: string): AccessResult {
  // Normalize input: trim whitespace and convert to lowercase
  // Requirements: 7.5, 7.6
  const normalizedParam = accessParam.trim().toLowerCase();
  
  // Check for admin access
  // Requirement: 7.3
  if (normalizedParam === 'admin') {
    return {
      authorized: true,
      message: 'Welcome Admin',
      flag: FLAG,
    };
  }
  
  // Check for user access (denied)
  // Requirement: 7.2
  if (normalizedParam === 'user') {
    return {
      authorized: false,
      message: 'Access denied. Admins only.',
    };
  }
  
  // Invalid parameter value
  // Requirement: 7.4
  return {
    authorized: false,
    message: 'Invalid access parameter',
  };
}
