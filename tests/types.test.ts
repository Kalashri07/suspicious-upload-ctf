// Tests for type definitions and timestamp generation

import { LogEntry, LogFiles, generateTimestamp, BASE64_PASSWORD_HINT, ChallengeFile } from '../src/types';

describe('Type Definitions', () => {
  describe('LogEntry', () => {
    it('should create a valid LogEntry with all fields', () => {
      const entry: LogEntry = {
        timestamp: generateTimestamp(),
        level: 'INFO',
        message: 'Test message',
        source: 'test-source'
      };

      expect(entry.timestamp).toBeDefined();
      expect(entry.level).toBe('INFO');
      expect(entry.message).toBe('Test message');
      expect(entry.source).toBe('test-source');
    });

    it('should create a valid LogEntry without optional source', () => {
      const entry: LogEntry = {
        timestamp: generateTimestamp(),
        level: 'ERROR',
        message: 'Error message'
      };

      expect(entry.timestamp).toBeDefined();
      expect(entry.level).toBe('ERROR');
      expect(entry.message).toBe('Error message');
      expect(entry.source).toBeUndefined();
    });

    it('should support all log levels', () => {
      const levels: Array<'INFO' | 'DEBUG' | 'WARN' | 'ERROR'> = ['INFO', 'DEBUG', 'WARN', 'ERROR'];
      
      levels.forEach(level => {
        const entry: LogEntry = {
          timestamp: generateTimestamp(),
          level,
          message: `Test ${level} message`
        };
        expect(entry.level).toBe(level);
      });
    });
  });

  describe('LogFiles', () => {
    it('should create a valid LogFiles structure', () => {
      const logFiles: LogFiles = {
        'logs.txt': 'Log content',
        'access.log': 'Access log content',
        'errors.log': 'Error log content'
      };

      expect(logFiles['logs.txt']).toBe('Log content');
      expect(logFiles['access.log']).toBe('Access log content');
      expect(logFiles['errors.log']).toBe('Error log content');
    });
  });

  describe('generateTimestamp', () => {
    it('should generate ISO 8601 formatted timestamp', () => {
      const timestamp = generateTimestamp();
      
      // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      expect(timestamp).toMatch(iso8601Regex);
    });

    it('should generate timestamp for specific date', () => {
      const specificDate = new Date('2024-01-15T10:30:00.000Z');
      const timestamp = generateTimestamp(specificDate);
      
      expect(timestamp).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should generate different timestamps for different times', () => {
      const timestamp1 = generateTimestamp(new Date('2024-01-01T00:00:00.000Z'));
      const timestamp2 = generateTimestamp(new Date('2024-01-02T00:00:00.000Z'));
      
      expect(timestamp1).not.toBe(timestamp2);
      expect(timestamp1).toBe('2024-01-01T00:00:00.000Z');
      expect(timestamp2).toBe('2024-01-02T00:00:00.000Z');
    });

    it('should generate valid timestamp when called without arguments', () => {
      const before = new Date();
      const timestamp = generateTimestamp();
      const after = new Date();
      
      const timestampDate = new Date(timestamp);
      expect(timestampDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(timestampDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('BASE64_PASSWORD_HINT', () => {
    it('should be a valid Base64 string', () => {
      // Should not throw when decoding
      expect(() => {
        Buffer.from(BASE64_PASSWORD_HINT, 'base64');
      }).not.toThrow();
    });

    it('should decode to "Backup password: backup123"', () => {
      const decoded = Buffer.from(BASE64_PASSWORD_HINT, 'base64').toString('utf-8');
      expect(decoded).toBe('Backup password: backup123');
    });

    it('should not contain the password in plain text', () => {
      // The constant itself should not contain "backup123" in plain text
      expect(BASE64_PASSWORD_HINT).not.toContain('backup123');
      expect(BASE64_PASSWORD_HINT).not.toContain('password');
    });

    it('should be suitable for use in HTML comments', () => {
      // Should not contain characters that would break HTML comments
      expect(BASE64_PASSWORD_HINT).not.toContain('<!--');
      expect(BASE64_PASSWORD_HINT).not.toContain('-->');
      expect(BASE64_PASSWORD_HINT).not.toContain('<');
      expect(BASE64_PASSWORD_HINT).not.toContain('>');
    });
  });
});

  describe('AccessResult', () => {
    it('should create a valid AccessResult for authorized access', () => {
      const result: import('../src/types').AccessResult = {
        authorized: true,
        message: 'Welcome Admin',
        flag: 'flag{developer_upload_compromised}'
      };

      expect(result.authorized).toBe(true);
      expect(result.message).toBe('Welcome Admin');
      expect(result.flag).toBe('flag{developer_upload_compromised}');
    });

    it('should create a valid AccessResult for denied access', () => {
      const result: import('../src/types').AccessResult = {
        authorized: false,
        message: 'Access denied. Admins only.'
      };

      expect(result.authorized).toBe(false);
      expect(result.message).toBe('Access denied. Admins only.');
      expect(result.flag).toBeUndefined();
    });

    it('should create a valid AccessResult for invalid parameter', () => {
      const result: import('../src/types').AccessResult = {
        authorized: false,
        message: 'Invalid access parameter'
      };

      expect(result.authorized).toBe(false);
      expect(result.message).toBe('Invalid access parameter');
      expect(result.flag).toBeUndefined();
    });
  });

  describe('AdminRequest', () => {
    it('should create a valid AdminRequest with all fields', () => {
      const request: import('../src/types').AdminRequest = {
        path: '/admin_portal',
        queryParams: { access: 'admin' },
        headers: { 'user-agent': 'test-agent' }
      };

      expect(request.path).toBe('/admin_portal');
      expect(request.queryParams.access).toBe('admin');
      expect(request.headers['user-agent']).toBe('test-agent');
    });

    it('should create a valid AdminRequest with user access', () => {
      const request: import('../src/types').AdminRequest = {
        path: '/admin_portal',
        queryParams: { access: 'user' },
        headers: {}
      };

      expect(request.path).toBe('/admin_portal');
      expect(request.queryParams.access).toBe('user');
      expect(Object.keys(request.headers).length).toBe(0);
    });

    it('should support multiple query parameters', () => {
      const request: import('../src/types').AdminRequest = {
        path: '/admin_portal',
        queryParams: { 
          access: 'admin',
          debug: 'true',
          session: 'abc123'
        },
        headers: {}
      };

      expect(request.queryParams.access).toBe('admin');
      expect(request.queryParams.debug).toBe('true');
      expect(request.queryParams.session).toBe('abc123');
    });

    it('should support multiple headers', () => {
      const request: import('../src/types').AdminRequest = {
        path: '/admin_portal',
        queryParams: { access: 'admin' },
        headers: {
          'user-agent': 'Mozilla/5.0',
          'accept': 'text/html',
          'content-type': 'application/json'
        }
      };

      expect(request.headers['user-agent']).toBe('Mozilla/5.0');
      expect(request.headers['accept']).toBe('text/html');
      expect(request.headers['content-type']).toBe('application/json');
    });
  });

  describe('ChallengeFile', () => {
    it('should create a valid ChallengeFile with Buffer content', () => {
      const file: ChallengeFile = {
        filename: 'dev_backup.png',
        path: '/uploads/dev_backup.png',
        content: Buffer.from('fake image data'),
        mimeType: 'image/png',
        isPublic: true
      };

      expect(file.filename).toBe('dev_backup.png');
      expect(file.path).toBe('/uploads/dev_backup.png');
      expect(Buffer.isBuffer(file.content)).toBe(true);
      expect(file.mimeType).toBe('image/png');
      expect(file.isPublic).toBe(true);
    });

    it('should create a valid ChallengeFile with string content', () => {
      const file: ChallengeFile = {
        filename: 'clue.txt',
        path: '/hidden/clue.txt',
        content: 'Admin portal: /admin_portal\nParameter hint: access=user',
        mimeType: 'text/plain',
        isPublic: false
      };

      expect(file.filename).toBe('clue.txt');
      expect(file.path).toBe('/hidden/clue.txt');
      expect(typeof file.content).toBe('string');
      expect(file.mimeType).toBe('text/plain');
      expect(file.isPublic).toBe(false);
    });

    it('should create a ChallengeFile for zip archive', () => {
      const file: ChallengeFile = {
        filename: 'server_logs.zip',
        path: '/downloads/server_logs.zip',
        content: Buffer.from('fake zip data'),
        mimeType: 'application/zip',
        isPublic: true
      };

      expect(file.filename).toBe('server_logs.zip');
      expect(file.path).toBe('/downloads/server_logs.zip');
      expect(file.mimeType).toBe('application/zip');
      expect(file.isPublic).toBe(true);
    });

    it('should support different MIME types', () => {
      const mimeTypes = [
        { filename: 'image.png', mimeType: 'image/png' },
        { filename: 'archive.zip', mimeType: 'application/zip' },
        { filename: 'text.txt', mimeType: 'text/plain' },
        { filename: 'page.html', mimeType: 'text/html' }
      ];

      mimeTypes.forEach(({ filename, mimeType }) => {
        const file: ChallengeFile = {
          filename,
          path: `/${filename}`,
          content: Buffer.from('test'),
          mimeType,
          isPublic: true
        };
        expect(file.mimeType).toBe(mimeType);
      });
    });

    it('should distinguish between public and private files', () => {
      const publicFile: ChallengeFile = {
        filename: 'dev_backup.png',
        path: '/uploads/dev_backup.png',
        content: Buffer.from('image'),
        mimeType: 'image/png',
        isPublic: true
      };

      const privateFile: ChallengeFile = {
        filename: 'clue.txt',
        path: '/hidden/clue.txt',
        content: 'secret clue',
        mimeType: 'text/plain',
        isPublic: false
      };

      expect(publicFile.isPublic).toBe(true);
      expect(privateFile.isPublic).toBe(false);
    });
  });
