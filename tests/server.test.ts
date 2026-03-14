// Tests for Express server setup and middleware
// Requirements: 10.5, 10.4, 13.3, 13.4

import request from 'supertest';
import { createExpressApp } from '../src/server';
import { Express } from 'express';

describe('Express Server Setup', () => {
  let app: Express;

  beforeEach(() => {
    app = createExpressApp();
  });

  describe('Middleware Configuration', () => {
    test('should parse JSON request bodies', async () => {
      // Add a test route to verify JSON parsing
      app.post('/test-json', (req, res) => {
        res.json({ received: req.body });
      });

      const response = await request(app)
        .post('/test-json')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual({ test: 'data' });
    });

    test('should parse URL-encoded request bodies', async () => {
      // Add a test route to verify URL-encoded parsing
      app.post('/test-urlencoded', (req, res) => {
        res.json({ received: req.body });
      });

      const response = await request(app)
        .post('/test-urlencoded')
        .send('key=value&foo=bar')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual({ key: 'value', foo: 'bar' });
    });

    test('should not expose X-Powered-By header', async () => {
      // Add a test route
      app.get('/test-headers', (_req, res) => {
        res.send('OK');
      });

      const response = await request(app).get('/test-headers');

      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('Rate Limiting', () => {
    test('should apply rate limiting to /admin_portal endpoint', async () => {
      // Make multiple requests to test rate limiting
      // Use valid access parameter to get 200 responses
      const responses = [];
      for (let i = 0; i < 5; i++) {
        const response = await request(app).get('/admin_portal?access=user');
        responses.push(response);
      }

      // All requests should succeed (we're under the limit)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Check that rate limit headers are present
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.headers['ratelimit-limit']).toBeDefined();
      expect(lastResponse.headers['ratelimit-remaining']).toBeDefined();
    });

    test('should not apply rate limiting to other endpoints', async () => {
      // Add a test route for non-admin endpoint
      app.get('/test-no-limit', (_req, res) => {
        res.send('No Limit');
      });

      const response = await request(app).get('/test-no-limit');

      expect(response.status).toBe(200);
      // Rate limit headers should not be present on non-admin routes
      expect(response.headers['ratelimit-limit']).toBeUndefined();
    });
  });

  describe('Directory Listing Prevention', () => {
    test('should not serve directory listings', async () => {
      // Attempt to access a directory path
      const response = await request(app).get('/uploads/');

      // Should return 403 Forbidden for directory listing attempts
      expect(response.status).toBe(403);
    });

    test('should not serve parent directory', async () => {
      // Attempt to access parent directory
      const response = await request(app).get('/../');

      // Should return 200 (redirects to /) or 404
      expect([200, 404]).toContain(response.status);
    });
  });
});

describe('Landing Page Route', () => {
  let app: Express;

  beforeEach(() => {
    app = createExpressApp();
  });

  test('should serve HTML landing page on GET /', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
    expect(response.text).toContain('The Suspicious Upload');
  });

  test('should include challenge instructions', async () => {
    const response = await request(app).get('/');

    expect(response.text).toContain('Challenge Scenario');
    expect(response.text).toContain('Your Objectives');
    expect(response.text).toContain('investigate');
  });

  test('should include download link for server_logs.zip', async () => {
    const response = await request(app).get('/');

    expect(response.text).toContain('/downloads/server_logs.zip');
    expect(response.text).toContain('Download server_logs.zip');
  });

  test('should not include flag in source code', async () => {
    const response = await request(app).get('/');

    // Should not include the actual flag value
    expect(response.text).not.toContain('flag{developer_upload_compromised}');
    // The page mentions "flag{...}" as format example, which is acceptable
  });

  test('should not include solution hints in source code', async () => {
    const response = await request(app).get('/');

    expect(response.text).not.toContain('backup123');
    expect(response.text).not.toContain('access=admin');
    expect(response.text).not.toContain('/admin_portal');
  });
});

describe('Image Page Route', () => {
  let app: Express;

  beforeEach(() => {
    app = createExpressApp();
  });

  test('should serve HTML page with image on GET /uploads/dev_backup.png', async () => {
    const response = await request(app).get('/uploads/dev_backup.png');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
    expect(response.text).toContain('Developer Backup Image');
  });

  test('should include Base64-encoded image in HTML', async () => {
    const response = await request(app).get('/uploads/dev_backup.png');

    expect(response.text).toContain('data:image/png;base64,');
    expect(response.text).toContain('<img');
  });

  test('should include download link for raw image file', async () => {
    const response = await request(app).get('/uploads/dev_backup.png');

    expect(response.text).toContain('/uploads/download/dev_backup.png');
    expect(response.text).toContain('Download Image File');
  });

  test('should include Base64 password hint in HTML comment', async () => {
    const response = await request(app).get('/uploads/dev_backup.png');

    // Check for the Base64-encoded hint in HTML comment
    expect(response.text).toContain('<!-- QmFja3VwIHBhc3N3b3JkOiBiYWNrdXAxMjM= -->');
  });

  test('should not include password in plain text', async () => {
    const response = await request(app).get('/uploads/dev_backup.png');

    expect(response.text).not.toContain('backup123');
    expect(response.text).not.toContain('Backup password:');
  });

  test('should not include password in JavaScript', async () => {
    const response = await request(app).get('/uploads/dev_backup.png');

    // Check that there's no JavaScript with the password
    const hasScript = response.text.includes('<script');
    if (hasScript) {
      const scriptContent = response.text.match(/<script[^>]*>(.*?)<\/script>/gs);
      if (scriptContent) {
        scriptContent.forEach(script => {
          expect(script).not.toContain('backup123');
        });
      }
    }
  });
});

describe('Image Download Route', () => {
  let app: Express;

  beforeEach(() => {
    app = createExpressApp();
  });

  test('should serve raw PNG file on GET /uploads/download/dev_backup.png', async () => {
    const response = await request(app).get('/uploads/download/dev_backup.png');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
  });

  test('should set Content-Disposition header for download', async () => {
    const response = await request(app).get('/uploads/download/dev_backup.png');

    expect(response.headers['content-disposition']).toBe('attachment; filename="dev_backup.png"');
  });

  test('should set Cache-Control header for performance', async () => {
    const response = await request(app).get('/uploads/download/dev_backup.png');

    expect(response.headers['cache-control']).toBe('public, max-age=3600');
  });

  test('should set ETag header for caching', async () => {
    const response = await request(app).get('/uploads/download/dev_backup.png');

    expect(response.headers['etag']).toBeDefined();
    expect(response.headers['etag']).toMatch(/^".*"$/);
  });

  test('should return 304 Not Modified when ETag matches', async () => {
    // First request to get the ETag
    const firstResponse = await request(app).get('/uploads/download/dev_backup.png');
    const etag = firstResponse.headers['etag'];

    // Second request with If-None-Match header
    const secondResponse = await request(app)
      .get('/uploads/download/dev_backup.png')
      .set('If-None-Match', etag);

    expect(secondResponse.status).toBe(304);
  });

  test('should return file content when ETag does not match', async () => {
    const response = await request(app)
      .get('/uploads/download/dev_backup.png')
      .set('If-None-Match', '"different-etag"');

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  test('should return 404 for non-whitelisted files', async () => {
    const response = await request(app).get('/uploads/download/other_file.png');

    expect(response.status).toBe(404);
    expect(response.text).toBe('File not found');
  });

  test('should return 400 for path traversal attempts', async () => {
    // Test with URL-encoded path traversal
    const response = await request(app).get('/uploads/download/..%2Fsecret.txt');

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid file path');
  });

  test('should return 404 for clue.txt (embedded file)', async () => {
    const response = await request(app).get('/uploads/download/clue.txt');

    expect(response.status).toBe(404);
    expect(response.text).toBe('File not found');
  });
});

describe('Directory Listing Prevention', () => {
  let app: Express;

  beforeEach(() => {
    app = createExpressApp();
  });

  test('should return 403 for /uploads/ directory access', async () => {
    const response = await request(app).get('/uploads/');

    expect(response.status).toBe(403);
    expect(response.text).toBe('Forbidden');
  });
});

describe('Log Download Route', () => {
  let app: Express;

  beforeEach(() => {
    app = createExpressApp();
  });

  test('should serve server_logs.zip on GET /downloads/server_logs.zip', async () => {
    const response = await request(app).get('/downloads/server_logs.zip');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/zip');
  });

  test('should set Content-Disposition header for download', async () => {
    const response = await request(app).get('/downloads/server_logs.zip');

    expect(response.headers['content-disposition']).toBe('attachment; filename="server_logs.zip"');
  });

  test('should set Cache-Control header for performance', async () => {
    const response = await request(app).get('/downloads/server_logs.zip');

    expect(response.headers['cache-control']).toBe('public, max-age=3600');
  });

  test('should set ETag header for caching', async () => {
    const response = await request(app).get('/downloads/server_logs.zip');

    expect(response.headers['etag']).toBeDefined();
    expect(response.headers['etag']).toMatch(/^".*"$/);
  });

  test('should return 304 Not Modified when ETag matches', async () => {
    // First request to get the ETag
    const firstResponse = await request(app).get('/downloads/server_logs.zip');
    const etag = firstResponse.headers['etag'];

    // Second request with If-None-Match header
    const secondResponse = await request(app)
      .get('/downloads/server_logs.zip')
      .set('If-None-Match', etag);

    expect(secondResponse.status).toBe(304);
  });

  test('should return file content when ETag does not match', async () => {
    const response = await request(app)
      .get('/downloads/server_logs.zip')
      .set('If-None-Match', '"different-etag"');

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
});


describe('Admin Portal Route', () => {
  let app: Express;

  beforeEach(() => {
    app = createExpressApp();
  });

  test('should return 400 for missing access parameter', async () => {
    const response = await request(app).get('/admin_portal');

    expect(response.status).toBe(400);
    expect(response.text).toBe('Missing access parameter');
  });

  test('should return denial message for access=user', async () => {
    const response = await request(app).get('/admin_portal?access=user');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Access denied. Admins only.');
  });

  test('should return flag for access=admin', async () => {
    const response = await request(app).get('/admin_portal?access=admin');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Welcome Admin');
    expect(response.text).toContain('flag{developer_upload_compromised}');
  });

  test('should return invalid parameter message for other values', async () => {
    const response = await request(app).get('/admin_portal?access=guest');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Invalid access parameter');
  });

  test('should be case-insensitive for access parameter', async () => {
    const responseAdmin = await request(app).get('/admin_portal?access=ADMIN');
    expect(responseAdmin.status).toBe(200);
    expect(responseAdmin.text).toContain('flag{developer_upload_compromised}');

    const responseUser = await request(app).get('/admin_portal?access=USER');
    expect(responseUser.status).toBe(200);
    expect(responseUser.text).toBe('Access denied. Admins only.');
  });

  test('should trim whitespace from access parameter', async () => {
    const response = await request(app).get('/admin_portal?access=%20admin%20');

    expect(response.status).toBe(200);
    expect(response.text).toContain('flag{developer_upload_compromised}');
  });

  test('should log all access attempts', async () => {
    // Capture console.log output
    const consoleSpy = jest.spyOn(console, 'log');

    await request(app).get('/admin_portal?access=user');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[.*\] Admin portal access attempt - IP: .*, access parameter: user/)
    );

    consoleSpy.mockRestore();
  });

  test('should not include flag in response when access is denied', async () => {
    const responseUser = await request(app).get('/admin_portal?access=user');
    expect(responseUser.text).not.toContain('flag{');

    const responseInvalid = await request(app).get('/admin_portal?access=invalid');
    expect(responseInvalid.text).not.toContain('flag{');

    const responseMissing = await request(app).get('/admin_portal');
    expect(responseMissing.text).not.toContain('flag{');
  });
});

describe('Request Logging Middleware', () => {
  let app: Express;

  beforeEach(() => {
    app = createExpressApp();
  });

  test('should log file access attempts to /uploads/', async () => {
    // Capture console.log output
    const consoleSpy = jest.spyOn(console, 'log');

    await request(app).get('/uploads/dev_backup.png');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[.*\] File access attempt - IP: .*, Method: GET, URL: \/uploads\/dev_backup\.png/)
    );

    consoleSpy.mockRestore();
  });

  test('should log file access attempts to /downloads/', async () => {
    // Capture console.log output
    const consoleSpy = jest.spyOn(console, 'log');

    await request(app).get('/downloads/server_logs.zip');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[.*\] File access attempt - IP: .*, Method: GET, URL: \/downloads\/server_logs\.zip/)
    );

    consoleSpy.mockRestore();
  });

  test('should not log access to other routes', async () => {
    // Capture console.log output
    const consoleSpy = jest.spyOn(console, 'log');

    await request(app).get('/');

    // Should not log file access for landing page
    const fileAccessLogs = consoleSpy.mock.calls.filter(call => 
      call[0].includes('File access attempt')
    );
    expect(fileAccessLogs.length).toBe(0);

    consoleSpy.mockRestore();
  });

  test('should include timestamp in log entries', async () => {
    // Capture console.log output
    const consoleSpy = jest.spyOn(console, 'log');

    await request(app).get('/uploads/dev_backup.png');

    // Check that log includes ISO 8601 timestamp
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/)
    );

    consoleSpy.mockRestore();
  });
});

