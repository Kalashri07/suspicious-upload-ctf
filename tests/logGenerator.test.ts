import { generateRealisticLogEntry } from '../src/index';

describe('generateRealisticLogEntry', () => {
  it('should generate a valid log entry with correct structure', () => {
    const baseTime = new Date('2024-01-01T00:00:00.000Z');
    const offsetMs = 1000;
    
    const entry = generateRealisticLogEntry(baseTime, offsetMs);
    
    expect(entry).toHaveProperty('timestamp');
    expect(entry).toHaveProperty('level');
    expect(entry).toHaveProperty('message');
    expect(typeof entry.timestamp).toBe('string');
    expect(typeof entry.message).toBe('string');
  });

  it('should generate log entries with valid log levels', () => {
    const baseTime = new Date('2024-01-01T00:00:00.000Z');
    const validLevels = ['INFO', 'DEBUG', 'WARN', 'ERROR'];
    
    // Generate multiple entries to test randomness
    for (let i = 0; i < 20; i++) {
      const entry = generateRealisticLogEntry(baseTime, i * 1000);
      expect(validLevels).toContain(entry.level);
    }
  });

  it('should generate chronologically ordered timestamps', () => {
    const baseTime = new Date('2024-01-01T00:00:00.000Z');
    
    const entry1 = generateRealisticLogEntry(baseTime, 0);
    const entry2 = generateRealisticLogEntry(baseTime, 1000);
    const entry3 = generateRealisticLogEntry(baseTime, 2000);
    
    const time1 = new Date(entry1.timestamp).getTime();
    const time2 = new Date(entry2.timestamp).getTime();
    const time3 = new Date(entry3.timestamp).getTime();
    
    expect(time2).toBeGreaterThan(time1);
    expect(time3).toBeGreaterThan(time2);
  });

  it('should generate valid ISO 8601 timestamps', () => {
    const baseTime = new Date('2024-01-01T00:00:00.000Z');
    const entry = generateRealisticLogEntry(baseTime, 5000);
    
    // ISO 8601 format validation
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    expect(entry.timestamp).toMatch(iso8601Regex);
    
    // Should be parseable as a valid date
    const parsedDate = new Date(entry.timestamp);
    expect(parsedDate.getTime()).not.toBeNaN();
  });

  it('should generate non-empty messages', () => {
    const baseTime = new Date('2024-01-01T00:00:00.000Z');
    
    for (let i = 0; i < 10; i++) {
      const entry = generateRealisticLogEntry(baseTime, i * 1000);
      expect(entry.message.length).toBeGreaterThan(0);
    }
  });

  it('should apply correct time offset', () => {
    const baseTime = new Date('2024-01-01T00:00:00.000Z');
    const offsetMs = 5000;
    
    const entry = generateRealisticLogEntry(baseTime, offsetMs);
    const entryTime = new Date(entry.timestamp).getTime();
    const expectedTime = baseTime.getTime() + offsetMs;
    
    expect(entryTime).toBe(expectedTime);
  });

  it('should generate realistic server log messages', () => {
    const baseTime = new Date('2024-01-01T00:00:00.000Z');
    const entry = generateRealisticLogEntry(baseTime, 0);
    
    // Message should be a realistic server log message
    expect(entry.message.length).toBeGreaterThan(10);
    expect(typeof entry.message).toBe('string');
  });
});
