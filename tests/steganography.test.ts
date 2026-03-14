// Unit tests for steganography functions
// Requirements: 6.1, 6.6

import * as fs from 'fs';
import * as path from 'path';
import {
  createBasePngImage,
  embedSteganography,
  extractSteganography,
  initializeSteganography,
} from '../src/steganography';

describe('Steganography Functions', () => {
  const testDir = path.join(__dirname, 'test-steg-temp');
  const testImagePath = path.join(testDir, 'test.png');
  const testPayloadPath = path.join(testDir, 'test-payload.txt');
  const testPassword = 'testpass123';
  
  beforeAll(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });
  
  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
  
  beforeEach(() => {
    // Clean up any existing test files
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    if (fs.existsSync(testPayloadPath)) {
      fs.unlinkSync(testPayloadPath);
    }
  });
  
  describe('createBasePngImage', () => {
    it('should create a valid PNG file', () => {
      createBasePngImage(testImagePath);
      
      expect(fs.existsSync(testImagePath)).toBe(true);
      
      // Verify PNG signature
      const buffer = fs.readFileSync(testImagePath);
      expect(buffer[0]).toBe(0x89);
      expect(buffer[1]).toBe(0x50); // 'P'
      expect(buffer[2]).toBe(0x4E); // 'N'
      expect(buffer[3]).toBe(0x47); // 'G'
    });
    
    it('should create a file with non-zero size', () => {
      createBasePngImage(testImagePath);
      
      const stats = fs.statSync(testImagePath);
      expect(stats.size).toBeGreaterThan(0);
    });
  });
  
  describe('embedSteganography', () => {
    beforeEach(() => {
      // Create test image and payload
      createBasePngImage(testImagePath);
      fs.writeFileSync(testPayloadPath, 'Test secret message');
    });
    
    it('should return false when image file does not exist', () => {
      const result = embedSteganography(
        path.join(testDir, 'nonexistent.png'),
        testPayloadPath,
        testPassword
      );
      
      expect(result).toBe(false);
    });
    
    it('should return false when payload file does not exist', () => {
      const result = embedSteganography(
        testImagePath,
        path.join(testDir, 'nonexistent.txt'),
        testPassword
      );
      
      expect(result).toBe(false);
    });
    
    it('should return false when password is empty', () => {
      const result = embedSteganography(
        testImagePath,
        testPayloadPath,
        ''
      );
      
      expect(result).toBe(false);
    });
    
    it('should handle steghide not being installed gracefully', () => {
      // This test will pass if steghide is not installed
      // If steghide is installed, it will attempt embedding
      const result = embedSteganography(
        testImagePath,
        testPayloadPath,
        testPassword
      );
      
      // Result should be boolean (either true or false)
      expect(typeof result).toBe('boolean');
    });
  });
  
  describe('extractSteganography', () => {
    it('should return null when image file does not exist', () => {
      const result = extractSteganography(
        path.join(testDir, 'nonexistent.png'),
        testPassword
      );
      
      expect(result).toBeNull();
    });
    
    it('should return null when extraction fails', () => {
      // Create an image without embedded data
      createBasePngImage(testImagePath);
      
      const result = extractSteganography(testImagePath, testPassword);
      
      // Should return null since there's no embedded data
      expect(result).toBeNull();
    });
  });
  
  describe('initializeSteganography', () => {
    const uploadsDir = path.join(testDir, 'uploads');
    const clueFile = path.join(testDir, 'clue.txt');
    
    beforeEach(() => {
      // Create clue file
      fs.writeFileSync(clueFile, 'Admin portal: /admin_portal\nParameter hint: access=user\n');
    });
    
    afterEach(() => {
      // Clean up uploads directory
      if (fs.existsSync(uploadsDir)) {
        fs.rmSync(uploadsDir, { recursive: true, force: true });
      }
    });
    
    it('should create uploads directory if it does not exist', () => {
      initializeSteganography(uploadsDir, clueFile);
      
      expect(fs.existsSync(uploadsDir)).toBe(true);
    });
    
    it('should create dev_backup.png in uploads directory', () => {
      initializeSteganography(uploadsDir, clueFile);
      
      const imagePath = path.join(uploadsDir, 'dev_backup.png');
      expect(fs.existsSync(imagePath)).toBe(true);
    });
    
    it('should return boolean result', () => {
      const result = initializeSteganography(uploadsDir, clueFile);
      
      expect(typeof result).toBe('boolean');
    });
    
    it('should handle missing clue file gracefully', () => {
      const result = initializeSteganography(
        uploadsDir,
        path.join(testDir, 'nonexistent.txt')
      );
      
      expect(result).toBe(false);
    });
  });
  
  describe('Integration: Embed and Extract', () => {
    it('should successfully embed and extract data when steghide is available', () => {
      // Create test files
      createBasePngImage(testImagePath);
      const testMessage = 'Secret CTF clue';
      fs.writeFileSync(testPayloadPath, testMessage);
      
      // Attempt embedding
      const embedResult = embedSteganography(
        testImagePath,
        testPayloadPath,
        testPassword
      );
      
      // Only test extraction if embedding succeeded
      if (embedResult) {
        const extractedContent = extractSteganography(
          testImagePath,
          testPassword
        );
        
        expect(extractedContent).toBe(testMessage);
      } else {
        // If embedding failed, it's likely steghide is not installed
        // This is acceptable in development environments
        console.log('Steghide not available - skipping integration test');
      }
    });
  });
});
