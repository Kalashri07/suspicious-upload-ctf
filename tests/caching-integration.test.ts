// Integration tests for file caching in server routes
// Requirements: 11.2, 11.3, 11.4

import request from 'supertest';
import { createExpressApp } from '../src/server';
import { fileCache } from '../src/fileCache';
import * as fs from 'fs';
import * as path from 'path';

describe('File Caching Integration', () => {
  let app: any;
  
  beforeAll(() => {
    // Ensure test files exist
    const challengeFilesDir = path.join(process.cwd(), 'challenge_files');
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    if (!fs.existsSync(challengeFilesDir)) {
      fs.mkdirSync(challengeFilesDir, { recursive: true });
    }
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Create test files if they don't exist
    const zipPath = path.join(challengeFilesDir, 'server_logs.zip');
    if (!fs.existsSync(zipPath)) {
      fs.writeFileSync(zipPath, Buffer.from('test zip content'));
    }
    
    const imagePath = path.join(uploadsDir, 'dev_backup.png');
    if (!fs.existsSync(imagePath)) {
      // Create a minimal PNG file (1x1 transparent pixel)
      const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
      ]);
      fs.writeFileSync(imagePath, pngData);
    }
    
    // Cache the files
    fileCache.cacheFile(zipPath, 'application/zip');
    fileCache.cacheFile(imagePath, 'image/png');
    
    app = createExpressApp();
  });
  
  afterAll(() => {
    // Clean up cache
    fileCache.invalidateAll();
  });
  
  describe('Cached file serving', () => {
    test('should serve server_logs.zip from cache', async () => {
      // Verify file is cached
      expect(fileCache.isCached('server_logs.zip')).toBe(true);
      
      const response = await request(app)
        .get('/downloads/server_logs.zip')
        .expect(200);
      
      expect(response.headers['content-type']).toBe('application/zip');
      expect(response.headers['cache-control']).toContain('public');
      expect(response.headers['etag']).toBeDefined();
    });
    
    test('should serve dev_backup.png from cache for download', async () => {
      // Verify file is cached
      expect(fileCache.isCached('dev_backup.png')).toBe(true);
      
      const response = await request(app)
        .get('/uploads/download/dev_backup.png')
        .expect(200);
      
      expect(response.headers['content-type']).toBe('image/png');
      expect(response.headers['cache-control']).toContain('public');
      expect(response.headers['etag']).toBeDefined();
    });
    
    test('should handle ETag-based caching for cached files', async () => {
      const cached = fileCache.getFile('server_logs.zip');
      expect(cached).toBeDefined();
      
      const response = await request(app)
        .get('/downloads/server_logs.zip')
        .set('If-None-Match', cached!.etag)
        .expect(304);
      
      expect(response.body).toEqual({});
    });
  });
  
  describe('Cache invalidation', () => {
    test('should allow invalidating specific file', () => {
      expect(fileCache.isCached('server_logs.zip')).toBe(true);
      
      const result = fileCache.invalidate('server_logs.zip');
      
      expect(result).toBe(true);
      expect(fileCache.isCached('server_logs.zip')).toBe(false);
      
      // Re-cache for other tests
      const zipPath = path.join(process.cwd(), 'challenge_files', 'server_logs.zip');
      fileCache.cacheFile(zipPath, 'application/zip');
    });
    
    test('should allow invalidating all files', () => {
      const statsBefore = fileCache.getStats();
      expect(statsBefore.count).toBeGreaterThan(0);
      
      fileCache.invalidateAll();
      
      const statsAfter = fileCache.getStats();
      expect(statsAfter.count).toBe(0);
      expect(statsAfter.totalSize).toBe(0);
      
      // Re-cache for other tests
      const zipPath = path.join(process.cwd(), 'challenge_files', 'server_logs.zip');
      const imagePath = path.join(process.cwd(), 'uploads', 'dev_backup.png');
      fileCache.cacheFile(zipPath, 'application/zip');
      fileCache.cacheFile(imagePath, 'image/png');
    });
  });
  
  describe('Fallback to disk', () => {
    test('should fallback to disk when file not cached', async () => {
      // Invalidate cache
      fileCache.invalidate('server_logs.zip');
      
      const response = await request(app)
        .get('/downloads/server_logs.zip')
        .expect(200);
      
      expect(response.headers['content-type']).toBe('application/zip');
      
      // Re-cache for other tests
      const zipPath = path.join(process.cwd(), 'challenge_files', 'server_logs.zip');
      fileCache.cacheFile(zipPath, 'application/zip');
    });
  });
  
  describe('Cache statistics', () => {
    test('should provide accurate cache statistics', () => {
      const stats = fileCache.getStats();
      
      expect(stats.count).toBeGreaterThanOrEqual(2);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.files).toContain('server_logs.zip');
      expect(stats.files).toContain('dev_backup.png');
    });
  });
});
