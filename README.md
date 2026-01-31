# Lahiru Nuwanga — Portfolio

Professional, responsive portfolio website (HTML + CSS + JavaScript) with light/dark theme, mobile navigation, and sections for skills, projects, certifications, and contact.

## Run locally

### Option A (simple)
- Open `index.html` in your browser.

### Option B (recommended: local server)
From this folder, run one of these:

- **Python**:
  - `python -m http.server 5500`
  - then open `http://localhost:5500`

- **Node** (if installed):
  - `npx serve .`

## Customize content

- **LinkedIn URL**: update in `index.html` and `script.js` if needed.
- **Profile photo**: replace the initials block in the hero card with an `<img>` (recommended name: `assets/profile.jpg`).
- **Video**: copy your MP4 into `assets/videos/` and ensure the filename matches what is referenced in `index.html`.
- **Certificates**: put PDFs/images in `assets/certificates/` and add links in the Certifications section in `index.html`.
- **Projects**: add GitHub/demo links if you have them (easy to add under each project card).

## Deploy

### GitHub Pages
1. Create a GitHub repo and push these files.
2. In GitHub: **Settings → Pages**
3. Select **Deploy from a branch** → branch `main` → folder `/root`

### Netlify / Vercel
Upload the folder as a static site (no build command needed).

