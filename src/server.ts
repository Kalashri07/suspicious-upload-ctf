// Express server setup with middleware
// Requirements: 10.5, 10.4, 13.3, 13.4

import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import { BASE64_PASSWORD_HINT } from './types';
import * as path from 'path';
import * as fs from 'fs';
import { fileCache } from './fileCache';

/**
 * Create and configure Express application with all necessary middleware
 * Requirements: 10.5, 10.4, 13.3, 13.4
 * @returns Configured Express application
 */
export function createExpressApp(): Express {
  const app = express();

  // Disable Express's default error handler in favor of our custom one
  // This prevents stack traces from being shown in responses
  app.set('env', 'production');

  // Configure body-parser middleware (built into Express 4.16+)
  // Requirement 13.3: Use Express.js version 4.18 or higher
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Configure rate limiting for admin portal
  // Requirement 10.5: Implement rate limiting on the admin portal endpoint
  // Requirement 13.4: Use express-rate-limit version 6.7 or higher
  const adminRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  // Apply rate limiting to admin portal endpoint
  app.use('/admin_portal', adminRateLimiter);

  // Disable directory listing
  // Requirement 10.4: Disable directory listing for all directories
  // Requirement 13.3: Disable directory listing
  app.disable('x-powered-by'); // Hide Express signature for security
  
  // Prevent directory listing by not using express.static with directory indexes
  // This is handled by explicitly defining routes for specific files only

  // Request logging middleware for file access attempts
  // Requirement 10.6: Log file access attempts
  app.use((req, _res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const method = req.method;
    const url = req.url;
    
    // Log file access attempts
    if (url.startsWith('/uploads/') || url.startsWith('/downloads/')) {
      console.log(`[${timestamp}] File access attempt - IP: ${ip}, Method: ${method}, URL: ${url}`);
    }
    
    next();
  });

  // Favicon route to prevent 404 errors
  app.get('/favicon.ico', (_req, res) => {
    res.status(204).end(); // No content
  });

  // Landing page route
  // Requirements: 1.1, 1.2, 1.3, 1.4, 5.1
  app.get('/', (_req, res) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Suspicious Upload</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      background-color: #0a0a0a;
      color: #00ff00;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    h1 {
      color: #00ff00;
      font-size: 3em;
      margin-bottom: 40px;
    }
    .download-link {
      display: inline-block;
      background-color: #003300;
      padding: 15px 30px;
      border: 2px solid #00ff00;
      border-radius: 5px;
      color: #00ffff;
      text-decoration: none;
      font-weight: bold;
      font-size: 1.2em;
    }
    .download-link:hover {
      background-color: #004400;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>🔒 The Suspicious Upload</h1>
  <a href="/downloads/server_logs.zip" class="download-link">⬇️ Download server_logs.zip</a>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  // Log download route
  // Requirements: 2.1, 11.2, 11.3
  app.get('/downloads/server_logs.zip', (_req, res) => {
    const filename = 'server_logs.zip';
    
    // Try to serve from cache first (Requirement 11.2)
    const cached = fileCache.getFile(filename);
    if (cached) {
      // Set appropriate headers for download
      res.setHeader('Content-Type', cached.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Implement caching for performance (Requirement 11.2, 11.3)
      // Cache for 1 hour (3600 seconds)
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('ETag', cached.etag);
      
      // Check if client has cached version
      const clientETag = _req.headers['if-none-match'];
      if (clientETag && clientETag === cached.etag) {
        res.status(304).end();
        return;
      }
      
      // Send cached file
      res.send(cached.buffer);
      return;
    }
    
    // Fallback to disk if not cached
    const zipPath = path.join(process.cwd(), 'challenge_files', 'server_logs.zip');
    
    // Check if file exists
    if (!fs.existsSync(zipPath)) {
      res.status(404).send('File not found');
      return;
    }

    // Set appropriate headers for download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="server_logs.zip"');
    
    // Implement caching for performance (Requirement 11.2, 11.3)
    // Cache for 1 hour (3600 seconds)
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('ETag', `"${fs.statSync(zipPath).mtime.getTime()}"`);
    
    // Check if client has cached version
    const clientETag = _req.headers['if-none-match'];
    if (clientETag && clientETag === res.getHeader('ETag')) {
      res.status(304).end();
      return;
    }
    
    // Send the file
    res.sendFile(zipPath);
  });

  // Image page route with Base64 hint in HTML comment
  // Requirements: 5.1, 5.2, 5.3, 5.4
  // This route serves an HTML page with the image embedded and Base64 hint in comment
  // Participants find this URL in the logs
  app.get('/uploads/dev_backup.png', (_req, res) => {
    const filename = 'dev_backup.png';
    
    // Try to get from cache first (Requirement 11.2)
    let imageBuffer: Buffer;
    const cached = fileCache.getFile(filename);
    
    if (cached) {
      imageBuffer = cached.buffer;
    } else {
      // Fallback to disk if not cached
      const imagePath = path.join(process.cwd(), 'uploads', filename);
      
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        res.status(404).send('File not found');
        return;
      }
      
      // Read the image file
      imageBuffer = fs.readFileSync(imagePath);
    }
    
    const base64Image = imageBuffer.toString('base64');
    
    // Serve HTML page with embedded image and Base64 hint in comment
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Developer Backup Image</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f0f0;
      padding: 20px;
      text-align: center;
    }
    img {
      max-width: 100%;
      height: auto;
      border: 2px solid #333;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
    }
    .download-link {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    }
    .download-link:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <h1>Developer Backup Image</h1>
  <p>Image uploaded by developer on ${new Date().toISOString().split('T')[0]}</p>
  <img src="data:image/png;base64,${base64Image}" alt="Developer Backup">
  <br>
  <a href="/uploads/download/dev_backup.png" class="download-link" download>Download Image File</a>
  <!-- ${BASE64_PASSWORD_HINT} -->
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  // Image file download route (GET /uploads/download/:filename)
  // Requirements: 4.1, 4.2, 4.3, 11.2, 11.3
  // This route serves the raw PNG file for steganography extraction
  app.get('/uploads/download/:filename', (req, res) => {
    const filename = req.params.filename;
    
    // Import file validator
    const { isFileAllowed, containsPathTraversal } = require('./fileValidator');
    
    // Validate filename against whitelist
    // Requirement 4.2: Return 404 for non-whitelisted files
    // Requirement 4.4: Reject path traversal attempts
    if (!isFileAllowed(filename)) {
      if (containsPathTraversal(filename)) {
        // Requirement 10.1: Validate all file path inputs
        res.status(400).send('Invalid file path');
        return;
      }
      res.status(404).send('File not found');
      return;
    }
    
    // Try to serve from cache first (Requirement 11.2)
    const cached = fileCache.getFile(filename);
    if (cached) {
      // Set appropriate headers for image download
      res.setHeader('Content-Type', cached.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Implement caching for performance
      // Requirements: 11.2, 11.3
      // Cache for 1 hour (3600 seconds)
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('ETag', cached.etag);
      
      // Check if client has cached version
      const clientETag = req.headers['if-none-match'];
      if (clientETag && clientETag === cached.etag) {
        res.status(304).end();
        return;
      }
      
      // Send cached file
      res.send(cached.buffer);
      return;
    }
    
    // Fallback to disk if not cached
    // Serve dev_backup.png when requested
    // Requirement 4.1: Serve the PNG image file
    const imagePath = path.join(process.cwd(), 'uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      res.status(404).send('File not found');
      return;
    }
    
    // Set appropriate headers for image download
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Implement caching for performance
    // Requirements: 11.2, 11.3
    // Cache for 1 hour (3600 seconds)
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('ETag', `"${fs.statSync(imagePath).mtime.getTime()}"`);
    
    // Check if client has cached version
    const clientETag = req.headers['if-none-match'];
    if (clientETag && clientETag === res.getHeader('ETag')) {
      res.status(304).end();
      return;
    }
    
    // Send the file
    res.sendFile(imagePath);
  });

  // Prevent directory listing for /uploads
  // Requirement 4.3: Prevent directory listing
  app.get('/uploads/', (_req, res) => {
    res.status(403).send('Forbidden');
  });

  // Admin portal route
  // Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.6, 10.6
  app.get('/admin_portal', (req, res) => {
    const accessParam = req.query.access as string | undefined;
    
    // Log all access attempts
    // Requirement 10.6: Log all admin portal access attempts
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    console.log(`[${timestamp}] Admin portal access attempt - IP: ${ip}, access parameter: ${accessParam || 'missing'}`);
    
    // Check if access parameter is missing
    // Requirement 7.1: Return 400 for missing parameter
    if (!accessParam) {
      res.status(400).send('Missing access parameter');
      return;
    }
    
    // Import and call validateAccess function
    const { validateAccess } = require('./accessValidator');
    const result = validateAccess(accessParam);
    
    // Return flag when authorized
    // Requirements: 7.3, 8.1, 8.6
    if (result.authorized) {
      res.send(`${result.message}\n${result.flag}`);
      return;
    }
    
    // Return denial message when not authorized
    // Requirements: 7.2, 7.4
    res.send(result.message);
  });

  // Global error handling middleware
  // Requirements: 10.7, 12.1, 12.2, 12.3, 12.5
  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    // Log error internally (with full details for debugging)
    console.error(`[${timestamp}] Error - IP: ${ip}, URL: ${req.url}, Error: ${err.message}`);
    
    // Don't send response if headers already sent
    if (res.headersSent) {
      return;
    }
    
    // Sanitize error messages to prevent information leakage
    // Requirement 10.7: Sanitize error messages
    // Requirement 12.5: Do not include stack traces or internal paths
    let statusCode = 500;
    let sanitizedMessage = 'Internal server error';
    
    // Determine appropriate status code and sanitized message
    if (err.status) {
      statusCode = err.status;
    }
    
    // Map common error types to appropriate responses
    // Requirement 12.1: Return 404 for non-existent files
    if (err.code === 'ENOENT' || err.message.includes('not found')) {
      statusCode = 404;
      sanitizedMessage = 'File not found';
    }
    // Requirement 12.2: Return 403 for forbidden access
    else if (err.code === 'EACCES' || err.message.includes('forbidden')) {
      statusCode = 403;
      sanitizedMessage = 'Forbidden';
    }
    // Requirement 12.3: Return 400 for invalid input
    else if (err.message.includes('invalid') || err.message.includes('bad request')) {
      statusCode = 400;
      sanitizedMessage = 'Invalid file path';
    }
    
    // Set content type to plain text to prevent HTML wrapping
    res.setHeader('Content-Type', 'text/plain');
    
    // Return appropriate HTTP status code with sanitized message
    res.status(statusCode).send(sanitizedMessage);
  });

  return app;
}
