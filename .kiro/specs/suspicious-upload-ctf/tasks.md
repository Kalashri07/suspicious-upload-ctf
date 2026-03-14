# Implementation Plan: The Suspicious Upload CTF Challenge

## Overview

This implementation plan breaks down the CTF challenge into discrete coding tasks. The challenge requires building a Node.js/Express web server that serves a multi-stage CTF challenge involving log investigation, steganography, and HTTP parameter manipulation. Tasks are organized to build incrementally, with testing integrated throughout.

## Tasks

- [x] 1. Project setup and dependencies
  - Initialize Node.js project with TypeScript configuration
  - Install required dependencies: Express.js, archiver, express-rate-limit
  - Install dev dependencies: TypeScript, Jest, fast-check, supertest, @types packages
  - Create project directory structure: src/, challenge_files/, uploads/, tests/
  - Set up tsconfig.json with strict mode enabled
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 2. Implement log file generation
  - [x] 2.1 Create LogEntry and LogFiles type definitions
    - Define TypeScript interfaces for LogEntry and LogFiles
    - Implement timestamp generation with ISO 8601 format
    - _Requirements: 3.4_
  
  - [x] 2.2 Implement realistic log entry generator
    - Create function to generate random realistic log messages
    - Implement log level selection (INFO, DEBUG, WARN, ERROR)
    - Ensure chronologically ordered timestamps
    - _Requirements: 3.1, 3.5, 3.6_
  
  - [x] 2.3 Implement log file generator with clues
    - Generate logs.txt with 100+ lines
    - Insert correct clue at line 47: "/uploads/dev_backup.png"
    - Insert at least 3 fake clues at different positions
    - Generate access.log and errors.log with 100+ lines each
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 2.4 Write property test for log generation
    - **Property 3: Log Clue Uniqueness**
    - **Validates: Requirements 3.2, 3.3**
    - Test that correct clue appears exactly once
    - Test that fake clues appear at least 3 times
    - Test that all timestamps are valid and ordered
  
  - [x] 2.5 Create zip archive generator
    - Implement function to create server_logs.zip from log files
    - Ensure zip file size is under 1MB
    - _Requirements: 2.2, 2.3_

- [x] 3. Implement steganography handling
  - [x] 3.1 Create clue.txt content
    - Write clue.txt with admin portal path and parameter hint
    - Content: "Admin portal: /admin_portal\nParameter hint: access=user"
    - _Requirements: 6.2, 6.3_
  
  - [x] 3.2 Implement steganography embedding function
    - Create function to embed clue.txt into dev_backup.png using steghide
    - Use password "backup123"
    - Execute steghide command with proper error handling
    - Verify embedding success by test extraction
    - _Requirements: 6.1, 6.6_
  
  - [ ]* 3.3 Write property test for steganography
    - **Property 2: Steganography Integrity**
    - **Validates: Requirements 6.1, 6.4, 6.5**
    - Test extraction with correct password succeeds
    - Test extraction without password fails
    - Test extraction with incorrect password fails
  
  - [x] 3.4 Create Base64 password hint
    - Generate Base64-encoded string: "Backup password: backup123"
    - Store for use in HTML comment
    - _Requirements: 5.1, 5.2_

- [x] 4. Checkpoint - Verify file generation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement access validation logic
  - [x] 5.1 Create AccessResult and AdminRequest type definitions
    - Define TypeScript interfaces for AccessResult and AdminRequest
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 5.2 Implement validateAccess function
    - Parse and normalize access parameter (trim, lowercase)
    - Return authorized=true with flag for access="admin"
    - Return authorized=false with denial message for access="user"
    - Return invalid parameter message for other values
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [ ]* 5.3 Write property test for access validation
    - **Property 1: Flag Isolation**
    - **Validates: Requirements 8.1, 8.7**
    - Test that flag never appears when access != "admin"
    - Test case-insensitivity and whitespace trimming
  
  - [ ]* 5.4 Write property test for parameter validation
    - **Property 5: Parameter Validation**
    - **Validates: Requirements 7.5, 7.6**
    - Test that access granted iff parameter equals "admin"

- [x] 6. Implement file access control
  - [x] 6.1 Create ChallengeFile type definition
    - Define TypeScript interface for ChallengeFile
    - Include filename, path, mimeType, isPublic fields
    - _Requirements: 4.1, 4.2_
  
  - [x] 6.2 Implement file whitelist and validation
    - Create whitelist of allowed files (dev_backup.png, server_logs.zip)
    - Implement path traversal detection and blocking
    - Implement filename validation function
    - _Requirements: 4.2, 4.4, 10.1, 10.2, 10.3_
  
  - [ ]* 6.3 Write property test for file access control
    - **Property 7: File Access Control**
    - **Validates: Requirements 4.2, 10.2, 10.3**
    - Test that only whitelisted files return 200
    - Test that non-whitelisted files return 404
    - Test that path traversal attempts are blocked

