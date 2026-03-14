# Requirements Document: The Suspicious Upload CTF Challenge

## Introduction

"The Suspicious Upload" is a web-based Capture The Flag (CTF) challenge designed for university cybersecurity education. The challenge teaches participants three essential security investigation techniques: Linux command-line investigation, steganography extraction, and HTTP parameter manipulation. Participants must complete all three steps sequentially to obtain the final flag. The system is designed with security-first principles to ensure participants cannot bypass the intended solution path while maintaining an educational difficulty level suitable for university students.

## Glossary

- **Challenge_Server**: The web server that hosts the CTF challenge and serves all challenge files
- **Admin_Portal**: The protected endpoint that validates access parameters and returns the flag
- **Log_Generator**: The component responsible for creating realistic log files with embedded clues
- **Steganography_Handler**: The component that embeds and validates hidden data in images
- **Access_Validator**: The component that validates access parameter values and determines authorization
- **Challenge_File**: Any file served by the challenge (logs, images, or web pages)
- **Participant**: A user attempting to solve the CTF challenge
- **Flag**: The secret string that proves challenge completion: flag{developer_upload_compromised}
- **Fake_Clue**: Misleading information in log files that references non-existent files

## Requirements

### Requirement 1: Challenge Landing Page

**User Story:** As a participant, I want to access a clear landing page with instructions, so that I understand how to begin the challenge.

#### Acceptance Criteria

1. WHEN a participant accesses the challenge URL, THE Challenge_Server SHALL serve a landing page with challenge instructions
2. THE Challenge_Server SHALL include a download link for server_logs.zip on the landing page
3. THE Challenge_Server SHALL provide clear instructions describing the challenge scenario
4. THE Challenge_Server SHALL NOT include the flag or solution hints in the landing page source code

### Requirement 2: Log File Distribution

**User Story:** As a participant, I want to download server log files, so that I can investigate them for clues.

#### Acceptance Criteria

1. WHEN a participant requests server_logs.zip, THE Challenge_Server SHALL serve the zip archive
2. THE Challenge_Server SHALL ensure server_logs.zip contains at least three log files
3. THE Challenge_Server SHALL ensure the zip file size is under 1MB for fast downloads
4. WHEN extracted, THE log files SHALL contain logs.txt, access.log, and errors.log

### Requirement 3: Log File Content Generation

**User Story:** As a challenge administrator, I want realistic log files with embedded clues, so that participants practice real-world log investigation skills.

#### Acceptance Criteria

1. THE Log_Generator SHALL create each log file with at least 100 lines of content
2. THE Log_Generator SHALL embed exactly one correct clue referencing "/uploads/dev_backup.png" in logs.txt
3. THE Log_Generator SHALL embed at least three fake clues referencing non-existent files in logs.txt
4. THE Log_Generator SHALL generate all log entries with valid ISO 8601 timestamps
5. THE Log_Generator SHALL ensure timestamps are chronologically ordered within each file
6. THE Log_Generator SHALL create realistic log entry formats matching standard server logs

### Requirement 4: Image File Access

**User Story:** As a participant, I want to download the image file mentioned in the logs, so that I can proceed with steganography analysis.

#### Acceptance Criteria

1. WHEN a participant requests /uploads/dev_backup.png, THE Challenge_Server SHALL serve the PNG image file
2. WHEN a participant requests any other filename in /uploads, THE Challenge_Server SHALL return HTTP 404
3. THE Challenge_Server SHALL prevent directory listing of the /uploads directory
4. THE Challenge_Server SHALL reject requests containing path traversal characters (../)

### Requirement 5: Steganography Password Hint

**User Story:** As a participant, I want to find a hint for the steganography password, so that I can extract the hidden data.

#### Acceptance Criteria

1. WHEN a participant views the page source for dev_backup.png, THE Challenge_Server SHALL include a Base64-encoded HTML comment
2. THE Base64 comment SHALL decode to "Backup password: backup123"
3. THE Challenge_Server SHALL NOT include the password in plain text anywhere in the HTML
4. THE Challenge_Server SHALL NOT include the password in JavaScript code or cookies

### Requirement 6: Steganography Embedding

**User Story:** As a challenge administrator, I want to embed a hidden clue in the image, so that participants practice steganography extraction.

#### Acceptance Criteria

1. THE Steganography_Handler SHALL embed clue.txt into dev_backup.png using the password "backup123"
2. WHEN extracted with the correct password, THE embedded data SHALL contain the text "Admin portal: /admin_portal"
3. WHEN extracted with the correct password, THE embedded data SHALL contain the text "Parameter hint: access=user"
4. WHEN extraction is attempted without a password, THE steghide tool SHALL fail with an error
5. WHEN extraction is attempted with an incorrect password, THE steghide tool SHALL fail with an error
6. THE Steganography_Handler SHALL preserve the visual appearance of the original image
7. THE Challenge_Server SHALL NOT serve clue.txt as a directly accessible file

