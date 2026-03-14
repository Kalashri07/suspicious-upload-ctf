// In-memory file cache for performance optimization
// Requirements: 11.2, 11.3, 11.4

import * as fs from 'fs';
import * as path from 'path';

/**
 * Cached file entry with metadata
 */
interface CachedFile {
  buffer: Buffer;
  mimeType: string;
  etag: string;
  cachedAt: number;
}

/**
 * In-memory file cache for challenge files
 * Requirements: 11.2, 11.3, 11.4
 */
export class FileCache {
  private cache: Map<string, CachedFile> = new Map();
  
  /**
   * Load a file into the cache
   * @param filePath Path to the file to cache
   * @param mimeType MIME type of the file
   * @returns true if file was cached successfully
   */
  public cacheFile(filePath: string, mimeType: string): boolean {
    try {
      if (!fs.existsSync(filePath)) {
        console.error(`Cannot cache file: ${filePath} does not exist`);
        return false;
      }
      
      const buffer = fs.readFileSync(filePath);
      const stats = fs.statSync(filePath);
      const etag = `"${stats.mtime.getTime()}"`;
      
      const cacheKey = path.basename(filePath);
      this.cache.set(cacheKey, {
        buffer,
        mimeType,
        etag,
        cachedAt: Date.now(),
      });
      
      console.log(`✓ Cached ${cacheKey} (${(buffer.length / 1024).toFixed(2)} KB)`);
      return true;
    } catch (error: any) {
      console.error(`Error caching file ${filePath}:`, error.message);
      return false;
    }
  }
  
  /**
   * Get a cached file
   * @param filename Name of the file to retrieve
   * @returns Cached file data or undefined if not cached
   */
  public getFile(filename: string): CachedFile | undefined {
    return this.cache.get(filename);
  }
  
  /**
   * Check if a file is cached
   * @param filename Name of the file to check
   * @returns true if file is cached
   */
  public isCached(filename: string): boolean {
    return this.cache.has(filename);
  }
  
  /**
   * Invalidate (remove) a file from the cache
   * Requirements: 11.4 - Cache invalidation strategy
   * @param filename Name of the file to invalidate
   * @returns true if file was invalidated
   */
  public invalidate(filename: string): boolean {
    if (this.cache.has(filename)) {
      this.cache.delete(filename);
      console.log(`✓ Invalidated cache for ${filename}`);
      return true;
    }
    return false;
  }
  
  /**
   * Invalidate all cached files
   * Requirements: 11.4 - Cache invalidation strategy
   */
  public invalidateAll(): void {
    const count = this.cache.size;
    this.cache.clear();
    console.log(`✓ Invalidated all cached files (${count} files)`);
  }
  
  /**
   * Get cache statistics
   * @returns Object with cache statistics
   */
  public getStats(): { count: number; totalSize: number; files: string[] } {
    let totalSize = 0;
    const files: string[] = [];
    
    for (const [filename, cached] of this.cache.entries()) {
      totalSize += cached.buffer.length;
      files.push(filename);
    }
    
    return {
      count: this.cache.size,
      totalSize,
      files,
    };
  }
}

/**
 * Global file cache instance
 */
export const fileCache = new FileCache();
