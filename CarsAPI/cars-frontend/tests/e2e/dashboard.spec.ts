import { expect, test, type Page } from "@playwright/test";
import type { Car } from "../../lib/api/cars-api";

function seedCars(count = 60): Car[] {
    return Array.from({ length: count }, (_, index) => ({
        id: index + 1, make: index % 2 ? "Toyota" : "Honda", model: "Car" + (index + 1),
        year: 2024, horsepower: 150, price: null, color: null, isAvailable: (index + 1) % 3 !== 0,
    }));
}

async function mockApi(page: Page, initial = seedCars()) {
    let cars = initial.map(car => ({ ...car }));
    const state = {
        writes: [] as Car[], rejectSave: false, failGet: false,
        listReads: 0, writeGate: null as Promise<void> | null, failUpdate: false,
    };
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
            state.listReads++;
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
        if (request.method() === "PUT" && state.writeGate) await state.writeGate;
        if (request.method() === "PUT" && state.failUpdate) {
            return send(500, { detail: "Could not update availability." });
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

function carCard(page: Page, name: string) {
    return page.locator('[data-slot="card"]').filter({
        has: page.getByRole("link", { name, exact: true }),
    });
}

test("cards update independently without refetching the unfiltered list", async ({ page }) => {
    const api = await mockApi(page, seedCars(2));
    await openDashboard(page);
    const reads = api.listReads;
    let release!: () => void;
    api.writeGate = new Promise<void>(resolve => { release = resolve; });
    const first = carCard(page, "Honda Car1");
    const second = carCard(page, "Toyota Car2");
    await first.getByRole("button", { name: "Mark as sold" }).click();
    await expect(first).toHaveAttribute("aria-busy", "true");
    await expect(first.getByRole("button", { name: "Edit car" })).toBeDisabled();
    await expect(second.getByRole("button", { name: "Edit car" })).toBeEnabled();
    await second.getByRole("button", { name: "Mark as sold" }).click();
    await expect(second).toHaveAttribute("aria-busy", "true");
    release();
    await expect(first.getByRole("button", { name: "Mark as available" })).toBeEnabled();
    await expect(second.getByRole("button", { name: "Mark as available" })).toBeEnabled();
    expect(api.writes).toHaveLength(2);
    expect(api.listReads).toBe(reads);
});

test("an availability error stays in its card and can be retried", async ({ page }) => {
    const api = await mockApi(page, seedCars(2));
    await openDashboard(page);
    const first = carCard(page, "Honda Car1");
    const second = carCard(page, "Toyota Car2");
    api.failUpdate = true;
    await first.getByRole("button", { name: "Mark as sold" }).click();
    await expect(first.getByRole("alert")).toBeVisible();
    await expect(second.getByRole("alert")).toHaveCount(0);
    await expect(second.getByRole("button", { name: "Edit car" })).toBeEnabled();
    api.failUpdate = false;
    await first.getByRole("button", { name: "Mark as sold" }).click();
    await expect(first.getByRole("button", { name: "Mark as available" })).toBeEnabled();
    await expect(first.getByRole("alert")).toHaveCount(0);
});

test("late card updates refresh the current filter even after the card unmounts", async ({ page }) => {
    const api = await mockApi(page, seedCars(3));
    await openDashboard(page);
    let release!: () => void;
    api.writeGate = new Promise<void>(resolve => { release = resolve; });
    await carCard(page, "Honda Car1").getByRole("button", { name: "Mark as sold" }).click();
    await page.getByLabel("Filter by availability").selectOption("sold");
    await expect(page.getByText("Showing 1 results of 1 cars", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Honda Car1", exact: true })).toHaveCount(0);
    release();
    await expect(page.getByText("Showing 2 results of 2 cars", { exact: true })).toBeVisible();
    await expect(carCard(page, "Honda Car1").getByText("Sold", { exact: true })).toBeVisible();
});

test("unchanged cards skip parent-driven rendering after a local update", async ({ page }) => {
    // Observe real React commits with the DevTools hook, installed only in this test.
    // PerformedWork is React's bit 1; checking the initial commit validates the probe.
    await page.addInitScript(() => {
        type Fiber = {
            flags: number;
            elementType?: { displayName?: string };
            memoizedProps?: { car?: { id: number } };
            child: Fiber | null;
            sibling: Fiber | null;
        };
        const probe = window as unknown as {
            __cardRenders: number[];
            __REACT_DEVTOOLS_GLOBAL_HOOK__: unknown;
        };
        probe.__cardRenders = [];
        const renderers = new Map<number, unknown>();
        probe.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
            supportsFiber: true, renderers,
            inject(renderer: unknown) {
                const id = renderers.size + 1;
                renderers.set(id, renderer);
                return id;
            },
            onCommitFiberRoot(_id: number, root: { current: Fiber }) {
                function visit(fiber: Fiber | null) {
                    if (!fiber) return;
                    if (fiber.elementType?.displayName === "CarCard" && (fiber.flags & 1)) {
                        const id = fiber.memoizedProps?.car?.id;
                        if (id !== undefined) probe.__cardRenders.push(id);
                    }
                    visit(fiber.child);
                    visit(fiber.sibling);
                }
                visit(root.current);
            },
            onCommitFiberUnmount() {}, onPostCommitFiberRoot() {},
        };
    });
    await mockApi(page, seedCars(2));
    await openDashboard(page);
    const initial = await page.evaluate(() =>
        (window as unknown as { __cardRenders: number[] }).__cardRenders);
    expect(initial).toEqual(expect.arrayContaining([1, 2]));
    await page.evaluate(() => {
        (window as unknown as { __cardRenders: number[] }).__cardRenders = [];
    });
    const first = carCard(page, "Honda Car1");
    await first.getByRole("button", { name: "Mark as sold" }).click();
    await expect(first.getByRole("button", { name: "Mark as available" })).toBeEnabled();
    const updates = await page.evaluate(() =>
        (window as unknown as { __cardRenders: number[] }).__cardRenders);
    expect(updates).toContain(1);
    expect(updates).not.toContain(2);
});

test("save and delete confirmations appear only after success", async ({ page }) => {
    await mockApi(page, seedCars(1));
    await openDashboard(page);
    await page.getByRole("button", { name: "Edit car", exact: true }).click();
    await page.getByLabel("Model", { exact: true }).fill("Updated");
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.getByText("Car saved successfully.", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Delete car", exact: true }).click();
    await expect(page.getByText("Car deleted successfully.", { exact: true })).toHaveCount(0);
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete car", exact: true }).click();
    await expect(page.getByText("Car deleted successfully.", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "No cars yet." })).toBeVisible();
});

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
    await expect(page.getByRole("link", { name: "Honda Car57", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
    await page.getByRole("textbox", { name: "Search cars" }).fill("Car57");
    await expect(page.getByText("Showing 1 results of 1 cars", { exact: true })).toBeVisible();
    await page.getByLabel("Filter by availability").selectOption("available");
    await expect(page.getByText("No cars match your filters.", { exact: true })).toBeVisible();
    await page.getByLabel("Filter by availability").selectOption("sold");
    await expect(page.getByRole("link", { name: "Honda Car57", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Mark as available", exact: true }).click();
    await expect(page.getByText("No cars match your filters.", { exact: true })).toBeVisible();
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
    await expect(page.getByRole("link", { name: "Honda Car13", exact: true })).toBeVisible();
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
    await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
    for (let step = 0; step < 12; step++) {
        await page.keyboard.press("Tab");
        await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
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
