// Tests for in-memory file cache
// Requirements: 11.2, 11.3, 11.4

import { FileCache } from '../src/fileCache';
import * as fs from 'fs';
import * as path from 'path';

describe('FileCache', () => {
  let cache: FileCache;
  let testFilePath: string;
  
  beforeEach(() => {
    cache = new FileCache();
    
    // Create a temporary test file
    testFilePath = path.join(process.cwd(), 'test-file.txt');
    fs.writeFileSync(testFilePath, 'Test content for caching');
  });
  
  afterEach(() => {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });
  
  describe('cacheFile', () => {
    test('should cache a file successfully', () => {
      const result = cache.cacheFile(testFilePath, 'text/plain');
      
      expect(result).toBe(true);
      expect(cache.isCached('test-file.txt')).toBe(true);
    });
    
    test('should return false for non-existent file', () => {
      const result = cache.cacheFile('non-existent.txt', 'text/plain');
      
      expect(result).toBe(false);
      expect(cache.isCached('non-existent.txt')).toBe(false);
    });
    
    test('should store file buffer correctly', () => {
      cache.cacheFile(testFilePath, 'text/plain');
      
      const cached = cache.getFile('test-file.txt');
      expect(cached).toBeDefined();
      expect(cached!.buffer.toString()).toBe('Test content for caching');
    });
    
    test('should store MIME type correctly', () => {
      cache.cacheFile(testFilePath, 'text/plain');
      
      const cached = cache.getFile('test-file.txt');
      expect(cached).toBeDefined();
      expect(cached!.mimeType).toBe('text/plain');
    });
    
    test('should generate ETag based on modification time', () => {
      cache.cacheFile(testFilePath, 'text/plain');
      
      const cached = cache.getFile('test-file.txt');
      expect(cached).toBeDefined();
      expect(cached!.etag).toMatch(/^"\d+"$/);
    });
  });
  
  describe('getFile', () => {
    test('should return cached file', () => {
      cache.cacheFile(testFilePath, 'text/plain');
      
      const cached = cache.getFile('test-file.txt');
      expect(cached).toBeDefined();
      expect(cached!.buffer).toBeInstanceOf(Buffer);
    });
    
    test('should return undefined for non-cached file', () => {
      const cached = cache.getFile('non-existent.txt');
      expect(cached).toBeUndefined();
    });
  });
  
  describe('isCached', () => {
    test('should return true for cached file', () => {
      cache.cacheFile(testFilePath, 'text/plain');
      
      expect(cache.isCached('test-file.txt')).toBe(true);
    });
    
    test('should return false for non-cached file', () => {
      expect(cache.isCached('non-existent.txt')).toBe(false);
    });
  });
  
  describe('invalidate', () => {
    test('should remove file from cache', () => {
      cache.cacheFile(testFilePath, 'text/plain');
      expect(cache.isCached('test-file.txt')).toBe(true);
      
      const result = cache.invalidate('test-file.txt');
      
      expect(result).toBe(true);
      expect(cache.isCached('test-file.txt')).toBe(false);
    });
    
    test('should return false for non-cached file', () => {
      const result = cache.invalidate('non-existent.txt');
      expect(result).toBe(false);
    });
  });
  
  describe('invalidateAll', () => {
    test('should clear all cached files', () => {
      // Create multiple test files
      const testFile2Path = path.join(process.cwd(), 'test-file-2.txt');
      fs.writeFileSync(testFile2Path, 'Test content 2');
      
      cache.cacheFile(testFilePath, 'text/plain');
      cache.cacheFile(testFile2Path, 'text/plain');
      
      expect(cache.isCached('test-file.txt')).toBe(true);
      expect(cache.isCached('test-file-2.txt')).toBe(true);
      
      cache.invalidateAll();
      
      expect(cache.isCached('test-file.txt')).toBe(false);
      expect(cache.isCached('test-file-2.txt')).toBe(false);
      
      // Clean up
      fs.unlinkSync(testFile2Path);
    });
  });
  
  describe('getStats', () => {
    test('should return correct statistics', () => {
      cache.cacheFile(testFilePath, 'text/plain');
      
      const stats = cache.getStats();
      
      expect(stats.count).toBe(1);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.files).toContain('test-file.txt');
    });
    
    test('should return zero stats for empty cache', () => {
      const stats = cache.getStats();
      
      expect(stats.count).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.files).toEqual([]);
    });
    
    test('should calculate total size correctly', () => {
      const content = 'Test content for caching';
      const expectedSize = Buffer.from(content).length;
      
      cache.cacheFile(testFilePath, 'text/plain');
      
      const stats = cache.getStats();
      expect(stats.totalSize).toBe(expectedSize);
    });
  });
  
  describe('cache invalidation strategy', () => {
    test('should allow re-caching after invalidation', () => {
      // Cache file
      cache.cacheFile(testFilePath, 'text/plain');
      const cached1 = cache.getFile('test-file.txt');
      expect(cached1).toBeDefined();
      
      // Invalidate
      cache.invalidate('test-file.txt');
      expect(cache.isCached('test-file.txt')).toBe(false);
      
      // Modify file
      fs.writeFileSync(testFilePath, 'Updated content');
      
      // Re-cache
      cache.cacheFile(testFilePath, 'text/plain');
      const cached2 = cache.getFile('test-file.txt');
      
      expect(cached2).toBeDefined();
      expect(cached2!.buffer.toString()).toBe('Updated content');
    });
  });
});
