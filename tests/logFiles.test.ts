import { generateLogFiles } from '../src/index';

describe('generateLogFiles', () => {
  let logFiles: ReturnType<typeof generateLogFiles>;

  beforeAll(() => {
    logFiles = generateLogFiles();
  });

  describe('logs.txt', () => {
    it('should generate at least 100 lines', () => {
      const lines = logFiles['logs.txt'].split('\n');
      expect(lines.length).toBeGreaterThanOrEqual(100);
    });

    it('should contain correct clue at line 47', () => {
      const lines = logFiles['logs.txt'].split('\n');
      expect(lines[46]).toContain('/uploads/dev_backup.png');
      expect(lines[46]).toContain('[DEBUG]');
    });

    it('should contain exactly one occurrence of correct clue', () => {
      const content = logFiles['logs.txt'];
      const matches = content.match(/\/uploads\/dev_backup\.png/g);
      expect(matches).not.toBeNull();
      expect(matches?.length).toBe(1);
    });

    it('should contain at least 3 fake clues', () => {
      const content = logFiles['logs.txt'];
      const fakeClues = [
        '/uploads/backup_old.png',
        '/uploads/test_image.png',
        '/uploads/dev_test.png',
      ];
      
      let fakeClueCount = 0;
      for (const fakeClue of fakeClues) {
        if (content.includes(fakeClue)) {
          fakeClueCount++;
        }
      }
      
      expect(fakeClueCount).toBeGreaterThanOrEqual(3);
    });

    it('should have valid ISO 8601 timestamps', () => {
      const lines = logFiles['logs.txt'].split('\n');
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
      
      // Check first 10 lines
      for (let i = 0; i < 10; i++) {
        expect(lines[i]).toMatch(iso8601Regex);
      }
    });

    it('should have chronologically ordered timestamps', () => {
      const lines = logFiles['logs.txt'].split('\n');
      const timestamps: number[] = [];
      
      // Extract timestamps from first 20 lines
      for (let i = 0; i < 20; i++) {
        const match = lines[i].match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
        if (match) {
          timestamps.push(new Date(match[1]).getTime());
        }
      }
      
      // Verify chronological order
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
      }
    });
  });

  describe('access.log', () => {
    it('should generate at least 100 lines', () => {
      const lines = logFiles['access.log'].split('\n');
      expect(lines.length).toBeGreaterThanOrEqual(100);
    });

    it('should contain realistic HTTP access log format', () => {
      const lines = logFiles['access.log'].split('\n');
      
      // Check first line has IP, timestamp, method, path, status
      expect(lines[0]).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/); // IP address
      expect(lines[0]).toMatch(/GET|POST|PUT|DELETE/); // HTTP method
      expect(lines[0]).toMatch(/HTTP\/1\.1/); // HTTP version
      expect(lines[0]).toMatch(/\d{3}/); // Status code
    });

    it('should have valid timestamps', () => {
      const lines = logFiles['access.log'].split('\n');
      const iso8601Regex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
      
      // Check first 5 lines
      for (let i = 0; i < 5; i++) {
        expect(lines[i]).toMatch(iso8601Regex);
      }
    });
  });

  describe('errors.log', () => {
    it('should generate at least 100 lines', () => {
      const lines = logFiles['errors.log'].split('\n');
      expect(lines.length).toBeGreaterThanOrEqual(100);
    });

    it('should contain error log format with timestamps and levels', () => {
      const lines = logFiles['errors.log'].split('\n');
      
      // Check first line has timestamp and ERROR or WARN level
      expect(lines[0]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
      expect(lines[0]).toMatch(/\[ERROR\]|\[WARN\]/);
    });

    it('should have valid ISO 8601 timestamps', () => {
      const lines = logFiles['errors.log'].split('\n');
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
      
      // Check first 10 lines
      for (let i = 0; i < 10; i++) {
        expect(lines[i]).toMatch(iso8601Regex);
      }
    });

    it('should have chronologically ordered timestamps', () => {
      const lines = logFiles['errors.log'].split('\n');
      const timestamps: number[] = [];
      
      // Extract timestamps from first 20 lines
      for (let i = 0; i < 20; i++) {
        const match = lines[i].match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
        if (match) {
          timestamps.push(new Date(match[1]).getTime());
        }
      }
      
      // Verify chronological order
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
      }
    });
  });

  describe('all log files', () => {
    it('should return all three log files', () => {
      expect(Object.keys(logFiles)).toContain('logs.txt');
      expect(Object.keys(logFiles)).toContain('access.log');
      expect(Object.keys(logFiles)).toContain('errors.log');
      expect(Object.keys(logFiles).length).toBe(3);
    });

    it('should have non-empty content in all files', () => {
      expect(logFiles['logs.txt'].length).toBeGreaterThan(0);
      expect(logFiles['access.log'].length).toBeGreaterThan(0);
      expect(logFiles['errors.log'].length).toBeGreaterThan(0);
    });
  });
});
