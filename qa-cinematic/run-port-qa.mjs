// TW-1050 integration: runtime spot-check of the ported cinematic
// home page against the built site (dist/). Serves nothing itself;
// run an HTTP server on dist/ at 127.0.0.1:8471 first.
// Prepared by Twistor Holdings LLC.
import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const base = "http://127.0.0.1:8471";
const results = {};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base + "/?tier=A", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(6000);
results.tierA = await page.evaluate(() => ({
  tier: document.documentElement.dataset.tier,
  flight: typeof window.__flight === "object" && window.__flight !== null,
  state: document.querySelector(".flight-sticky").dataset.state,
  facts: document.querySelectorAll("#structured-view [data-fact]").length,
}));
await page.screenshot({ path: path.join(here, "port-A-1440-top.png") });
await page.evaluate(() => {
  const track = document.getElementById("flight-track");
  const span = track.offsetHeight - window.innerHeight;
  window.scrollTo(0, track.offsetTop + span * (132 / 228));
});
await page
  .waitForFunction(
    () => document.querySelector(".flight-sticky").dataset.state === "trades",
    null,
    { timeout: 30000 },
  )
  .catch(() => {});
results.tradesState = await page.evaluate(
  () => document.querySelector(".flight-sticky").dataset.state,
);
await page.screenshot({ path: path.join(here, "port-A-1440-trades.png") });

const mob = await browser.newPage({ viewport: { width: 375, height: 812 } });
await mob.goto(base + "/?tier=A", { waitUntil: "load", timeout: 60000 });
await mob.waitForTimeout(5000);
await mob.screenshot({ path: path.join(here, "port-A-375-top.png") });
results.mobileFlight = await mob.evaluate(
  () => typeof window.__flight === "object" && window.__flight !== null,
);

const d = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await d.goto(base + "/?tier=D", { waitUntil: "load", timeout: 60000 });
await d.waitForTimeout(1500);
results.tierD = await d.evaluate(() => ({
  tier: document.documentElement.dataset.tier,
  posterSet: getComputedStyle(document.querySelector(".poster-set")).display,
  facts: document.querySelectorAll("#structured-view [data-fact]").length,
}));
await d.screenshot({ path: path.join(here, "port-D-1440-top.png") });
await browser.close();
console.log(JSON.stringify(results, null, 1));
