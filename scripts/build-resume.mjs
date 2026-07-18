// Builds assets/resume.pdf from the live static site using headless Chrome
// (Puppeteer). The site is served locally, rendered under the `print` media
// type so the site's @media print stylesheet takes effect, and then saved as
// A4 PDF. Called from CI on every push and also runnable locally via:
//
//   npm install
//   npm run build:resume

import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outPath = path.join(rootDir, "assets", "resume.pdf");
const port = 8765;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const u = new URL(req.url ?? "/", `http://localhost:${port}`);
        let rel = decodeURIComponent(u.pathname);
        if (rel === "/") rel = "/index.html";

        const filePath = path.normalize(path.join(rootDir, rel));
        if (!filePath.startsWith(rootDir)) {
          res.writeHead(403).end();
          return;
        }

        const data = await fs.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          "Content-Type": mime[ext] ?? "application/octet-stream",
          "Cache-Control": "no-store",
        });
        res.end(data);
      } catch {
        res.writeHead(404).end();
      }
    });
    server.on("error", reject);
    server.listen(port, () => resolve(server));
  });
}

async function main() {
  const server = await startServer();
  console.log(`> serving ${rootDir} at http://localhost:${port}`);

  const browser = await puppeteer.launch({
    headless: "shell",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--font-render-hinting=medium",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1800, deviceScaleFactor: 2 });

    await page.goto(`http://localhost:${port}/`, {
      waitUntil: "networkidle0",
      timeout: 60_000,
    });

    // Make sure Google Fonts have actually loaded before printing so the PDF
    // isn't rendered with a fallback typeface.
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    });

    // Force reveal-on-scroll elements into their final state — otherwise
    // sections that weren't scrolled into view stay at opacity: 0 in the
    // snapshot.
    await page.evaluate(() => {
      document
        .querySelectorAll(".reveal")
        .forEach((el) => el.classList.add("is-visible"));
    });

    // Small settle so any newly-visible layout finishes.
    await new Promise((r) => setTimeout(r, 250));

    // Use "print" media so the site's @media print rules take over.
    await page.emulateMediaType("print");

    await page.pdf({
      path: outPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "12mm",
        right: "14mm",
        bottom: "12mm",
        left: "14mm",
      },
    });

    const stat = await fs.stat(outPath);
    console.log(
      `> wrote ${path.relative(rootDir, outPath)} (${(stat.size / 1024).toFixed(
        1
      )} KB)`
    );
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
