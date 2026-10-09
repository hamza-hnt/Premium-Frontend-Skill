import { chromium, expect, type Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { spawn, type ChildProcess } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { args, cli, json, ROOT, readCatalogue } from "../scripts/lib/core.js";

async function waitForServer(url: string, child: ChildProcess) {
  for (let i = 0; i < 150; i++) {
    if (child.exitCode !== null)
      throw new Error(`Server exited before readiness: ${url}`);
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Server did not become ready: ${url}`);
}
async function keyboardFocus(page: Page) {
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    outline: document.activeElement
      ? getComputedStyle(document.activeElement).outlineStyle
      : "none",
  }));
  expect(["A", "BUTTON", "INPUT", "SELECT"]).toContain(focused.tag);
  expect(focused.outline).not.toBe("none");
}
await cli(async () => {
  const a = args(["vite-project", "next-project", "output"]);
  const vite = resolve(
    (a["vite-project"] as string) ?? resolve(ROOT, ".local/vite-consumer"),
  );
  const next = resolve(
    (a["next-project"] as string) ?? resolve(ROOT, ".local/next-consumer"),
  );
  const out = resolve(
    (a.output as string) ?? resolve(ROOT, "artifacts/browser"),
  );
  await mkdir(out, { recursive: true });
  const children: ChildProcess[] = [];
  let browser;
  const logs: Record<string, string> = {};
  const cases: Record<string, unknown>[] = [];
  try {
    for (const [name, project, bin, params] of [
      [
        "vite",
        vite,
        "vite/bin/vite.js",
        ["preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"],
      ],
      [
        "next",
        next,
        "next/dist/bin/next",
        ["start", "--hostname", "127.0.0.1", "--port", "4174"],
      ],
    ] as const) {
      const url = `http://127.0.0.1:${name === "vite" ? 4173 : 4174}`;
      try {
        await fetch(url, { signal: AbortSignal.timeout(400) });
        throw new Error(`Port already occupied: ${url}`);
      } catch (e) {
        if ((e as Error).message.startsWith("Port already")) throw e;
      }
      const child = spawn(
        process.execPath,
        [resolve(project, "node_modules", bin), ...params],
        {
          cwd: project,
          env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      children.push(child);
      logs[name] = "";
      child.stdout?.on("data", (x) => (logs[name] += x));
      child.stderr?.on("data", (x) => (logs[name] += x));
      await waitForServer(url, child);
    }
    browser = await chromium.launch({ headless: true });
    for (const width of [390, 768, 1440])
      for (const reduced of [false, true])
        for (const route of ["marketing", "dashboard", "settings", "next"]) {
          const label = `${route}-${width}-${reduced ? "reduced" : "motion"}`;
          const errors: string[] = [];
          const context = await browser.newContext({
            viewport: { width, height: 1000 },
            reducedMotion: reduced ? "reduce" : "no-preference",
          });
          const page = await context.newPage();
          page.on("pageerror", (e) => errors.push(e.message));
          page.on("console", (m) => {
            if (m.type() === "error") errors.push(m.text());
          });
          const report: Record<string, unknown> = {
            label,
            width,
            reduced,
            route,
            errors,
          };
          try {
            const url =
              route === "next"
                ? "http://127.0.0.1:4174"
                : `http://127.0.0.1:4173/${route === "marketing" ? "" : route}`;
            await page.goto(url, { waitUntil: "networkidle" });
            await page.waitForTimeout(1000);
            await expect(page.getByRole("heading", { level: 1 })).toHaveCount(
              1,
            );
            await keyboardFocus(page);
            const dimensions = await page.evaluate(() => ({
              viewport: innerWidth,
              document: document.documentElement.scrollWidth,
            }));
            report.dimensions = dimensions;
            expect(dimensions.document).toBeLessThanOrEqual(width + 1);
            if (route === "marketing") {
              await expect(
                page.getByRole("link", { name: "Find your rhythm" }),
              ).toHaveAttribute("href", "/dashboard");
              if (reduced)
                await expect(page.getByTestId("motion-canvas")).toHaveCount(0);
              else {
                await expect(
                  page.getByTestId("motion-canvas").locator("canvas"),
                ).toHaveCount(1);
                await page
                  .getByRole("button", { name: "Pause illustration" })
                  .click();
                await expect(page.getByTestId("motion-canvas")).toHaveCount(0);
                await page
                  .getByRole("button", { name: "Resume illustration" })
                  .click();
              }
              await page.locator("#approach").scrollIntoViewIfNeeded();
              await page.waitForTimeout(450);
              await page.evaluate(() => scrollTo(0, 0));
            } else if (route === "dashboard") {
              await page
                .getByRole("button", { name: "Month", exact: true })
                .click();
              await expect(page.locator(".chart-summary")).toContainText("512");
              await page.getByLabel("Filter projects").fill("Onda");
              await expect(page.locator("tbody tr")).toHaveCount(1);
              await page.getByLabel("Filter projects").fill("nothing-matches");
              await expect(
                page.getByText("No matching projects. Try another name."),
              ).toBeVisible();
              await page.getByLabel("Filter projects").fill("");
              await page
                .getByRole("button", { name: "Week", exact: true })
                .click();
              await page
                .getByRole("button", { name: "Studio summary" })
                .click();
              await expect(page.getByRole("status")).toContainText(
                "4 active projects",
              );
            } else if (route === "settings") {
              const toggle = page.getByRole("switch", {
                name: "Weekly studio digest",
              });
              await expect(toggle).toBeChecked();
              await toggle.focus();
              await page.keyboard.press("Space");
              await expect(toggle).not.toBeChecked();
              await page.keyboard.press("Space");
              await expect(toggle).toBeChecked();
              await page
                .getByLabel("Studio name", { exact: true })
                .fill("Willow & Co.");
              await page.getByRole("button", { name: "Save changes" }).click();
              await expect(page.getByRole("status")).toContainText(
                "Changes saved for Willow & Co.",
              );
              await page
                .getByLabel("Contact email", { exact: true })
                .fill("invalid");
              await page.getByRole("button", { name: "Save changes" }).click();
              expect(
                await page
                  .getByLabel("Contact email", { exact: true })
                  .evaluate((e: HTMLInputElement) => e.validity.valid),
              ).toBe(false);
              await page
                .getByLabel("Contact email", { exact: true })
                .fill("alex@willow.example");
              if (reduced)
                await expect(page.locator(".native-toggle")).toHaveCount(2);
            } else {
              const toggle = page.getByRole("switch", { name: "Monday recap" });
              await toggle.focus();
              await page.keyboard.press("Space");
              await expect(toggle).toBeChecked();
              await page
                .getByRole("button", { name: "Save preferences" })
                .click();
              await expect(page.getByRole("status")).toHaveText(
                "Digest enabled.",
              );
            }
            await page.evaluate(() => {
              (document.activeElement as HTMLElement)?.blur();
              scrollTo(0, 0);
            });
            const axe = await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
              .analyze();
            report.axe = {
              violations: axe.violations.map((v) => ({
                id: v.id,
                impact: v.impact,
                description: v.description,
                nodes: v.nodes.map((n) => ({
                  target: n.target,
                  summary: n.failureSummary,
                })),
              })),
              incomplete: axe.incomplete.map((v) => v.id),
              passes: axe.passes.length,
            };
            await page.screenshot({
              path: resolve(out, `${label}.png`),
              fullPage: true,
            });
            expect(errors).toEqual([]);
            expect(axe.violations.map((v) => v.id)).toEqual([]);
            report.passed = true;
          } catch (e) {
            report.passed = false;
            report.failure = (e as Error).message;
            await page.screenshot({
              path: resolve(out, `${label}-failure.png`),
              fullPage: true,
            });
          }
          cases.push(report);
          console.log(
            `${report.passed ? "PASS" : "FAIL"} ${label}${report.failure ? `: ${String(report.failure).slice(0, 180)}` : ""}`,
          );
          await context.close();
        }
    for (const width of [390, 768, 1440]) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        reducedMotion: "reduce",
      });
      await page.goto("http://127.0.0.1:4173/?baseline=1", {
        waitUntil: "networkidle",
      });
      await page.screenshot({
        path: resolve(out, `marketing-${width}-baseline.png`),
        fullPage: true,
      });
      await page.close();
    }
    const catalogue = await readCatalogue();
    const report = {
      checkedAt: new Date().toISOString(),
      browser: browser.version(),
      revision: catalogue.revision,
      uniqueComponents: [
        "react-bits:blur-text",
        "react-bits:count-up",
        "react-bits:fade-content",
        "react-bits:spotlight-card",
        "react-bits:shape-grid",
        "react-bits:squish-switch",
      ],
      variant: "TS-TW",
      cases,
      summary: {
        total: cases.length,
        passed: cases.filter((c) => c.passed).length,
        failed: cases.filter((c) => !c.passed).length,
        screenshots: 27,
      },
      serverLogs: logs,
    };
    await writeFile(resolve(out, "report.json"), json(report));
    if (report.summary.failed)
      throw new Error(
        `${report.summary.failed} browser cases failed; see ${resolve(out, "report.json")}`,
      );
  } finally {
    await browser?.close();
    for (const child of children) child.kill("SIGTERM");
  }
});
