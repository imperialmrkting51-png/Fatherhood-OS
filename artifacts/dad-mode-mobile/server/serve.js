/**
 * Production server for the Dad Mode Mobile app.
 *
 * Routes:
 *   Browser (no expo-platform header) → React Native Web SPA from web-build/
 *   expo-platform: ios/android         → Expo Go native manifest from static-build/
 *   /_expo/** and other assets         → served from web-build/ or static-build/
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const STATIC_ROOT = path.resolve(__dirname, "..", "static-build");
const WEB_ROOT = path.resolve(__dirname, "..", "web-build");
const basePath = (process.env.BASE_PATH || "/").replace(/\/+$/, "");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".otf":  "font/otf",
  ".map":  "application/json",
  ".webp": "image/webp",
};

function mime(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

// ── Web SPA helpers ──────────────────────────────────────────────────────────

const webIndexPath = path.join(WEB_ROOT, "index.html");
const hasWebBuild = () => fs.existsSync(webIndexPath);

function serveWebFile(urlPath, res) {
  const safe = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(WEB_ROOT, safe);

  if (!filePath.startsWith(WEB_ROOT)) {
    res.writeHead(403); res.end("Forbidden"); return;
  }

  if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
    res.writeHead(200, { "content-type": mime(filePath) });
    res.end(fs.readFileSync(filePath));
    return;
  }

  // SPA fallback — serve index.html for any unmatched route (deep links)
  if (hasWebBuild()) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(fs.readFileSync(webIndexPath));
    return;
  }

  res.writeHead(404); res.end("Not Found");
}

// ── Native Expo Go helpers ───────────────────────────────────────────────────

function serveManifest(platform, res) {
  const manifestPath = path.join(STATIC_ROOT, platform, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: `Manifest not found: ${platform}` }));
    return;
  }
  res.writeHead(200, {
    "content-type": "application/json",
    "expo-protocol-version": "1",
    "expo-sfv-version": "0",
  });
  res.end(fs.readFileSync(manifestPath, "utf-8"));
}

function serveNativeFile(urlPath, res) {
  const safe = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(STATIC_ROOT, safe);

  if (!filePath.startsWith(STATIC_ROOT)) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404); res.end("Not Found"); return;
  }

  res.writeHead(200, { "content-type": mime(filePath) });
  res.end(fs.readFileSync(filePath));
}

// ── Server ───────────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  let pathname = url.pathname;

  // Strip base path prefix (e.g. /mobile → /)
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }

  const platform = req.headers["expo-platform"];
  const isNativeClient = platform === "ios" || platform === "android";

  // Native Expo Go manifest request
  if (isNativeClient && (pathname === "/" || pathname === "/manifest")) {
    return serveManifest(platform, res);
  }

  // Native asset requests (bundle JS, fonts, images)
  if (isNativeClient) {
    return serveNativeFile(pathname, res);
  }

  // All browser requests → React Native Web SPA
  serveWebFile(pathname, res);
});

const port = parseInt(process.env.PORT || "3000", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`Serving on port ${port}`);
  console.log(`  Web SPA:      ${hasWebBuild() ? "✓ web-build/" : "✗ not built"}`);
  console.log(`  Native (Go):  ${fs.existsSync(STATIC_ROOT) ? "✓ static-build/" : "✗ not built"}`);
});