describe('Error Handling Middleware', () => {
  let app: Express;

  beforeEach(() => {
    app = createExpressApp();
  });

  test('should handle errors and return sanitized messages', async () => {
    // Add a test route that throws an error
    app.get('/test-error', (_req, _res, next) => {
      try {
        throw new Error('Internal error with sensitive info: /etc/passwd');
      } catch (err) {
        next(err);
      }
    });

    const response = await request(app).get('/test-error');

    // Should return 500 with sanitized message
    expect(response.status).toBe(500);
    expect(response.text).toBe('Internal server error');
    // Should not leak sensitive information
    expect(response.text).not.toContain('/etc/passwd');
    expect(response.text).not.toContain('Internal error');
  });

  test('should return 404 for ENOENT errors', async () => {
    // Add a test route that throws ENOENT error
    app.get('/test-not-found', (_req, _res, next) => {
      const error: any = new Error('File not found');
      error.code = 'ENOENT';
      next(error);
    });

    const response = await request(app).get('/test-not-found');

    expect(response.status).toBe(404);
    expect(response.text).toBe('File not found');
  });

  test('should return 403 for EACCES errors', async () => {
    // Add a test route that throws EACCES error
    app.get('/test-forbidden', (_req, _res, next) => {
      const error: any = new Error('Access denied');
      error.code = 'EACCES';
      next(error);
    });

    const response = await request(app).get('/test-forbidden');

    expect(response.status).toBe(403);
    expect(response.text).toBe('Forbidden');
  });

  test('should return 400 for invalid input errors', async () => {
    // Add a test route that throws invalid input error
    app.get('/test-invalid', (_req, _res, next) => {
      next(new Error('invalid path provided'));
    });

    const response = await request(app).get('/test-invalid');

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid file path');
  });

  test('should log errors internally with full details', async () => {
    // Capture console.error output
    const consoleSpy = jest.spyOn(console, 'error');

    // Add a test route that throws an error
    app.get('/test-error-log', (_req, _res, next) => {
      next(new Error('Test error message'));
    });

    await request(app).get('/test-error-log');

    // Should log error with timestamp, IP, URL, and error message
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[.*\] Error - IP: .*, URL: \/test-error-log, Error: Test error message/)
    );

    consoleSpy.mockRestore();
  });

  test('should not include stack traces in response', async () => {
    // Add a test route that throws an error with stack trace
    app.get('/test-stack-trace', (_req, _res, next) => {
      const error = new Error('Error with stack trace');
      next(error);
    });

    const response = await request(app).get('/test-stack-trace');

    // Should not include stack trace in response
    expect(response.text).not.toContain('at ');
    expect(response.text).not.toContain('Error:');
    expect(response.text).not.toContain('.ts:');
  });

  test('should not include internal paths in response', async () => {
    // Add a test route that throws an error with internal path
    app.get('/test-internal-path', (_req, _res, next) => {
      next(new Error('Error in /home/user/project/src/server.ts'));
    });

    const response = await request(app).get('/test-internal-path');

    // Should not include internal paths
    expect(response.text).not.toContain('/home/user');
    expect(response.text).not.toContain('server.ts');
    expect(response.text).toBe('Internal server error');
  });

  test('should respect custom status codes from errors', async () => {
    // Add a test route that throws an error with custom status
    app.get('/test-custom-status', (_req, _res, next) => {
      const error: any = new Error('Custom error');
      error.status = 418; // I'm a teapot
      next(error);
    });

    const response = await request(app).get('/test-custom-status');

    expect(response.status).toBe(418);
  });
});