### Requirement 7: Admin Portal Access Control

**User Story:** As a participant, I want to access the admin portal with different parameters, so that I can discover the correct access method.

#### Acceptance Criteria

1. WHEN a participant accesses /admin_portal without an access parameter, THE Challenge_Server SHALL return HTTP 400 with message "Missing access parameter"
2. WHEN a participant accesses /admin_portal?access=user, THE Access_Validator SHALL return "Access denied. Admins only."
3. WHEN a participant accesses /admin_portal?access=admin, THE Access_Validator SHALL return the flag
4. WHEN a participant provides an access parameter other than "user" or "admin", THE Access_Validator SHALL return "Invalid access parameter"
5. THE Access_Validator SHALL perform case-insensitive comparison of the access parameter
6. THE Access_Validator SHALL trim whitespace from the access parameter before validation

### Requirement 8: Flag Protection

**User Story:** As a challenge administrator, I want the flag to be protected, so that participants cannot obtain it without completing all challenge steps.

#### Acceptance Criteria

1. THE Challenge_Server SHALL only return the flag when the access parameter equals "admin"
2. THE Challenge_Server SHALL NOT include the flag in any HTML source code
3. THE Challenge_Server SHALL NOT include the flag in any JavaScript code
4. THE Challenge_Server SHALL NOT include the flag in any HTML comments
5. THE Challenge_Server SHALL NOT include the flag in HTTP response headers or cookies
6. THE Challenge_Server SHALL generate the flag server-side only when access is validated
7. WHEN access is denied, THE response body SHALL NOT contain any part of the flag string

### Requirement 9: Sequential Challenge Dependency

**User Story:** As a challenge administrator, I want to ensure participants complete all three steps, so that they learn all intended techniques.

#### Acceptance Criteria

1. THE Challenge_Server SHALL require log investigation to discover the image filename
2. THE Challenge_Server SHALL require steganography extraction to discover the admin portal path
3. THE Challenge_Server SHALL require parameter manipulation to obtain the flag
4. THE Challenge_Server SHALL ensure fake clues reference non-existent files to prevent shortcuts
5. WHEN a participant attempts to access clue.txt directly, THE Challenge_Server SHALL return HTTP 404

### Requirement 10: Security Controls

**User Story:** As a challenge administrator, I want robust security controls, so that participants cannot bypass the intended solution path.

#### Acceptance Criteria

1. THE Challenge_Server SHALL validate all file path inputs to prevent path traversal attacks
2. THE Challenge_Server SHALL maintain a whitelist of accessible files
3. WHEN a file is not in the whitelist, THE Challenge_Server SHALL return HTTP 404
4. THE Challenge_Server SHALL disable directory listing for all directories
5. THE Challenge_Server SHALL implement rate limiting on the admin portal endpoint
6. THE Challenge_Server SHALL log all admin portal access attempts
7. THE Challenge_Server SHALL sanitize error messages to prevent information leakage

### Requirement 11: Performance Requirements

**User Story:** As a challenge administrator, I want the challenge to perform well under load, so that multiple participants can compete simultaneously.

#### Acceptance Criteria

1. THE Challenge_Server SHALL support at least 50 concurrent participants
2. THE Challenge_Server SHALL cache static files (logs and images) in memory
3. THE Challenge_Server SHALL respond to file download requests within 500ms
4. THE Challenge_Server SHALL respond to admin portal requests within 200ms
5. THE Log_Generator SHALL pre-generate log files during server startup

### Requirement 12: Error Handling

**User Story:** As a participant, I want clear error messages, so that I understand when I make mistakes without revealing the solution.

#### Acceptance Criteria

1. WHEN a participant requests a non-existent file, THE Challenge_Server SHALL return HTTP 404 with message "File not found"
2. WHEN a participant attempts directory listing, THE Challenge_Server SHALL return HTTP 403 with message "Forbidden"
3. WHEN a participant provides an invalid file path, THE Challenge_Server SHALL return HTTP 400 with message "Invalid file path"
4. WHEN a participant uses an incorrect steghide password, THE steghide tool SHALL display "could not extract any data with that passphrase!"
5. THE Challenge_Server SHALL NOT include stack traces or internal paths in error messages

### Requirement 13: Deployment and Dependencies

**User Story:** As a challenge administrator, I want clear deployment requirements, so that I can set up the challenge correctly.

#### Acceptance Criteria

1. THE Challenge_Server SHALL run on Node.js version 18 or higher
2. THE Challenge_Server SHALL require steghide version 0.5.1 or higher to be installed on the system
3. THE Challenge_Server SHALL use Express.js version 4.18 or higher for web routing
4. THE Challenge_Server SHALL use express-rate-limit version 6.7 or higher for rate limiting
5. THE Challenge_Server SHALL run in an isolated containerized environment
6. THE Challenge_Server SHALL NOT require external services or databases
