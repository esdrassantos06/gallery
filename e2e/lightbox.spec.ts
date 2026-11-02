import { expect, test, type Locator, type Page } from "@playwright/test";

const gallery = (page: Page) => page.getByRole("region", { name: "Default look" });
const dialog = (page: Page) => page.getByRole("dialog", { name: "Image viewer" });

async function open(page: Page, n: number): Promise<Locator> {
  const label = `Open Sample ${String(n).padStart(2, "0")}`;
  await gallery(page).getByRole("button", { name: label }).click();
  const viewer = dialog(page);
  await expect(viewer).toBeVisible();
  await expect(page.locator(".eg-root")).toHaveAttribute("data-state", "open");
  return viewer;
}

/** Drags across the stage with a real touch on touch devices and the mouse elsewhere. */
async function drag(page: Page, dx: number, dy: number) {
  const box = page.viewportSize();
  if (!box) throw new Error("no viewport");
  const x = box.width / 2;
  const y = box.height / 2;
  const steps = 8;
  if (test.info().project.name === "mobile") {
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", px: number, py: number) =>
      cdp.send("Input.dispatchTouchEvent", {
        type,
        touchPoints: type === "touchEnd" ? [] : [{ x: px, y: py }],
      });
    await touch("touchStart", x, y);
    for (let i = 1; i <= steps; i++)
      await touch("touchMove", x + (dx * i) / steps, y + (dy * i) / steps);
    await touch("touchEnd", x + dx, y + dy);
    await cdp.detach();
    return;
  }
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++)
    await page.mouse.move(x + (dx * i) / steps, y + (dy * i) / steps);
  await page.mouse.up();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("opens from a thumbnail as a focused, labelled modal dialog", async ({ page }) => {
  const viewer = await open(page, 3);
  await expect(viewer).toHaveAttribute("aria-modal", "true");
  await expect(viewer).toBeFocused();
  await expect(viewer.locator(".eg-counter")).toHaveText("3 / 12");
  await expect(viewer.getByRole("heading", { name: "Sample 03 · Square study" })).toBeVisible();
  await expect(viewer.locator("[aria-live='polite']")).toHaveText(
    "Image 3 of 12: Sample 03 · Square study",
  );
  for (const name of ["Close", "Previous image", "Next image"]) {
    await expect(viewer.getByRole("button", { name })).toBeVisible();
  }
});

test("loads the current image fitted inside the viewport and only mounts the preload window", async ({
  page,
}) => {
  const viewer = await open(page, 6);
  const image = viewer.locator(".eg-slide[data-current] .eg-image");
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth))
    .toBeGreaterThan(0);
  const box = await image.boundingBox();
  const viewport = page.viewportSize();
  expect(box && viewport).toBeTruthy();
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 1);
  expect(box!.height).toBeLessThanOrEqual(viewport!.height);
  await expect(viewer.locator(".eg-image")).toHaveCount(5);
});

test("navigates with the keyboard and returns focus to the matching thumbnail", async ({
  page,
}) => {
  const viewer = await open(page, 3);
  const counter = viewer.locator(".eg-counter");
  await page.keyboard.press("ArrowRight");
  await expect(counter).toHaveText("4 / 12");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(counter).toHaveText("2 / 12");
  await page.keyboard.press("End");
  await expect(counter).toHaveText("12 / 12");
  await page.keyboard.press("ArrowRight");
  await expect(counter).toHaveText("1 / 12");
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
  await expect(gallery(page).getByRole("button", { name: "Open Sample 02" })).toBeFocused();
});

test("navigates with the arrow buttons and closes with the close button", async ({ page }) => {
  const viewer = await open(page, 1);
  await viewer.getByRole("button", { name: "Next image" }).click();
  await expect(viewer.locator(".eg-counter")).toHaveText("2 / 12");
  await viewer.getByRole("button", { name: "Previous image" }).click();
  await expect(viewer.locator(".eg-counter")).toHaveText("1 / 12");
  await viewer.getByRole("button", { name: "Close" }).click();
  await expect(viewer).toBeHidden();
  await expect(gallery(page).getByRole("button", { name: "Open Sample 01" })).toBeFocused();
});

