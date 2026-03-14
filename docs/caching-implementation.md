# File Caching Implementation

## Overview

The CTF challenge server implements in-memory file caching to improve performance under load. This document describes the caching implementation and strategy.

## Requirements

- **Requirement 11.2**: Cache static files (logs and images) in memory
- **Requirement 11.3**: Respond to file download requests within 500ms
- **Requirement 11.4**: Implement cache invalidation strategy

## Architecture

### FileCache Class

The `FileCache` class (`src/fileCache.ts`) provides a simple in-memory cache for challenge files:

```typescript
class FileCache {
  cacheFile(filePath: string, mimeType: string): boolean
  getFile(filename: string): CachedFile | undefined
  isCached(filename: string): boolean
  invalidate(filename: string): boolean
  invalidateAll(): void
  getStats(): CacheStats
}
```

### Cached Files

The following files are cached on server startup:

1. **server_logs.zip** - The log archive participants download
2. **dev_backup.png** - The steganographic image file

### Cache Entry Structure

Each cached file includes:

- `buffer`: The file content as a Buffer
- `mimeType`: The MIME type for the Content-Type header
- `etag`: ETag value based on file modification time
- `cachedAt`: Timestamp when the file was cached

## Implementation Details

### Server Startup

Files are cached during server initialization in `src/startup.ts`:

1. Files are generated (logs, steganography)
2. Files are verified to exist
3. Files are loaded into memory cache
4. Cache statistics are displayed

### Server Routes

The Express routes in `src/server.ts` check the cache first:

1. Check if file is in cache
2. If cached, serve from memory with appropriate headers
3. If not cached, fallback to disk read
4. Support ETag-based client caching

### Cache Invalidation Strategy

The cache can be invalidated in several ways:

1. **Individual file invalidation**: `fileCache.invalidate(filename)`
2. **Complete cache invalidation**: `fileCache.invalidateAll()`
3. **Regeneration with invalidation**: `regenerateChallengeFiles()`

The `regenerateChallengeFiles()` function:
1. Invalidates all cached files
2. Regenerates log files
3. Re-embeds steganography
4. Re-caches all files

## Performance Benefits

### Before Caching
- Each request reads from disk
- File I/O overhead on every request
- Slower response times under load

### After Caching
- Files served from memory
- No disk I/O for cached files
- Faster response times (< 500ms)
- Better support for concurrent users

## Usage Examples

### Caching Files on Startup

```typescript
import { fileCache } from './fileCache';

// Cache a file
fileCache.cacheFile('/path/to/file.zip', 'application/zip');

// Check if cached
if (fileCache.isCached('file.zip')) {
  console.log('File is cached');
}
```

### Serving Cached Files

```typescript
app.get('/downloads/:filename', (req, res) => {
  const cached = fileCache.getFile(req.params.filename);
  
  if (cached) {
    res.setHeader('Content-Type', cached.mimeType);
    res.setHeader('ETag', cached.etag);
    res.send(cached.buffer);
  } else {
    // Fallback to disk
    res.sendFile(filePath);
  }
});
```

### Invalidating Cache

```typescript
// Invalidate specific file
fileCache.invalidate('server_logs.zip');

// Invalidate all files
fileCache.invalidateAll();

// Regenerate and re-cache
await regenerateChallengeFiles(config);
```

### Getting Cache Statistics

```typescript
const stats = fileCache.getStats();
console.log(`Cached ${stats.count} files`);
console.log(`Total size: ${stats.totalSize} bytes`);
console.log(`Files: ${stats.files.join(', ')}`);
```

## Testing

The caching implementation includes comprehensive tests:

### Unit Tests (`tests/fileCache.test.ts`)
- File caching operations
- Cache retrieval
- Cache invalidation
- Statistics calculation

### Integration Tests (`tests/caching-integration.test.ts`)
- Serving cached files through Express routes
- ETag-based client caching
- Fallback to disk when not cached
- Cache invalidation during server operation

## Monitoring

The cache provides statistics for monitoring:

```typescript
const stats = fileCache.getStats();
// {
//   count: 2,
//   totalSize: 524288,
//   files: ['server_logs.zip', 'dev_backup.png']
// }
```

## Future Enhancements

Potential improvements for production use:

1. **TTL (Time-To-Live)**: Automatic cache expiration
2. **Size limits**: Maximum cache size enforcement
3. **LRU eviction**: Least Recently Used eviction policy
4. **Metrics**: Request hit/miss rates
5. **Warming**: Pre-cache files before server starts accepting requests

## Conclusion

The in-memory caching implementation provides significant performance improvements for the CTF challenge server, ensuring fast response times even under load from multiple concurrent participants.
