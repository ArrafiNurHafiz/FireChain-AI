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
  console.log(`[RECORDING] Starting ${name}...`);
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
  // Scene 1: Dashboard (~33s)
  await recordScene("scene1", 33500, async (page) => {
    await page.goto("http://localhost:8080/", { waitUntil: "networkidle" });
    await sleep(2500);

    // Scroll slightly down to showcase KPI cards
    await page.evaluate(() => window.scrollBy({ top: 120, behavior: "smooth" }));
    await sleep(3500);

    // Highlight weather & FWI section
    await page.evaluate(() => window.scrollBy({ top: 380, behavior: "smooth" }));
    await sleep(4000);

    // Hover over Canadian FWI engine
    const fwiCard = await page.$("section:has-text('Analisis Risiko AI')");
    if (fwiCard) await fwiCard.hover();
    await sleep(4000);

    // Scroll back top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await sleep(2000);

    // Click "Sinkronkan NASA" button
    const syncBtn = await page.$("button:has-text('Sinkronkan NASA')");
    if (syncBtn) {
      await syncBtn.hover();
      await sleep(1000);
      await syncBtn.click();
    }
    await sleep(5000);
  });

  // Scene 2: Live Map (~35s)
  await recordScene("scene2", 35500, async (page) => {
    await page.goto("http://localhost:8080/map", { waitUntil: "networkidle" });
    await sleep(3500);

    // Click "Prioritas Kritis (>20 MW)" filter
    const critBtn = await page.$("button:has-text('Prioritas Kritis')");
    if (critBtn) {
      await critBtn.hover();
      await sleep(1000);
      await critBtn.click();
    }
    await sleep(4000);

    // Click KalTeng smooth flyTo
    const kalTengBtn = await page.$("button:has-text('KalTeng')");
    if (kalTengBtn) {
      await kalTengBtn.hover();
      await sleep(1000);
      await kalTengBtn.click();
    }
    await sleep(4500);

    // Click a fire marker on canvas / map
    const canvas = await page.$("canvas.leaflet-zoom-animated");
    if (canvas) {
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width * 0.48, box.y + box.height * 0.52);
      }
    }
    await sleep(4000);

    // Recenter
    const recenterBtn = await page.$("button:has-text('Semua Kalimantan')");
    if (recenterBtn) {
      await recenterBtn.hover();
      await sleep(1000);
      await recenterBtn.click();
    }
    await sleep(5000);
  });

  // Scene 3: Incident Reporting (~32s)
  await recordScene("scene3", 32500, async (page) => {
    await page.goto("http://localhost:8080/reports", { waitUntil: "networkidle" });
    await sleep(2500);

    // Open create report modal
    const openBtn = await page.$("#btn-open-create-report");
    if (openBtn) {
      await openBtn.hover();
      await sleep(1000);
      await openBtn.click();
    }
    await sleep(2000);

    // Fill form
    await page.fill("input[placeholder*='Titik Api']", "Titik Api Gambut Katingan Hilir KM 18");
    await sleep(800);
    await page.fill("input[placeholder*='Desa Hampalit']", "Kawasan Gambut Mentaya Hilir");
    await sleep(800);
    await page.fill("textarea", "Deteksi asap tebal terkonfirmasi visual ground-check. Api menjalar ke kedalaman gambut 1.5m.");
    await sleep(800);
    await page.fill("input[placeholder='Nama Lengkap']", "Kapten Manggala Agni Arrafi");
    await sleep(1200);

    // Submit
    const submitBtn = await page.$("form button[type='submit']");
    if (submitBtn) {
      await submitBtn.hover();
      await sleep(800);
      await submitBtn.click();
    }
    await sleep(3500);

    // Open first report details
    const detailBtn = await page.$("tbody tr:first-child button:has-text('Detail & Aksi')");
    if (detailBtn) {
      await detailBtn.hover();
      await sleep(1000);
      await detailBtn.click();
      await sleep(2000);

      // Dispatch team
      const dispatchBtn = await page.$("button:has-text('Tugaskan Tim')");
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

  // Scene 4: Blockchain Audit & Carbon Impact (~34s)
  await recordScene("scene4", 34500, async (page) => {
    await page.goto("http://localhost:8080/audit", { waitUntil: "networkidle" });
    await sleep(2500);

    // Click "Verifikasi Integritas Rantai"
    const verifyBtn = await page.$("button:has-text('Verifikasi Integritas')");
    if (verifyBtn) {
      await verifyBtn.hover();
      await sleep(1000);
      await verifyBtn.click();
    }
    await sleep(4500);

    // Scroll to Solidity contract
    await page.evaluate(() => window.scrollBy({ top: 380, behavior: "smooth" }));
    await sleep(3000);

    // Navigate to /emissions
    await page.goto("http://localhost:8080/emissions", { waitUntil: "networkidle" });
    await sleep(2500);

    // Interact with Avoided Emissions slider
    const slider = await page.$("input[type='range']");
    if (slider) {
      await slider.hover();
      await sleep(1000);
      await page.evaluate(() => {
        const s = document.querySelector("input[type='range']") as HTMLInputElement;
        if (s) {
          s.value = "36";
          s.dispatchEvent(new Event("input", { bubbles: true }));
          s.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    }
    await sleep(4000);

    // Scroll down to scientific references
    await page.evaluate(() => window.scrollBy({ top: 250, behavior: "smooth" }));
    await sleep(4000);
  });

  console.log("[ALL SCENES RECORDED SUCCESSFULLY!]");
}

main();
