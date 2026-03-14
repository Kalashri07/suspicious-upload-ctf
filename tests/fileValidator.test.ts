// Unit tests for file validation logic
// Requirements: 4.2, 4.4, 10.1, 10.2, 10.3

import { isFileAllowed, containsPathTraversal, getAllowedFiles } from '../src/fileValidator';

describe('fileValidator', () => {
  describe('getAllowedFiles', () => {
    it('should return the whitelist of allowed files', () => {
      const allowed = getAllowedFiles();
      
      expect(allowed).toContain('dev_backup.png');
      expect(allowed).toContain('server_logs.zip');
      expect(allowed).toHaveLength(2);
    });
  });
  
  describe('containsPathTraversal', () => {
    it('should detect ../ pattern', () => {
      expect(containsPathTraversal('../etc/passwd')).toBe(true);
      expect(containsPathTraversal('../../secret.txt')).toBe(true);
      expect(containsPathTraversal('file/../other.txt')).toBe(true);
    });
    
    it('should detect ..\\ pattern (Windows)', () => {
      expect(containsPathTraversal('..\\windows\\system32')).toBe(true);
      expect(containsPathTraversal('file..\\other.txt')).toBe(true);
    });
    
    it('should detect URL-encoded path traversal', () => {
      expect(containsPathTraversal('%2e%2e/etc/passwd')).toBe(true);
      expect(containsPathTraversal('%2e%2e%2fetc%2fpasswd')).toBe(true);
    });
    
    it('should detect double URL-encoded path traversal', () => {
      expect(containsPathTraversal('%252e%252e/etc/passwd')).toBe(true);
    });
    
    it('should return false for safe filenames', () => {
      expect(containsPathTraversal('dev_backup.png')).toBe(false);
      expect(containsPathTraversal('server_logs.zip')).toBe(false);
      expect(containsPathTraversal('file.txt')).toBe(false);
      expect(containsPathTraversal('my-file_123.png')).toBe(false);
    });
  });
  
  describe('isFileAllowed', () => {
    describe('whitelisted files', () => {
      it('should allow dev_backup.png', () => {
        expect(isFileAllowed('dev_backup.png')).toBe(true);
      });
      
      it('should allow server_logs.zip', () => {
        expect(isFileAllowed('server_logs.zip')).toBe(true);
      });
    });
    
    describe('non-whitelisted files', () => {
      it('should reject clue.txt (not in whitelist)', () => {
        expect(isFileAllowed('clue.txt')).toBe(false);
      });
      
      it('should reject backup_old.png (fake clue)', () => {
        expect(isFileAllowed('backup_old.png')).toBe(false);
      });
      
      it('should reject test_image.png (fake clue)', () => {
        expect(isFileAllowed('test_image.png')).toBe(false);
      });
      
      it('should reject dev_test.png (fake clue)', () => {
        expect(isFileAllowed('dev_test.png')).toBe(false);
      });
      
      it('should reject arbitrary filenames', () => {
        expect(isFileAllowed('secret.txt')).toBe(false);
        expect(isFileAllowed('admin.php')).toBe(false);
        expect(isFileAllowed('config.json')).toBe(false);
      });
    });
    
    describe('path traversal attempts', () => {
      it('should reject path traversal with ../', () => {
        expect(isFileAllowed('../etc/passwd')).toBe(false);
        expect(isFileAllowed('../../secret.txt')).toBe(false);
        expect(isFileAllowed('../dev_backup.png')).toBe(false);
      });
      
      it('should reject path traversal with ..\\', () => {
        expect(isFileAllowed('..\\windows\\system32')).toBe(false);
        expect(isFileAllowed('..\\dev_backup.png')).toBe(false);
      });
      
      it('should reject URL-encoded path traversal', () => {
        expect(isFileAllowed('%2e%2e/etc/passwd')).toBe(false);
        expect(isFileAllowed('%2e%2e/dev_backup.png')).toBe(false);
      });
      
      it('should reject double URL-encoded path traversal', () => {
        expect(isFileAllowed('%252e%252e/etc/passwd')).toBe(false);
      });
      
      it('should reject path traversal even for whitelisted filenames', () => {
        // Even if the final filename is whitelisted, path traversal should be blocked
        expect(isFileAllowed('../uploads/dev_backup.png')).toBe(false);
        expect(isFileAllowed('../../downloads/server_logs.zip')).toBe(false);
      });
    });
    
    describe('edge cases', () => {
      it('should reject empty string', () => {
        expect(isFileAllowed('')).toBe(false);
      });
      
      it('should reject whitespace only', () => {
        expect(isFileAllowed('   ')).toBe(false);
        expect(isFileAllowed('\t')).toBe(false);
        expect(isFileAllowed('\n')).toBe(false);
      });
      
      it('should reject null bytes', () => {
        expect(isFileAllowed('dev_backup.png\0')).toBe(false);
      });
      
      it('should be case-sensitive', () => {
        // Filenames should be case-sensitive for security
        expect(isFileAllowed('DEV_BACKUP.PNG')).toBe(false);
        expect(isFileAllowed('Dev_Backup.png')).toBe(false);
        expect(isFileAllowed('SERVER_LOGS.ZIP')).toBe(false);
      });
      
      it('should reject filenames with leading/trailing whitespace', () => {
        expect(isFileAllowed(' dev_backup.png')).toBe(false);
        expect(isFileAllowed('dev_backup.png ')).toBe(false);
        expect(isFileAllowed(' server_logs.zip ')).toBe(false);
      });
      
      it('should reject absolute paths', () => {
        expect(isFileAllowed('/etc/passwd')).toBe(false);
        expect(isFileAllowed('/uploads/dev_backup.png')).toBe(false);
        expect(isFileAllowed('C:\\Windows\\System32')).toBe(false);
      });
      
      it('should reject directory traversal with forward slashes', () => {
        expect(isFileAllowed('uploads/dev_backup.png')).toBe(false);
        expect(isFileAllowed('downloads/server_logs.zip')).toBe(false);
      });
    });
    
    describe('security bypass attempts', () => {
      it('should reject various encoding tricks', () => {
        expect(isFileAllowed('dev_backup.png%00')).toBe(false);
        expect(isFileAllowed('dev_backup.png;')).toBe(false);
        expect(isFileAllowed('dev_backup.png|')).toBe(false);
      });
      
      it('should reject command injection attempts', () => {
        expect(isFileAllowed('dev_backup.png; cat /etc/passwd')).toBe(false);
        expect(isFileAllowed('dev_backup.png && ls')).toBe(false);
        expect(isFileAllowed('dev_backup.png | nc')).toBe(false);
      });
      
      it('should reject Unicode normalization attacks', () => {
        // Unicode characters that might normalize to ../
        expect(isFileAllowed('dev\u2024backup.png')).toBe(false);
      });
    });
  });
});
