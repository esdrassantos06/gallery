import { expect, test, type Page } from "@playwright/test";

const section = (page: Page) => page.getByRole("region", { name: "Grids and filter" });
const grid = (page: Page) => section(page).locator(".eg-grid");
const filter = (page: Page) => section(page).getByRole("group", { name: "Filter by shape" });

async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("grids and filter", () => {
  test("lays out every layout inside the container without overlap", async ({ page }) => {
    await page.goto("/");
    for (const layout of ["justified", "masonry", "uniform"]) {
      await section(page).getByRole("radio", { name: layout }).click();
      await expect(grid(page)).toHaveClass(new RegExp(`eg-grid--${layout}`));
      await expect(grid(page).getByRole("button")).toHaveCount(12);
      const boxes = await grid(page)
        .locator(".eg-grid-item")
        .evaluateAll((items) => items.map((item) => item.getBoundingClientRect().toJSON()));
      const container = (await grid(page).boundingBox())!;
      for (const [i, a] of boxes.entries()) {
        expect(a.width).toBeGreaterThan(0);
        expect(a.left).toBeGreaterThanOrEqual(container.x - 1);
        expect(a.right).toBeLessThanOrEqual(container.x + container.width + 1);
        for (const b of boxes.slice(i + 1)) {
          const overlap =
            Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
            Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
          expect(overlap).toBe(false);
        }
      }
      await noHorizontalOverflow(page);
    }
  });

  test("filters with toggle buttons and announces the count", async ({ page }) => {
    await page.goto("/");
    const portrait = filter(page).getByRole("button", { name: "Portrait" });
    await expect(filter(page).getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await portrait.click();
    await expect(portrait).toHaveAttribute("aria-pressed", "true");
    await expect(grid(page).getByRole("button")).toHaveCount(4);
    await expect(section(page).locator(".eg-filter-status")).toHaveText("4 images");
    await expect(section(page).locator(".eg-filter-status")).toHaveAttribute("aria-live", "polite");
  });

  test("opens the filtered slide in the lightbox and returns focus to it", async ({ page }) => {
    await page.goto("/");
    await filter(page).getByRole("button", { name: "Portrait" }).click();
    await grid(page).getByRole("button", { name: "Open Sample 05" }).click();
    const dialog = page.getByRole("dialog", { name: "Image viewer" });
    await expect(dialog).toBeVisible();
    await expect(page.locator(".eg-counter")).toHaveText("2 / 4");
    await expect(page.locator(".eg-slide[data-current] .eg-image")).toHaveAttribute(
      "alt",
      "Sample 05: abstract colour field",
    );
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(grid(page).getByRole("button", { name: "Open Sample 05" })).toBeFocused();
  });

  test("lazy-loads thumbnails with explicit sizes", async ({ page }) => {
    await page.goto("/");
    const first = grid(page).locator("img").first();
    await expect(first).toHaveAttribute("loading", "lazy");
    await expect(first).toHaveAttribute("sizes", /^\d+px$/);
    expect(Number(await first.getAttribute("width"))).toBeGreaterThan(0);
  });
});
