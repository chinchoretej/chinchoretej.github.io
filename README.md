# Tejas Chinchore — Portfolio

A minimal, modern single-page portfolio site built with plain **HTML, CSS
and JavaScript**. Designed to be shared with recruiters and interviewers.

**Live site:** https://chinchoretej.github.io/

## What's inside

- `index.html` — page structure (Hero, About, Skills, Experience,
  Projects, Education, Contact)
- `styles.css` — modern dark/light theme with gradient accents,
  responsive layout, subtle animations, and a `@media print`
  block that reformats the page as a resume for PDF export
- `script.js` — theme toggle (persisted), scroll reveal, active nav
  highlighting
- `assets/resume.pdf` — downloadable resume, **auto-regenerated on
  every push** by the workflow in `.github/workflows/build-resume.yml`
- `scripts/build-resume.mjs` — Puppeteer script that renders the live
  site to a print-media PDF; used by CI and locally

## Auto-generated resume PDF

The **Download PDF** buttons on the site link directly to
`assets/resume.pdf`. That file is rebuilt automatically from the
current page whenever `index.html`, `styles.css` or `script.js`
changes on `main`:

1. GitHub Actions checks out the repo
2. Installs Puppeteer (bundled Chromium)
3. Runs `npm run build:resume`, which serves the site locally, opens
   it in headless Chrome under the `print` media type, and saves the
   result as an A4 PDF
4. Auto-commits the fresh `assets/resume.pdf` back to `main` (skips
   CI on itself)

To regenerate locally:

```powershell
npm install
npm run build:resume
```

## Run locally

Because it's a static site, any static server works. From this folder:

```powershell
# Python 3
python -m http.server 8000

# or with Node (npx)
npx --yes serve .
```

Then open <http://localhost:8000/>.

## Deploy (GitHub Pages)

This repo is set up to be hosted directly via GitHub Pages from the
`main` branch, at the repo root. Enable it under
**Settings → Pages → Build and deployment → Source: Deploy from a branch →
`main` / `/root`**.

## Contact

- Email: chinchoretej@gmail.com
- Phone: +91 91450 69788
- Location: Pune, India
