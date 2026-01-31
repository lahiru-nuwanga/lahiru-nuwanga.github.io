# Scripts

## Remove background noise from Recording.m4a

This script uses **FFmpeg** to reduce background noise (hiss, hum, etc.) from `assets/Recording.m4a` and saves a cleaned version as `assets/Recording-clean.m4a`. The web app uses the cleaned file for the Auto Tour voice when available.

### Requirements

- **FFmpeg** — [Download](https://ffmpeg.org/download.html) and add it to your PATH.

### How to run

1. Install FFmpeg (e.g. via [winget](https://winget.run/pkg/Gyan.FFmpeg) or [choco](https://chocolatey.org/packages/ffmpeg)).
2. From the project root, run:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\remove-background-noise.ps1
   ```

3. The cleaned file is written to `assets/Recording-clean.m4a`. The Auto Tour will use it automatically.

### Fallback

If `Recording-clean.m4a` is missing, the Auto Tour uses `Recording.m4a` instead.
