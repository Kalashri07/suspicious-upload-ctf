// Unit tests for access validation logic
// Requirements: 7.2, 7.3, 7.4, 7.5, 7.6

import { validateAccess } from '../src/accessValidator';

describe('validateAccess', () => {
  describe('admin access', () => {
    it('should grant access for "admin" parameter', () => {
      const result = validateAccess('admin');
      
      expect(result.authorized).toBe(true);
      expect(result.message).toBe('Welcome Admin');
      expect(result.flag).toBe('TRACECTF{developer_upload_compromised}');
    });
    
    it('should grant access for "ADMIN" (case-insensitive)', () => {
      const result = validateAccess('ADMIN');
      
      expect(result.authorized).toBe(true);
      expect(result.message).toBe('Welcome Admin');
      expect(result.flag).toBe('TRACECTF{developer_upload_compromised}');
    });
    
    it('should grant access for "Admin" (mixed case)', () => {
      const result = validateAccess('Admin');
      
      expect(result.authorized).toBe(true);
      expect(result.flag).toBeDefined();
    });
    
    it('should grant access for " admin " (with whitespace)', () => {
      const result = validateAccess(' admin ');
      
      expect(result.authorized).toBe(true);
      expect(result.flag).toBe('TRACECTF{developer_upload_compromised}');
    });
    
    it('should grant access for "  ADMIN  " (case-insensitive with whitespace)', () => {
      const result = validateAccess('  ADMIN  ');
      
      expect(result.authorized).toBe(true);
      expect(result.flag).toBeDefined();
    });
  });
  
  describe('user access', () => {
    it('should deny access for "user" parameter', () => {
      const result = validateAccess('user');
      
      expect(result.authorized).toBe(false);
      expect(result.message).toBe('Access denied. Admins only.');
      expect(result.flag).toBeUndefined();
    });
    
    it('should deny access for "USER" (case-insensitive)', () => {
      const result = validateAccess('USER');
      
      expect(result.authorized).toBe(false);
      expect(result.message).toBe('Access denied. Admins only.');
      expect(result.flag).toBeUndefined();
    });
    
    it('should deny access for " user " (with whitespace)', () => {
      const result = validateAccess(' user ');
      
      expect(result.authorized).toBe(false);
      expect(result.message).toBe('Access denied. Admins only.');
      expect(result.flag).toBeUndefined();
    });
  });
  
  describe('invalid parameters', () => {
    it('should return invalid message for empty string', () => {
      const result = validateAccess('');
      
      expect(result.authorized).toBe(false);
      expect(result.message).toBe('Invalid access parameter');
      expect(result.flag).toBeUndefined();
    });
    
    it('should return invalid message for whitespace only', () => {
      const result = validateAccess('   ');
      
      expect(result.authorized).toBe(false);
      expect(result.message).toBe('Invalid access parameter');
      expect(result.flag).toBeUndefined();
    });
    
    it('should return invalid message for "guest"', () => {
      const result = validateAccess('guest');
      
      expect(result.authorized).toBe(false);
      expect(result.message).toBe('Invalid access parameter');
      expect(result.flag).toBeUndefined();
    });
    
    it('should return invalid message for "root"', () => {
      const result = validateAccess('root');
      
      expect(result.authorized).toBe(false);
      expect(result.message).toBe('Invalid access parameter');
      expect(result.flag).toBeUndefined();
    });
    
    it('should return invalid message for special characters', () => {
      const result = validateAccess('admin!@#');
      
      expect(result.authorized).toBe(false);
      expect(result.message).toBe('Invalid access parameter');
      expect(result.flag).toBeUndefined();
    });
    
    it('should return invalid message for SQL injection attempt', () => {
      const result = validateAccess("admin' OR '1'='1");
      
      expect(result.authorized).toBe(false);
      expect(result.message).toBe('Invalid access parameter');
      expect(result.flag).toBeUndefined();
    });
  });
  
  describe('flag isolation', () => {
    it('should never include flag when not authorized', () => {
      const testCases = ['user', 'guest', '', 'root', 'administrator', 'adm1n'];
      
      testCases.forEach(param => {
        const result = validateAccess(param);
        expect(result.flag).toBeUndefined();
      });
    });
    
    it('should always include flag when authorized', () => {
      const testCases = ['admin', 'ADMIN', 'Admin', ' admin ', '  ADMIN  '];
      
      testCases.forEach(param => {
        const result = validateAccess(param);
        expect(result.flag).toBe('TRACECTF{developer_upload_compromised}');
      });
    });
  });
});