test("keeps Tab focus inside the dialog", async ({ page }) => {
  const viewer = await open(page, 5);
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("Tab");
    expect(await viewer.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Shift+Tab");
  expect(await viewer.evaluate((el) => el.contains(document.activeElement))).toBe(true);
});

test("locks page scroll while open and restores it", async ({ page }) => {
  await open(page, 1);
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeHidden();
  expect(await page.evaluate(() => document.body.getAttribute("style") ?? "")).toBe("");
});

test("closes on a click on the empty area around the image", async ({ page }) => {
  const viewer = await open(page, 4);
  const viewport = page.viewportSize()!;
  await page.mouse.click(viewport.width / 2, 30);
  await expect(viewer).toBeHidden();
});

test("changes slide with a horizontal swipe and snaps back on a short one", async ({ page }) => {
  const viewer = await open(page, 3);
  const counter = viewer.locator(".eg-counter");
  await drag(page, -20, 0);
  await expect(counter).toHaveText("3 / 12");
  await drag(page, -160, 0);
  await expect(counter).toHaveText("4 / 12");
  await drag(page, 160, 0);
  await expect(counter).toHaveText("3 / 12");
  await expect(viewer).toBeVisible();
});

test("closes with a downward swipe", async ({ page }) => {
  const viewer = await open(page, 3);
  const height = page.viewportSize()!.height;
  await drag(page, 0, Math.round(height * 0.3));
  await expect(viewer).toBeHidden();
});

test("animates the image out of its thumbnail with transform only", async ({ page }) => {
  await gallery(page).getByRole("button", { name: "Open Sample 02" }).click();
  const keyframes = await page
    .locator(".eg-slide[data-current] .eg-image")
    .evaluate((img) =>
      img.getAnimations().flatMap((a) => (a.effect as KeyframeEffect).getKeyframes()),
    );
  expect(keyframes.length).toBeGreaterThan(0);
  expect(String(keyframes[0]?.transform)).toMatch(/^translate\(.+\) scale\(.+\)$/);
  const props = new Set(keyframes.flatMap((k) => Object.keys(k)));
  for (const prop of props)
    expect(["transform", "opacity", "offset", "easing", "composite", "computedOffset"]).toContain(
      prop,
    );
});

test("skips the animations with prefers-reduced-motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gallery(page).getByRole("button", { name: "Open Sample 02" }).click();
  await expect(page.locator(".eg-root")).toHaveAttribute("data-state", "open");
  const running = await page
    .locator(".eg-slide[data-current] .eg-image")
    .evaluate((img) => img.getAnimations().length);
  expect(running).toBe(0);
});

test("switches the slide transition from the options", async ({ page }) => {
  await page.getByRole("radio", { name: "fade" }).check();
  await open(page, 1);
  await expect(page.locator(".eg-root")).toHaveAttribute("data-transition", "fade");
});

test("applies labels, icons and theme variables in the customised gallery", async ({ page }) => {
  await page
    .getByRole("region", { name: "Customised" })
    .getByRole("button", { name: "Open Sample 02" })
    .click();
  const viewer = page.getByRole("dialog", { name: "Visualizador de imagens" });
  await expect(viewer).toBeVisible();
  await expect(viewer.locator(".eg-counter")).toHaveText("2 de 6");
  await expect(viewer.getByRole("button", { name: "Fechar" })).toBeVisible();
  await expect(viewer.getByRole("link", { name: "Original" })).toHaveAttribute(
    "href",
    "/samples/sample-02-full.jpg",
  );
  await expect(viewer.locator(".eg-backdrop")).toHaveCSS("background-color", "rgb(16, 20, 24)");
});
