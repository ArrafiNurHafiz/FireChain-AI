import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

const OUT_DIR = path.resolve("./recordings");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function recordScene(
  name: string,
  targetDurationMs: number,
  action: (page: any) => Promise<void>
) {
  console.log(`[RECORDING] Starting ${name} (target: ${targetDurationMs}ms)...`);
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();
  const startTime = Date.now();

  try {
    await action(page);
    const elapsed = Date.now() - startTime;
    const remaining = targetDurationMs - elapsed;
    if (remaining > 0) {
      console.log(`[RECORDING] Padding ${remaining}ms to match audio pacing...`);
      await sleep(remaining);
    }
  } catch (err) {
    console.error(`[ERROR] in ${name}:`, err);
  } finally {
    await page.close();
    const video = page.video();
    const videoPath = video ? await video.path() : null;
    await context.close();
    await browser.close();

    if (videoPath) {
      const finalDest = path.join(OUT_DIR, `${name}.webm`);
      fs.renameSync(videoPath, finalDest);
      console.log(`[RECORDING] ${name} saved to ${finalDest}`);
    }
  }
}

async function main() {
  // Scene 1: Dashboard (~37.2s)
  await recordScene("scene1", 37200, async (page) => {
    await page.goto("http://localhost:8080/", { waitUntil: "networkidle" });
    await sleep(3000);

    // Scroll slightly down to showcase 4 live KPI cards
    await page.evaluate(() => window.scrollBy({ top: 140, behavior: "smooth" }));
    await sleep(3500);

    // Scroll down to showcase Real-Time Weather & AI Neural Net (PeatNet)
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: "smooth" }));
    await sleep(4000);

    // Hover over AI PeatNet card
    const aiCard = await page.$("h4:has-text('AI Neural Network')");
    if (aiCard) await aiCard.hover();
    await sleep(4000);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await sleep(2500);

    // Click "Sync NASA FIRMS" button
    const syncBtn = await page.$("button:has-text('Sync NASA FIRMS')");
    if (syncBtn) {
      await syncBtn.hover();
      await sleep(1000);
      await syncBtn.click();
    }
    await sleep(6000);
  });

  // Scene 2: Live Map (~35.6s)
  await recordScene("scene2", 35600, async (page) => {
    await page.goto("http://localhost:8080/map", { waitUntil: "networkidle" });
    await sleep(3500);

    // Click "Critical (>20 MW)" filter button
    const critBtn = await page.$("button:has-text('Critical')");
    if (critBtn) {
      await critBtn.hover();
      await sleep(1000);
      await critBtn.click();
    }
    await sleep(4000);

    // Click "Central Kal" smooth flyTo
    const centralKalBtn = await page.$("button:has-text('Central Kal')");
    if (centralKalBtn) {
      await centralKalBtn.hover();
      await sleep(1000);
      await centralKalBtn.click();
    }
    await sleep(4500);

    // Click on canvas to select a hotspot
    const canvas = await page.$("canvas.leaflet-zoom-animated");
    if (canvas) {
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width * 0.49, box.y + box.height * 0.51);
      }
    }
    await sleep(4500);

    // Recenter
    const recenterBtn = await page.$("button:has-text('All Kalimantan')");
    if (recenterBtn) {
      await recenterBtn.hover();
      await sleep(1000);
      await recenterBtn.click();
    }
    await sleep(5000);
  });

  // Scene 3: Incident Reporting (~34.2s)
  await recordScene("scene3", 34200, async (page) => {
    await page.goto("http://localhost:8080/reports", { waitUntil: "networkidle" });
    await sleep(3000);

    // Open create report modal
    const openBtn = await page.$("#btn-open-create-report");
    if (openBtn) {
      await openBtn.hover();
      await sleep(1000);
      await openBtn.click();
    }
    await sleep(2500);

    // Fill form in English
    await page.fill("input[placeholder*='Subterranean']", "Subterranean Peat Fire in Katingan Peat Reserve");
    await sleep(800);
    await page.fill("input[placeholder*='Hampalit Village']", "Hampalit Village, Katingan Hilir District");
    await sleep(800);
    await page.fill("textarea", "Dense smoke and subterranean smoldering confirmed on 2.5m peat horizon. Joint taskforce executing canal water trenching.");
    await sleep(800);
    await page.fill("input[placeholder='Full Name']", "Commander Budi Santoso");
    await sleep(1200);

    // Submit
    const submitBtn = await page.$("form button[type='submit']");
    if (submitBtn) {
      await submitBtn.hover();
      await sleep(800);
      await submitBtn.click();
    }
    await sleep(4000);

    // Open first report details
    const detailBtn = await page.$("tbody tr:first-child button:has-text('Detail & Actions')");
    if (detailBtn) {
      await detailBtn.hover();
      await sleep(1000);
      await detailBtn.click();
      await sleep(2500);

      // Dispatch team
      const dispatchBtn = await page.$("button:has-text('Dispatch Taskforce')");
      if (dispatchBtn) {
        await dispatchBtn.hover();
        await sleep(800);
        await dispatchBtn.click();
      }
      await sleep(2500);
      // Close modal
      const closeBtn = await page.$(".fixed.inset-0 button.text-muted-foreground");
      if (closeBtn) await closeBtn.click();
    }
    await sleep(3000);
  });

  // Scene 4: Blockchain Audit & Carbon Impact (~39.5s)
  await recordScene("scene4", 39500, async (page) => {
    await page.goto("http://localhost:8080/audit", { waitUntil: "networkidle" });
    await sleep(3000);

    // Click "Verify Cryptographic Chain"
    const verifyBtn = await page.$("button:has-text('Verify Cryptographic Chain')");
    if (verifyBtn) {
      await verifyBtn.hover();
      await sleep(1000);
      await verifyBtn.click();
    }
    await sleep(5500);

    // Scroll to Solidity contract
    await page.evaluate(() => window.scrollBy({ top: 380, behavior: "smooth" }));
    await sleep(3500);

    // Navigate to /emissions
    await page.goto("http://localhost:8080/emissions", { waitUntil: "networkidle" });
    await sleep(3000);

    // Interact with Avoided Emissions slider
    const slider = await page.$("input[type='range']");
    if (slider) {
      await slider.hover();
      await sleep(1000);
      await page.evaluate(() => {
        const s = document.querySelector("input[type='range']") as HTMLInputElement;
        if (s) {
          s.value = "38";
          s.dispatchEvent(new Event("input", { bubbles: true }));
          s.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    }
    await sleep(4500);

    // Scroll down to scientific references
    await page.evaluate(() => window.scrollBy({ top: 250, behavior: "smooth" }));
    await sleep(4500);
  });

  console.log("[ALL SCENES RECORDED SUCCESSFULLY IN ENGLISH!]");
}

main();
