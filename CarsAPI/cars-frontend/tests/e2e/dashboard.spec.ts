import { expect, test, type Page } from "@playwright/test";
import type { Car } from "../../lib/cars-api";

function seedCars(count = 60): Car[] {
    return Array.from({ length: count }, (_, index) => ({
        id: index + 1, make: index % 2 ? "Toyota" : "Honda", model: "Car" + (index + 1),
        year: 2024, horsepower: 150, price: null, color: null, isAvailable: (index + 1) % 3 !== 0,
    }));
}

async function mockApi(page: Page, initial = seedCars()) {
    let cars = initial.map(car => ({ ...car }));
    const state = { writes: [] as Car[], rejectSave: false, failGet: false };
    const api = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7059").replace(/\/+$/, "");
    await page.route(api + "/cars**", async route => {
        const request = route.request();
        const url = new URL(request.url());
        const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Expose-Headers": "X-Total-Count",
            "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS" };
        const send = (status: number, body?: unknown, extra = {}) => route.fulfill({
            status, headers: { ...headers, ...extra }, contentType: "application/json",
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        if (request.method() === "OPTIONS") return send(204);
        const id = Number(url.pathname.split("/").at(-1));
        if (request.method() === "GET") {
            if (state.failGet) { state.failGet = false; return send(500, {}); }
            if (Number.isFinite(id) && id > 0) {
                const car = cars.find(item => item.id === id);
                return send(car ? 200 : 404, car);
            }
            const search = (url.searchParams.get("search") || "").toLowerCase();
            const available = url.searchParams.get("isAvailable");
            const filtered = cars.filter(car => (car.make + " " + car.model).toLowerCase().includes(search)
                && (available === null || car.isAvailable === (available === "true")));
            const pageNumber = Number(url.searchParams.get("pageNumber") || 1);
            const size = Number(url.searchParams.get("pageSize") || 50);
            return send(200, filtered.slice((pageNumber - 1) * size, pageNumber * size), { "X-Total-Count": String(filtered.length) });
        }
        if (request.method() === "DELETE") {
            cars = cars.filter(car => car.id !== id);
            return send(204);
        }
        if (state.rejectSave) {
            return send(400, { errors: { Make: ["Make rejected by the server."] } });
        }
        const body = request.postDataJSON() as Car;
        const saved = { ...body, id: request.method() === "POST" ? Math.max(0, ...cars.map(car => car.id)) + 1 : id };
        state.writes.push(saved);
        cars = request.method() === "POST" ? [...cars, saved] : cars.map(car => car.id === id ? saved : car);
        return send(request.method() === "POST" ? 201 : 200, saved);
    });
    return state;
}

async function openDashboard(page: Page) {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Add New Car", exact: true })).toBeEnabled();
}

async function fillRequired(page: Page) {
    await page.getByLabel("Make", { exact: true }).fill("Toyota");
    await page.getByLabel("Model", { exact: true }).fill("Corolla");
    await page.getByLabel("Year", { exact: true }).fill(String(new Date().getFullYear() + 1));
    await page.getByLabel("Horsepower", { exact: true }).fill("150");
}

test("language and dark mode persist without hydration errors", async ({ page }) => {
    await mockApi(page);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await openDashboard(page);
    await page.locator("#language").selectOption("ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await page.emulateMedia({ colorScheme: "light" });
    await page.getByRole("button", { name: "تبديل الوضع الداكن" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("#language")).toHaveValue("ar");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.locator("#language").selectOption("es");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await page.reload();
    await expect(page.locator("#language")).toHaveValue("es");
    expect(errors).toEqual([]);
});

test("pagination and filters include cars beyond the original first 50", async ({ page }) => {
    const api = await mockApi(page);
    await openDashboard(page);
    for (let number = 2; number <= 5; number++) {
        await page.getByRole("button", { name: "Next", exact: true }).click();
        await expect(page.getByRole("button", { name: "Add New Car", exact: true })).toBeEnabled();
        await expect(page.getByText("Page " + number + " of 5", { exact: true })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Honda Car57 (2024)" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
    await page.getByRole("textbox", { name: "Search cars" }).fill("Car57");
    await expect(page.getByText("Showing 1 results of 1 cars", { exact: true })).toBeVisible();
    await page.getByLabel("Filter by availability").selectOption("available");
    await expect(page.getByText("No cars found.", { exact: true })).toBeVisible();
    await page.getByLabel("Filter by availability").selectOption("sold");
    await expect(page.getByRole("link", { name: "Honda Car57 (2024)" })).toBeVisible();
    await page.getByRole("button", { name: "Toggle availability", exact: true }).click();
    await expect(page.getByText("No cars found.", { exact: true })).toBeVisible();
    expect(api.writes[0]).toMatchObject({ id: 57, isAvailable: true });
});

test("field validation focuses the first error and optional values stay null", async ({ page }) => {
    const api = await mockApi(page);
    await openDashboard(page);
    await page.getByRole("button", { name: "Add New Car", exact: true }).click();
    await page.getByRole("button", { name: "Add car", exact: true }).click();
    await expect(page.getByLabel("Make", { exact: true })).toBeFocused();
    await expect(page.locator("#car-make-error")).toHaveText("This field is required.");
    expect(api.writes).toHaveLength(0);
    await fillRequired(page);
    await page.getByLabel("Horsepower", { exact: true }).fill("1.5");
    await page.getByLabel("Price (optional)", { exact: true }).fill("-1");
    await page.getByRole("button", { name: "Add car", exact: true }).click();
    await expect(page.getByLabel("Horsepower", { exact: true })).toBeFocused();
    await expect(page.locator("#car-price-error")).toBeVisible();
    await page.getByLabel("Horsepower", { exact: true }).fill("150");
    await page.getByLabel("Price (optional)", { exact: true }).fill("");
    await page.getByRole("button", { name: "Add car", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText("Showing 12 results of 61 cars", { exact: true })).toBeVisible();
    expect(api.writes[0]).toMatchObject({ price: null, color: null, year: new Date().getFullYear() + 1 });
});

test("API validation appears next to its field and zero price survives editing", async ({ page }) => {
    const cars = seedCars(1);
    cars[0].price = 0;
    const api = await mockApi(page, cars);
    await openDashboard(page);
    await page.getByRole("button", { name: "Edit car", exact: true }).click();
    await expect(page.getByLabel("Price (optional)", { exact: true })).toHaveValue("0");
    api.rejectSave = true;
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.locator("#car-make-error")).toHaveText("Make rejected by the server.");
    await expect(page.getByLabel("Make", { exact: true })).toBeFocused();
    api.rejectSave = false;
    await page.getByLabel("Make", { exact: true }).fill("Toyota");
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(api.writes[0].price).toBe(0);
});

test("deleting the only car on the last page returns to the previous page", async ({ page }) => {
    await mockApi(page, seedCars(13));
    await openDashboard(page);
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByRole("link", { name: "Honda Car13 (2024)" })).toBeVisible();
    await page.getByRole("button", { name: "Delete car", exact: true }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete car", exact: true }).click();
    await expect(page.getByText("Showing 12 results of 12 cars", { exact: true })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Car pages" })).toHaveCount(0);
});

test("keyboard focus stays in the modal and Escape closes it", async ({ page }) => {
    await mockApi(page);
    await openDashboard(page);
    await page.getByRole("button", { name: "Add New Car", exact: true }).focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (let step = 0; step < 12; step++) {
        await page.keyboard.press("Tab");
        expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Add New Car", exact: true })).toBeFocused();
});

test("Arabic mobile layout fits the viewport and allows scrolling to submit", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const cars = seedCars(1);
    cars[0].make = "A".repeat(50);
    cars[0].model = "B".repeat(50);
    await mockApi(page, cars);
    await openDashboard(page);
    await page.locator("#language").selectOption("ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole("button", { name: "إضافة سيارة جديدة", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(360);
    await dialog.getByRole("button", { name: "إضافة السيارة", exact: true }).scrollIntoViewIfNeeded();
    await dialog.getByRole("button", { name: "إضافة السيارة", exact: true }).click();
    await expect(page.locator("#car-make-error")).toHaveText("هذا الحقل مطلوب.");
    await page.screenshot({ path: test.info().outputPath("arabic-mobile.png") });
});

test("load errors can be retried and a missing car has a translated message", async ({ page }) => {
    const api = await mockApi(page);
    api.failGet = true;
    await page.goto("/");
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Could not load cars.");
    await page.getByRole("button", { name: "Retry loading cars" }).click();
    await expect(page.getByRole("button", { name: "Add New Car", exact: true })).toBeEnabled();
    await page.locator("#language").selectOption("es");
    await page.goto("/cars/9999");
    await expect(page.getByText("No se encontró el coche.", { exact: true })).toBeVisible();
});
