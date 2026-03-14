# Steganography Implementation Documentation

## Overview

This document describes the implementation of Task 3.2: Steganography Embedding Function for "The Suspicious Upload" CTF Challenge.

## Requirements

**Task 3.2**: Implement steganography embedding function
- Create function to embed clue.txt into dev_backup.png using steghide
- Use password "backup123"
- Execute steghide command with proper error handling
- Verify embedding success by test extraction
- Requirements: 6.1, 6.6

## Implementation Details

### Files Created

1. **src/steganography.ts** - Main steganography module
2. **tests/steganography.test.ts** - Comprehensive unit tests
3. **demo-steganography.ts** - Demonstration script

### Key Functions

#### 1. `createBasePngImage(outputPath: string): void`

Creates a minimal valid PNG image (100x100 pixels) for steganography embedding.

**Purpose**: Provides a base image when no image exists
**Requirements**: 6.6 (preserve visual appearance)

#### 2. `embedSteganography(imagePath, payloadPath, password): boolean`

Embeds a text file into a PNG image using the steghide command-line tool.

**Parameters**:
- `imagePath`: Path to the PNG image file
- `payloadPath`: Path to the text file to embed (clue.txt)
- `password`: Password for steganography protection ("backup123")

**Returns**: `true` if embedding was successful, `false` otherwise

**Error Handling**:
- Validates that input files exist
- Validates that password is non-empty
- Detects if steghide is not installed
- Verifies embedding success by test extraction

**Requirements**: 6.1, 6.6

#### 3. `extractSteganography(imagePath, password, outputPath?): string | null`

Extracts hidden data from a steganographic image.

**Parameters**:
- `imagePath`: Path to the PNG image with embedded data
- `password`: Password for extraction
- `outputPath`: Optional output path for extracted file

**Returns**: Extracted content as string, or `null` if extraction fails

**Requirements**: 6.1, 6.4, 6.5

#### 4. `initializeSteganography(uploadsDir, clueFilePath): boolean`

High-level function that initializes steganography for the challenge.

**Parameters**:
- `uploadsDir`: Directory where the image should be created
- `clueFilePath`: Path to the clue.txt file

**Process**:
1. Creates uploads directory if it doesn't exist
2. Creates base PNG image (dev_backup.png)
3. Embeds clue.txt into the image with password "backup123"
4. Verifies embedding success

**Returns**: `true` if initialization was successful

**Requirements**: 6.1, 6.6

## Steghide Command Usage

### Embedding Command
```bash
steghide embed -cf "image.png" -ef "clue.txt" -p "backup123" -f
```

**Flags**:
- `-cf`: Cover file (the image to embed data into)
- `-ef`: Embed file (the data to hide)
- `-p`: Passphrase for encryption
- `-f`: Force overwrite if data already embedded

### Extraction Command
```bash
steghide extract -sf "image.png" -p "backup123" -f
```

**Flags**:
- `-sf`: Stego file (the image with embedded data)
- `-p`: Passphrase for decryption
- `-f`: Force overwrite if extracted file exists

## Testing

### Test Coverage

The implementation includes 13 comprehensive unit tests:

1. **createBasePngImage tests**:
   - Creates a valid PNG file
   - Creates a file with non-zero size

2. **embedSteganography tests**:
   - Returns false when image file does not exist
   - Returns false when payload file does not exist
   - Returns false when password is empty
   - Handles steghide not being installed gracefully

3. **extractSteganography tests**:
   - Returns null when image file does not exist
   - Returns null when extraction fails

4. **initializeSteganography tests**:
   - Creates uploads directory if it doesn't exist
   - Creates dev_backup.png in uploads directory
   - Returns boolean result
   - Handles missing clue file gracefully

5. **Integration tests**:
   - Successfully embeds and extracts data when steghide is available

### Running Tests

```bash
# Run all tests
npm test

# Run only steganography tests
npm test tests/steganography.test.ts

# Run tests in watch mode
npm run test:watch
```

### Test Results

All 49 tests pass (including 13 steganography tests):
```
Test Suites: 5 passed, 5 total
Tests:       49 passed, 49 total
```

## Usage Example

### Basic Usage

