// Tests for server startup and initialization
// Requirements: 3.1, 6.1, 11.5, 13.2

import * as fs from 'fs';
import * as path from 'path';
import {
  ServerConfig,
  DEFAULT_CONFIG,
  verifySteghideInstalled,
  verifyDirectories,
  createClueFile,
  verifyChallengeFiles,
  generateChallengeLogFiles,
} from '../src/startup';

describe('Server Startup', () => {
  describe('verifySteghideInstalled', () => {
    it('should return a boolean indicating if steghide is installed', () => {
      const result = verifySteghideInstalled();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('DEFAULT_CONFIG', () => {
    it('should have valid default configuration', () => {
      expect(DEFAULT_CONFIG.port).toBe(3000);
      expect(DEFAULT_CONFIG.rateLimitWindowMs).toBe(15 * 60 * 1000);
      expect(DEFAULT_CONFIG.rateLimitMaxRequests).toBe(100);
      expect(DEFAULT_CONFIG.challengeFilesDir).toContain('challenge_files');
      expect(DEFAULT_CONFIG.uploadsDir).toContain('uploads');
      expect(DEFAULT_CONFIG.clueFilePath).toContain('clue.txt');
    });
  });

  describe('verifyDirectories', () => {
    it('should create directories if they do not exist', () => {
      const testConfig: ServerConfig = {
        ...DEFAULT_CONFIG,
        challengeFilesDir: path.join(process.cwd(), 'test_challenge_files'),
        uploadsDir: path.join(process.cwd(), 'test_uploads'),
      };

      // Clean up if directories exist
      if (fs.existsSync(testConfig.challengeFilesDir)) {
        fs.rmSync(testConfig.challengeFilesDir, { recursive: true });
      }
      if (fs.existsSync(testConfig.uploadsDir)) {
        fs.rmSync(testConfig.uploadsDir, { recursive: true });
      }

      const result = verifyDirectories(testConfig);
      expect(result).toBe(true);
      expect(fs.existsSync(testConfig.challengeFilesDir)).toBe(true);
      expect(fs.existsSync(testConfig.uploadsDir)).toBe(true);

      // Clean up
      fs.rmSync(testConfig.challengeFilesDir, { recursive: true });
      fs.rmSync(testConfig.uploadsDir, { recursive: true });
    });

    it('should return true if directories already exist', () => {
      const testConfig: ServerConfig = {
        ...DEFAULT_CONFIG,
        challengeFilesDir: path.join(process.cwd(), 'test_challenge_files'),
        uploadsDir: path.join(process.cwd(), 'test_uploads'),
      };

      // Create directories
      fs.mkdirSync(testConfig.challengeFilesDir, { recursive: true });
      fs.mkdirSync(testConfig.uploadsDir, { recursive: true });

      const result = verifyDirectories(testConfig);
      expect(result).toBe(true);

      // Clean up
      fs.rmSync(testConfig.challengeFilesDir, { recursive: true });
      fs.rmSync(testConfig.uploadsDir, { recursive: true });
    });
  });

  describe('createClueFile', () => {
    it('should create clue.txt with correct content', () => {
      const testConfig: ServerConfig = {
        ...DEFAULT_CONFIG,
        challengeFilesDir: path.join(process.cwd(), 'test_challenge_files'),
        clueFilePath: path.join(process.cwd(), 'test_challenge_files', 'clue.txt'),
      };

      // Clean up if directory exists
      if (fs.existsSync(testConfig.challengeFilesDir)) {
        fs.rmSync(testConfig.challengeFilesDir, { recursive: true });
      }

      // Create directory
      fs.mkdirSync(testConfig.challengeFilesDir, { recursive: true });

      const result = createClueFile(testConfig);
      expect(result).toBe(true);
      expect(fs.existsSync(testConfig.clueFilePath)).toBe(true);

      const content = fs.readFileSync(testConfig.clueFilePath, 'utf-8');
      expect(content).toContain('Admin portal: /admin_portal');
      expect(content).toContain('Parameter hint: access=user');

      // Clean up
      fs.rmSync(testConfig.challengeFilesDir, { recursive: true });
    });

    it('should return true if clue.txt already exists', () => {
      const testConfig: ServerConfig = {
        ...DEFAULT_CONFIG,
        challengeFilesDir: path.join(process.cwd(), 'test_challenge_files'),
        clueFilePath: path.join(process.cwd(), 'test_challenge_files', 'clue.txt'),
      };

      // Create directory and file
      fs.mkdirSync(testConfig.challengeFilesDir, { recursive: true });
      fs.writeFileSync(testConfig.clueFilePath, 'existing content', 'utf-8');

      const result = createClueFile(testConfig);
      expect(result).toBe(true);

      // Clean up
      fs.rmSync(testConfig.challengeFilesDir, { recursive: true });
    });
  });

  describe('generateChallengeLogFiles', () => {
    it('should generate log files and create zip archive', async () => {
      const testConfig: ServerConfig = {
        ...DEFAULT_CONFIG,
        challengeFilesDir: path.join(process.cwd(), 'test_challenge_files'),
      };

      // Clean up if directory exists
      if (fs.existsSync(testConfig.challengeFilesDir)) {
        fs.rmSync(testConfig.challengeFilesDir, { recursive: true });
      }

      // Create directory
      fs.mkdirSync(testConfig.challengeFilesDir, { recursive: true });

      const result = await generateChallengeLogFiles(testConfig);
      expect(result).toBe(true);

      const zipPath = path.join(testConfig.challengeFilesDir, 'server_logs.zip');
      expect(fs.existsSync(zipPath)).toBe(true);

      const stats = fs.statSync(zipPath);
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.size).toBeLessThan(1024 * 1024); // Less than 1MB

      // Clean up
      fs.rmSync(testConfig.challengeFilesDir, { recursive: true });
    });
  });

  describe('verifyChallengeFiles', () => {
    it('should return false if required files are missing', () => {
      const testConfig: ServerConfig = {
        ...DEFAULT_CONFIG,
        challengeFilesDir: path.join(process.cwd(), 'test_challenge_files_missing'),
        uploadsDir: path.join(process.cwd(), 'test_uploads_missing'),
      };

      const result = verifyChallengeFiles(testConfig);
      expect(result).toBe(false);
    });

    it('should return true if all required files exist', () => {
      const testConfig: ServerConfig = {
        ...DEFAULT_CONFIG,
        challengeFilesDir: path.join(process.cwd(), 'test_challenge_files'),
        uploadsDir: path.join(process.cwd(), 'test_uploads'),
        clueFilePath: path.join(process.cwd(), 'test_challenge_files', 'clue.txt'),
      };

      // Create directories and files
      fs.mkdirSync(testConfig.challengeFilesDir, { recursive: true });
      fs.mkdirSync(testConfig.uploadsDir, { recursive: true });
      fs.writeFileSync(path.join(testConfig.challengeFilesDir, 'server_logs.zip'), 'test');
      fs.writeFileSync(testConfig.clueFilePath, 'test');
      fs.writeFileSync(path.join(testConfig.uploadsDir, 'dev_backup.png'), 'test');

      const result = verifyChallengeFiles(testConfig);
      expect(result).toBe(true);

      // Clean up
      fs.rmSync(testConfig.challengeFilesDir, { recursive: true });
      fs.rmSync(testConfig.uploadsDir, { recursive: true });
    });
  });
});