- [x] 7. Implement Express.js web server and routes
  - [x] 7.1 Create Express app with middleware
    - Initialize Express application
    - Configure body-parser middleware
    - Configure express-rate-limit for admin portal
    - Disable directory listing
    - _Requirements: 10.5, 10.4, 13.3, 13.4_
  
  - [x] 7.2 Implement landing page route (GET /)
    - Serve HTML landing page with challenge instructions
    - Include download link for server_logs.zip
    - Include Base64 hint in HTML comment on image page
    - Ensure no flag or solution in source code
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1_
  
  - [x] 7.3 Implement log download route (GET /downloads/server_logs.zip)
    - Serve pre-generated server_logs.zip file
    - Set appropriate content-type header
    - Implement caching for performance
    - _Requirements: 2.1, 11.2, 11.3_
  
  - [x] 7.4 Implement image download route (GET /uploads/:filename)
    - Validate filename against whitelist
    - Serve dev_backup.png when requested
    - Return 404 for non-whitelisted files
    - Prevent directory listing
    - Implement caching for performance
    - _Requirements: 4.1, 4.2, 4.3, 11.2, 11.3_
  
  - [x] 7.5 Implement admin portal route (GET /admin_portal)
    - Parse access query parameter
    - Call validateAccess function
    - Return flag when authorized=true
    - Return denial message when authorized=false
    - Return 400 for missing parameter
    - Log all access attempts
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.6, 10.6_
  
  - [ ]* 7.6 Write integration test for complete challenge flow
    - Test downloading logs
    - Test finding correct clue in logs
    - Test downloading image
    - Test accessing admin portal with access=user (denied)
    - Test accessing admin portal with access=admin (flag returned)
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 8. Implement security controls
  - [x] 8.1 Add error handling middleware
    - Implement global error handler
    - Sanitize error messages to prevent information leakage
    - Return appropriate HTTP status codes
    - _Requirements: 10.7, 12.1, 12.2, 12.3, 12.5_
  
  - [x] 8.2 Implement request logging
    - Log all admin portal access attempts with timestamp and parameters
    - Log file access attempts
    - _Requirements: 10.6_
  
  - [ ]* 8.3 Write security bypass tests
    - Test direct access to clue.txt returns 404
    - Test directory listing attempts return 403
    - Test path traversal attempts are blocked
    - Test flag never in HTML/JS/comments
    - _Requirements: 6.7, 9.5, 10.1, 10.4, 8.2, 8.3, 8.4_

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Server initialization and startup
  - [x] 10.1 Implement server startup script
    - Pre-generate log files on startup
    - Embed steganography in image on startup
    - Create zip archive on startup
    - Verify all challenge files exist
    - _Requirements: 3.1, 6.1, 11.5_
  
  - [x] 10.2 Add server configuration
    - Configure port (default 3000)
    - Configure file paths for challenge files
    - Configure rate limiting parameters
    - _Requirements: 11.1, 10.5_
  
  - [x] 10.3 Create startup validation
    - Verify steghide is installed
    - Verify all required directories exist
    - Verify challenge files are properly generated
    - _Requirements: 13.2_

- [x] 11. Performance optimization
  - [x] 11.1 Implement file caching
    - Cache server_logs.zip in memory
    - Cache dev_backup.png in memory
    - Implement cache invalidation strategy
    - _Requirements: 11.2, 11.3, 11.4_
  
  - [ ]* 11.2 Write performance tests
    - Test response times under load
    - Test concurrent user handling (50+ users)
    - _Requirements: 11.1, 11.3, 11.4_

- [x] 12. Deployment preparation
  - [x] 12.1 Create Dockerfile
    - Base image with Node.js 18+
    - Install steghide in container
    - Copy application files
    - Expose port 3000
    - _Requirements: 13.1, 13.2, 13.5_
  
  - [x] 12.2 Create docker-compose.yml
    - Define service configuration
    - Configure port mapping
    - Configure volume mounts if needed
    - _Requirements: 13.5_
  
  - [x] 12.3 Create README with setup instructions
    - Document prerequisites (Node.js, steghide)
    - Document installation steps
    - Document how to run the challenge
    - Document how to verify setup
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties from the design
- Integration tests validate the complete challenge workflow
- The challenge uses TypeScript/Node.js with Express.js framework
- Steganography requires steghide to be installed on the system