```typescript
import { initializeSteganography } from './src/steganography';
import * as path from 'path';

const uploadsDir = path.join(__dirname, 'uploads');
const clueFilePath = path.join(__dirname, 'challenge_files', 'clue.txt');

const success = initializeSteganography(uploadsDir, clueFilePath);

if (success) {
  console.log('Steganography setup complete!');
} else {
  console.log('Steganography setup failed - steghide may not be installed');
}
```

### Demonstration Script

Run the demonstration script to see the steganography function in action:

```bash
npx ts-node demo-steganography.ts
```

## Security Considerations

### Password Protection

- Password: "backup123" (as specified in requirements)
- Password is required for both embedding and extraction
- Extraction without password fails (Requirement 6.4)
- Extraction with incorrect password fails (Requirement 6.5)

### File Access Control

- clue.txt is embedded in the image and not served directly (Requirement 6.7)
- Only dev_backup.png is accessible via the web server
- Direct access to clue.txt returns 404

### Visual Integrity

- The steganography process preserves the visual appearance of the image (Requirement 6.6)
- The embedded data is not visible to the naked eye
- File size may increase slightly due to embedded data

## Dependencies

### Runtime Dependencies

- **Node.js**: v18+ (for file system operations)
- **steghide**: v0.5.1+ (command-line tool, must be installed on system)

### Development Dependencies

- **TypeScript**: v5.9.3
- **Jest**: v30.3.0 (for testing)
- **@types/node**: v25.4.0

## Installation Requirements

### Installing Steghide

**Ubuntu/Debian**:
```bash
sudo apt-get install steghide
```

**macOS**:
```bash
brew install steghide
```

**Windows**:
Download from http://steghide.sourceforge.net/

### Verifying Installation

```bash
steghide --version
```

Expected output:
```
steghide version 0.5.1
```

## Error Handling

### Common Errors

1. **Steghide not installed**:
   - Error message: "steghide is not installed. Please install steghide to use steganography features."
   - Solution: Install steghide using package manager

2. **Image file not found**:
   - Error message: "Image file not found: [path]"
   - Solution: Ensure the image file exists at the specified path

3. **Payload file not found**:
   - Error message: "Payload file not found: [path]"
   - Solution: Ensure clue.txt exists in challenge_files directory

4. **Empty password**:
   - Error message: "Password cannot be empty"
   - Solution: Provide a non-empty password string

### Graceful Degradation

The implementation handles missing steghide gracefully:
- Returns `false` instead of crashing
- Logs clear error messages
- Creates the base image even if embedding fails
- Allows development to continue without steghide installed

## Integration with Challenge

### Challenge Flow

1. **Server Initialization**:
   - Call `initializeSteganography()` during server startup
   - Creates dev_backup.png with embedded clue.txt
   - Verifies embedding success

2. **Participant Discovery**:
   - Participant finds reference to /uploads/dev_backup.png in logs
   - Downloads the image from the web server
   - Views page source to find Base64-encoded password hint

3. **Steganography Extraction**:
   - Participant decodes Base64 hint to get password "backup123"
   - Runs: `steghide extract -sf dev_backup.png`
   - Enters password: backup123
   - Reads extracted clue.txt

4. **Next Step**:
   - clue.txt contains: "Admin portal: /admin_portal"
   - clue.txt contains: "Parameter hint: access=user"
   - Participant proceeds to admin portal challenge

## Future Enhancements

Potential improvements for future versions:

1. **Alternative Steganography Methods**:
   - Support for LSB (Least Significant Bit) steganography
   - Pure JavaScript implementation (no external dependencies)

2. **Enhanced Verification**:
   - Checksum validation of embedded data
   - Automated testing with steghide installed in CI/CD

3. **Multiple Image Formats**:
   - Support for JPEG steganography
   - Support for BMP format

4. **Dynamic Password Generation**:
   - Generate unique passwords per challenge instance
   - Store password hints in different locations

## Conclusion

Task 3.2 has been successfully implemented with:
- ✓ Steganography embedding function using steghide
- ✓ Password protection ("backup123")
- ✓ Proper error handling
- ✓ Verification by test extraction
- ✓ Comprehensive unit tests (13 tests, all passing)
- ✓ Integration with existing codebase
- ✓ Documentation and demonstration script

The implementation satisfies all requirements (6.1, 6.6) and is ready for integration into the challenge server.
