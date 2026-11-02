import { expect, test, type Page } from "@playwright/test";

const section = (page: Page) => page.getByRole("region", { name: "Interaction polish" });

async function open(page: Page, n = 1) {
  await section(page)
    .getByRole("button", { name: `Open Sample ${String(n).padStart(2, "0")}` })
    .click();
  await expect(page.locator(".eg-root")).toHaveAttribute("data-state", "open");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("starts the flight cropped like the square thumbnail it leaves", async ({ page }) => {
  await page.addInitScript(() => {
    const animate = Element.prototype.animate;
    const flights: unknown[] = [];
    Object.assign(window, { flights });
    Element.prototype.animate = function (keyframes, options) {
      if (this.matches(".eg-image")) flights.push(keyframes);
      return animate.call(this, keyframes, options);
    };
  });
  await page.reload();
  await open(page);
  const [first] = (await page.evaluate(
    () => (window as unknown as { flights: Keyframe[][] }).flights[0],
  ))!;
  const thumbnail = (await section(page)
    .getByRole("button", { name: "Open Sample 01" })
    .boundingBox())!;
  const image = (await page.locator(".eg-slide[data-current] .eg-image").boundingBox())!;
  const scale = Math.max(thumbnail.width / image.width, thumbnail.height / image.height);
  const [top, side] = String(first?.clipPath)
    .match(/[\d.]+/g)!
    .map(Number);
  expect(top).toBe(0);
  expect((image.width - side! * 2) * scale).toBeCloseTo(thumbnail.width, 0);
});
