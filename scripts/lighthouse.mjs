import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const URL = "http://localhost:3000/login";
const MIN_SCORE = 0.9;

async function waitForServer(url, retries = 30) {
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await setTimeout(1_000);
  }
  throw new Error(`Server did not become ready at ${url}`);
}

async function run() {
  const server = spawn("npm run start", {
    stdio: "inherit",
    shell: true,
    detached: true,
  });

  try {
    await waitForServer(URL);

    const chrome = await launch({
      chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
    });

    const runnerResult = await lighthouse(URL, {
      port: chrome.port,
      output: "json",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    });

    await chrome.kill();

    if (!runnerResult) {
      throw new Error("Lighthouse did not return a result");
    }

    const categories = runnerResult.lhr.categories;
    const report = Object.entries(categories).map(([key, category]) => ({
      category: key,
      score: Math.round((category.score ?? 0) * 100),
    }));

    console.table(report);

    const failed = report.filter(({ score }) => score < MIN_SCORE * 100);
    if (failed.length > 0) {
      throw new Error(`Lighthouse scores below ${MIN_SCORE * 100}: ${JSON.stringify(failed)}`);
    }

    console.log("✅ Lighthouse scores meet the threshold");
  } finally {
    if (server.pid) {
      try {
        process.kill(-server.pid, "SIGTERM");
      } catch {
        server.kill("SIGTERM");
      }
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
