/**
 * Builds the Expo web (React Native Web) static export.
 * Output goes to web-build/ and is served by server/serve.js for browser visitors.
 */
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const projectRoot = path.resolve(__dirname, "..");

function getPublicDomain() {
  const raw =
    process.env.REPLIT_INTERNAL_APP_DOMAIN ||
    process.env.REPLIT_DEV_DOMAIN ||
    process.env.EXPO_PUBLIC_DOMAIN ||
    "";
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

async function main() {
  const domain = getPublicDomain();
  console.log("Building Expo web export...");
  if (domain) console.log(`Domain: ${domain}`);

  const webBuildDir = path.join(projectRoot, "web-build");
  if (fs.existsSync(webBuildDir)) {
    fs.rmSync(webBuildDir, { recursive: true });
  }

  await new Promise((resolve, reject) => {
    const proc = spawn(
      "pnpm",
      ["exec", "expo", "export", "--platform", "web", "--output-dir", "web-build"],
      {
        stdio: "inherit",
        cwd: projectRoot,
        env: {
          ...process.env,
          EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
            process.env.CLERK_PUBLISHABLE_KEY ||
            process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
            "",
          EXPO_PUBLIC_DOMAIN: domain,
          NODE_ENV: "production",
        },
      }
    );

    proc.on("close", (code) => {
      if (code === 0) {
        console.log("Web export complete!");
        resolve();
      } else {
        reject(new Error(`expo export --platform web failed (exit ${code})`));
      }
    });

    proc.on("error", reject);
  });
}

main().catch((err) => {
  console.error("Web build failed:", err.message);
  process.exit(1);
});
