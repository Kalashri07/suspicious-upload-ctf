# Steganography Setup Guide

## For Challenge Creators

The challenge no longer requires steghide installation. Participants will use online tools to decode the steganography.

### How to Embed Steganography in Your Image

1. **Prepare your image**: Save your penguin image (or any image) as `uploads/dev_backup.jpg`

2. **Use an online steganography tool** to embed the clue:
   - **Tool 1**: https://stylesuxx.github.io/steganography/
   - **Tool 2**: https://futureboy.us/stegano/encinput.html
   - **Tool 3**: https://www.mobilefish.com/services/steganography/steganography.php

3. **Clue to embed**:
   ```
   Admin portal: /admin_portal
   Parameter hint: access=user
   ```

4. **Save the output** as `uploads/dev_backup.jpg` (replace the original)

5. **Start the server** - it will use your image with embedded steganography

### Alternative: Provide the Image Directly

If you don't want to embed steganography:
- Just place your image as `uploads/dev_backup.jpg`
- The server will use it as-is
- You can provide the clue through other means (e.g., in the image metadata, or as a separate hint)

## For Participants

Participants will:
1. Download the image from the challenge
2. Use online steganography tools to decode:
   - https://stylesuxx.github.io/steganography/
   - https://futureboy.us/stegano/decinput.html
   - https://www.mobilefish.com/services/steganography/steganography.php
3. Extract the hidden clue
4. Use the clue to access the admin portal

## Running the Challenge

No special setup needed! Just run:

```bash
# Build and start
npm run build
npm start

# Or with Docker
docker-compose up -d
```

The server will automatically:
- ✅ Generate log files
- ✅ Use your image (if present in uploads/)
- ✅ Serve the challenge

No steghide installation required!
