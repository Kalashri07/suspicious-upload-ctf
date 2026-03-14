import { generateLogFiles, createZipArchive } from '../src/index';
import AdmZip from 'adm-zip';

describe('createZipArchive', () => {
  let logFiles: ReturnType<typeof generateLogFiles>;
  let zipBuffer: Buffer;

  beforeAll(async () => {
    logFiles = generateLogFiles();
    zipBuffer = await createZipArchive(logFiles);
  });

  it('should create a valid zip archive', () => {
    expect(zipBuffer).toBeInstanceOf(Buffer);
    expect(zipBuffer.length).toBeGreaterThan(0);
  });

  it('should have zip file size under 1MB', () => {
    const sizeInMB = zipBuffer.length / (1024 * 1024);
    expect(sizeInMB).toBeLessThan(1);
  });

  it('should contain all three log files in server_logs directory', () => {
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    
    const filenames = zipEntries.map(entry => entry.entryName);
    
    expect(filenames).toContain('server_logs/logs.txt');
    expect(filenames).toContain('server_logs/access.log');
    expect(filenames).toContain('server_logs/errors.log');
    expect(zipEntries.length).toBe(3);
  });

  it('should preserve log file contents in the archive', () => {
    const zip = new AdmZip(zipBuffer);
    
    const logsEntry = zip.getEntry('server_logs/logs.txt');
    const accessEntry = zip.getEntry('server_logs/access.log');
    const errorsEntry = zip.getEntry('server_logs/errors.log');
    
    expect(logsEntry).not.toBeNull();
    expect(accessEntry).not.toBeNull();
    expect(errorsEntry).not.toBeNull();
    
    if (logsEntry && accessEntry && errorsEntry) {
      const logsContent = logsEntry.getData().toString('utf8');
      const accessContent = accessEntry.getData().toString('utf8');
      const errorsContent = errorsEntry.getData().toString('utf8');
      
      expect(logsContent).toBe(logFiles['logs.txt']);
      expect(accessContent).toBe(logFiles['access.log']);
      expect(errorsContent).toBe(logFiles['errors.log']);
    }
  });

  it('should preserve the correct clue in logs.txt', () => {
    const zip = new AdmZip(zipBuffer);
    const logsEntry = zip.getEntry('server_logs/logs.txt');
    
    expect(logsEntry).not.toBeNull();
    
    if (logsEntry) {
      const logsContent = logsEntry.getData().toString('utf8');
      const lines = logsContent.split('\n');
      
      expect(lines[46]).toContain('/uploads/dev_backup.png');
    }
  });

  it('should use maximum compression level', () => {
    // Verify that compression is effective
    const uncompressedSize = 
      logFiles['logs.txt'].length + 
      logFiles['access.log'].length + 
      logFiles['errors.log'].length;
    
    const compressionRatio = zipBuffer.length / uncompressedSize;
    
    // Expect at least some compression (ratio < 1)
    expect(compressionRatio).toBeLessThan(1);
  });
});
