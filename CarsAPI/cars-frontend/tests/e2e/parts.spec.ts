import { expect, test, type Page } from "@playwright/test";
import { carResponse } from "./car-response";
import type { Part, PartDetails } from "../../lib/api/parts-api";

type SavedPart = PartDetails & { id?: string };
type SaveFailure = { status: number; body?: unknown; plain?: string };
const carOptions = Array.from({ length: 25 }, (_, index) => ({
    id: index + 1, make: "Toyota", model: "Car" + (index + 1),
    year: 2024, horsepower: 150, price: 5000, color: null, isAvailable: true,
}));
function seedParts(count = 25): Part[] {
    return Array.from({ length: count }, (_, index) => ({
        id: "00000000-0000-0000-0000-" + String(index + 1).padStart(12, "0"),
        manufacturer: "Maker" + (index + 1), description: "Part " + (index + 1),
        price: index === 0 ? 0 : 10, carId: null, carName: null,
    }));
}

async function mockParts(page: Page, initial = seedParts()) {
    const state = {
        parts: initial.map(part => ({ ...part })),
        writes: [] as { method: string; body: SavedPart }[],
        deletedIds: [] as string[],
        forbidden: [] as string[],
        pages: [] as number[],
        carPages: [] as number[],
        failList: 0, failCars: 0, omitCount: false,
        saveFailure: null as SaveFailure | null,
        beforeSave: null as (() => Promise<void>) | null,
        deleteFailure: null as SaveFailure | null,
        beforeDelete: null as (() => Promise<void>) | null,
    };
    let nextId = initial.length + 1;
    const api = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7059").replace(/\/+$/, "");
    await page.route(api + "/**", async route => {
        const request = route.request();
        const url = new URL(request.url());
        const method = request.method();
        const headers = {
            "Access-Control-Allow-Origin": "*", "Access-Control-Expose-Headers": "X-Total-Count",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        };
        const send = (status: number, body?: unknown, extra: Record<string, string> = {}) => route.fulfill({
            status, headers: { ...headers, ...extra }, contentType: "application/json",
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        if (method === "OPTIONS") return send(204);
        if (url.pathname === "/cars" && method === "GET") {
            if (state.failCars > 0) { state.failCars--; return send(503, {}); }
            const number = Number(url.searchParams.get("pageNumber") || 1);
            const size = Number(url.searchParams.get("pageSize") || 50);
            state.carPages.push(number);
            return send(200, carOptions.slice((number - 1) * size, number * size).map(carResponse), {
                "X-Total-Count": String(carOptions.length),
            });
        }
        if (url.pathname === "/parts/list" && method === "GET") {
            const number = Number(url.searchParams.get("pageNumber") || 1);
            const size = Number(url.searchParams.get("pageSize") || 50);
            state.pages.push(number);
            if (state.failList > 0) { state.failList--; return send(503, {}); }
            const countHeader: Record<string, string> = state.omitCount ? {} : { "X-Total-Count": String(state.parts.length) };
            return send(200, state.parts.slice((number - 1) * size, number * size), countHeader);
        }
        if (/^\/parts\/[0-9a-f-]+$/i.test(url.pathname) && method === "DELETE") {
            if (state.beforeDelete) await state.beforeDelete();
            if (state.deleteFailure) return send(state.deleteFailure.status, state.deleteFailure.body);
            const id = url.pathname.split("/").at(-1)!;
            if (!state.parts.some(part => part.id === id)) return send(404);
            state.parts = state.parts.filter(part => part.id !== id);
            state.deletedIds.push(id);
            return send(204);
        }
        const isAdd = url.pathname === "/parts/add" && method === "POST";
        const isUpdate = /^\/parts\/[0-9a-f-]+$/i.test(url.pathname) && method === "PUT";
        if (isAdd || isUpdate) {
            if (state.beforeSave) await state.beforeSave();
            if (state.saveFailure) {
                const failure = state.saveFailure;
                if (failure.plain !== undefined) return route.fulfill({
                    status: failure.status, headers, contentType: "text/plain", body: failure.plain,
                });
                return send(failure.status, failure.body);
            }
            const body = request.postDataJSON() as SavedPart;
            const id = isAdd
                ? "00000000-0000-0000-0000-" + String(nextId++).padStart(12, "0")
                : url.pathname.split("/").at(-1)!;
            if (isUpdate && body.id !== id) return send(400, { detail: "IDs do not match." });
            state.writes.push({ method, body });
            const car = carOptions.find(car => car.id === body.carId);
            const saved: Part = { ...body, id, carName: car ? car.make + " " + car.model : null };
            state.parts = isAdd ? [...state.parts, saved] : state.parts.map(part => part.id === id ? saved : part);
            return send(isAdd ? 201 : 200, saved);
        }
        // Any unexpected endpoint is intercepted too; tests never write to the real API.
        state.forbidden.push(method + " " + url.pathname);
        return send(405, {});
    });
    return state;
}
async function openParts(page: Page) {
    await page.goto("/parts");
    await expect(page.getByRole("region", { name: "Parts list" }).getByRole("status"))
        .toContainText("Showing");
    await expect(page.getByLabel("Car (optional)")).toBeEnabled();
}
async function fillPart(page: Page, price = "10") {
    await page.getByLabel("Manufacturer", { exact: true }).fill("Bosch");
    await page.getByLabel("Description", { exact: true }).fill("Brake pads");
    await page.getByLabel("Price", { exact: true }).fill(price);
}

test("parts pagination handles boundaries and includes records after the first 50", async ({ page }) => {
    const api = await mockParts(page, seedParts(53));
    await openParts(page);
    const nav = page.getByRole("navigation", { name: "Parts pages" });
    await expect(nav.getByRole("button", { name: "Previous" })).toBeDisabled();
    for (let number = 2; number <= 5; number++) {
        await nav.getByRole("button", { name: "Next", exact: true }).click();
        await expect(page.getByRole("heading", { name: "Maker" + ((number - 1) * 12 + 1), exact: true })).toBeVisible();
    }
    await expect(nav.getByText("Page 5 of 5", { exact: true })).toBeVisible();
    await expect(nav.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
    await expect(page.getByText("Showing 5 of 53 parts", { exact: true })).toBeVisible();
    await nav.getByRole("button", { name: "Previous" }).click();
    await expect(page.getByRole("heading", { name: "Maker37", exact: true })).toBeVisible();
    expect(api.pages).toEqual([1, 2, 3, 4, 5]);
});

test("adding assigned and unassigned parts uses POST without changing cars", async ({ page }) => {
    const api = await mockParts(page, seedParts(1));
    const prices = carOptions.map(car => car.price);
    await openParts(page);
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await expect(page.getByLabel("Car (optional)").locator("option")).toHaveCount(26);
    expect(api.carPages).toEqual([1, 2, 3]);
    await fillPart(page, "0");
    await page.getByRole("button", { name: "Add part", exact: true }).click();
    await expect(page.getByText("Showing 2 of 2 parts", { exact: true })).toBeVisible();
    expect(api.writes[0]).toMatchObject({ method: "POST", body: { price: 0, carId: null } });
    await expect(page.getByLabel("Manufacturer", { exact: true })).toHaveValue("");
    await fillPart(page, "12.50");
    await page.getByLabel("Car (optional)").selectOption("25");
    await page.getByRole("button", { name: "Add part", exact: true }).click();
    await expect(page.getByText("Showing 3 of 3 parts", { exact: true })).toBeVisible();
    expect(api.writes[1]).toMatchObject({ method: "POST", body: { price: 12.5, carId: 25 } });
    await expect(page.getByLabel("Car (optional)")).toHaveValue("");
    expect(carOptions.map(car => car.price)).toEqual(prices);
    expect(api.forbidden).toEqual([]);
});

test("edit initializes the draft, cancel discards it, and PUT can unassign a car", async ({ page }) => {
    const initial = seedParts(1);
    initial[0].carId = 25;
    initial[0].carName = "Toyota Car25";
    const api = await mockParts(page, initial);
    await openParts(page);
    await page.getByRole("button", { name: "Edit part", exact: true }).click();
    await expect(page.getByLabel("Manufacturer", { exact: true })).toHaveValue("Maker1");
    await expect(page.getByLabel("Price", { exact: true })).toHaveValue("0");
    await expect(page.getByLabel("Car (optional)")).toHaveValue("25");
    await page.getByLabel("Description", { exact: true }).fill("Discard this");
    await page.getByRole("button", { name: "Cancel editing" }).click();
    await expect(page.getByLabel("Description", { exact: true })).toHaveValue("");
    expect(api.writes).toHaveLength(0);
    await page.getByRole("button", { name: "Edit part", exact: true }).click();
    await expect(page.getByLabel("Car (optional)")).toBeEnabled();
    await page.getByLabel("Description", { exact: true }).fill("Updated brake pads");
    await page.getByLabel("Car (optional)").selectOption("");
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.getByText("Updated brake pads", { exact: true })).toBeVisible();
    expect(api.writes[0]).toMatchObject({
        method: "PUT", body: { id: initial[0].id, price: 0, carId: null },
    });
});

test("local field validation focuses the invalid input and preserves zero prices", async ({ page }) => {
    const api = await mockParts(page, []);
    await openParts(page);
    await page.getByRole("button", { name: "Add part", exact: true }).click();
    await expect(page.getByLabel("Manufacturer", { exact: true })).toBeFocused();
    await expect(page.locator("#part-manufacturer-error")).toHaveText("This field is required.");
    await fillPart(page, "2.345");
    await page.getByRole("button", { name: "Add part", exact: true }).click();
    await expect(page.getByLabel("Price", { exact: true })).toBeFocused();
    await expect(page.locator("#part-price-error")).toBeVisible();
    expect(api.writes).toHaveLength(0);
    await page.getByLabel("Price", { exact: true }).fill("0");
    await page.getByRole("button", { name: "Add part", exact: true }).click();
    await expect(page.getByText("Part saved.", { exact: true })).toBeVisible();
    expect(api.writes[0].body.price).toBe(0);
});

test("backend field errors stay beside their inputs and the draft can be corrected", async ({ page }) => {
    const api = await mockParts(page, []);
    api.saveFailure = { status: 400, body: { errors: {
        Manufacturer: ["This manufacturer is not accepted."],
        CarId: ["Car no longer exists."],
    } } };
    await openParts(page);
    await fillPart(page);
    await page.getByLabel("Car (optional)").selectOption("25");
    await page.getByRole("button", { name: "Add part", exact: true }).click();
    await expect(page.locator("#part-manufacturer-error")).toHaveText("This manufacturer is not accepted.");
    await expect(page.locator("#part-car-error")).toHaveText("Car no longer exists.");
    await expect(page.getByLabel("Manufacturer", { exact: true })).toBeFocused();
    await expect(page.getByLabel("Description", { exact: true })).toHaveValue("Brake pads");
    await expect(page.getByLabel("Manufacturer", { exact: true })).toHaveAttribute("aria-describedby", "part-manufacturer-error");
    api.saveFailure = null;
    await page.getByLabel("Manufacturer", { exact: true }).fill("Approved");
    await page.getByLabel("Car (optional)").selectOption("");
    await expect(page.locator("#part-manufacturer-error")).toHaveCount(0);
    await page.getByRole("button", { name: "Add part", exact: true }).click();
    await expect(page.getByText("Part saved.", { exact: true })).toBeVisible();
});

test("list and car-option failures each offer working retry controls", async ({ page }) => {
    const api = await mockParts(page, seedParts(1));
    api.failList = 1;
    api.failCars = 1;
    await page.goto("/parts");
    const list = page.getByRole("region", { name: "Parts list" });
    const form = page.getByRole("form", { name: "Add part" });
    await expect(list.getByRole("alert")).toHaveText("Could not load parts.");
    await expect(form.getByRole("alert")).toHaveText("Could not load cars.");
    await list.getByRole("button", { name: "Retry loading parts" }).click();
    await expect(list.getByText("Showing 1 of 1 parts", { exact: true })).toBeVisible();
    await form.getByRole("button", { name: "Retry loading car options" }).click();
    await expect(page.getByLabel("Car (optional)")).toBeEnabled();
    await expect(form.getByRole("alert")).toHaveCount(0);
});

test("problem details are shown and non-JSON failures have a usable fallback", async ({ page }) => {
    const api = await mockParts(page, []);
    await openParts(page);
    await fillPart(page);
    const form = page.getByRole("form", { name: "Add part" });
    api.saveFailure = { status: 503, body: { detail: "Parts service is temporarily unavailable." } };
    await page.getByRole("button", { name: "Add part", exact: true }).click();
    await expect(form.getByRole("alert")).toHaveText("Parts service is temporarily unavailable.");
    api.saveFailure = { status: 502, plain: "Bad gateway" };
    await page.getByRole("button", { name: "Add part", exact: true }).click();
    await expect(form.getByRole("alert")).toHaveText("Could not add part.");
    await expect(page.getByLabel("Manufacturer", { exact: true })).toHaveValue("Bosch");
    api.saveFailure = null;
    await page.getByRole("button", { name: "Add part", exact: true }).click();
    await expect(page.getByText("Part saved.", { exact: true })).toBeVisible();
});

test("pending saves disable inputs, cancel, edit, and pagination without duplicate writes", async ({ page }) => {
    const api = await mockParts(page);
    await openParts(page);
    await page.getByRole("button", { name: "Edit part", exact: true }).first().click();
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    api.beforeSave = () => pending;
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.getByRole("button", { name: "Saving...", exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Cancel editing" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Edit part", exact: true }).first()).toBeDisabled();
    await expect(page.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
    await expect(page.getByLabel("Manufacturer", { exact: true })).toBeDisabled();
    release();
    await expect(page.getByText("Part saved.", { exact: true })).toBeVisible();
    expect(api.writes).toHaveLength(1);
});

test("retry clamps a page removed by another client", async ({ page }) => {
    const api = await mockParts(page);
    await openParts(page);
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Maker13", exact: true })).toBeVisible();
    api.failList = 1;
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByRole("button", { name: "Retry loading parts" })).toBeVisible();
    api.parts = seedParts(1);
    await page.getByRole("button", { name: "Retry loading parts" }).click();
    await expect(page.getByText("Showing 1 of 1 parts", { exact: true })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Parts pages" })).toHaveCount(0);
    expect(api.pages.slice(-2)).toEqual([3, 1]);
});

test("Parts translations, inline errors, and Arabic mobile layout work without the old checkbox", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const parts = seedParts(1);
    parts[0].description = "A".repeat(500);
    await mockParts(page, parts);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await openParts(page);
    await page.locator("#language").selectOption("ar");
    await expect(page.getByRole("heading", { name: "قطع الغيار", exact: true })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await page.getByRole("button", { name: "إضافة قطعة", exact: true }).click();
    await expect(page.locator("#part-manufacturer-error")).toHaveText("هذا الحقل مطلوب.");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.locator("#language").selectOption("es");
    await expect(page.getByRole("heading", { name: "Piezas", exact: true })).toBeVisible();
    await expect(page.locator("#part-manufacturer-error")).toHaveText("Este campo es obligatorio.");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await page.screenshot({ path: test.info().outputPath("parts-mobile-spanish.png") });
    expect(errors).toEqual([]);
});
test("canceling Parts deletion leaves the record and car price untouched", async ({ page }) => {
    const initial = seedParts(1);
    initial[0].carId = 1;
    initial[0].carName = "Toyota Car1";
    const api = await mockParts(page, initial);
    const prices = carOptions.map(car => car.price);
    await openParts(page);
    await page.getByRole("button", { name: "Delete part", exact: true }).click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog.getByRole("heading", { name: "Delete this part?" })).toBeVisible();
    await expect(dialog).toContainText("Maker1");
    await expect(dialog).toContainText("Part 1");
    await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
    expect(api.deletedIds).toHaveLength(0);
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Maker1", exact: true })).toBeVisible();
    expect(api.parts).toHaveLength(1);
    expect(api.deletedIds).toHaveLength(0);
    expect(carOptions.map(car => car.price)).toEqual(prices);
});

test("deleting the only part on the final page resets its edit form and page", async ({ page }) => {
    const api = await mockParts(page, seedParts(13));
    await openParts(page);
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Maker13", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Edit part", exact: true }).click();
    await expect(page.getByLabel("Manufacturer", { exact: true })).toHaveValue("Maker13");
    await page.getByRole("button", { name: "Delete part", exact: true }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete part", exact: true }).click();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    await expect(page.getByText("Part deleted.", { exact: true })).toBeVisible();
    await expect(page.getByText("Showing 12 of 12 parts", { exact: true })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Parts pages" })).toHaveCount(0);
    await expect(page.getByRole("form", { name: "Add part" })).toBeVisible();
    await expect(page.getByLabel("Manufacturer", { exact: true })).toHaveValue("");
    expect(api.deletedIds).toEqual(["00000000-0000-0000-0000-000000000013"]);
    expect(api.forbidden).toEqual([]);
});

test("failed deletion can be retried and a pending deletion cannot be submitted twice", async ({ page }) => {
    const api = await mockParts(page, seedParts(1));
    await openParts(page);
    api.deleteFailure = { status: 503, body: {} };
    await page.getByRole("button", { name: "Delete part", exact: true }).click();
    const dialog = page.getByRole("alertdialog");
    await dialog.getByRole("button", { name: "Delete part", exact: true }).click();
    await expect(dialog.getByRole("alert")).toHaveText("Could not delete part.");
    await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeEnabled();
    expect(api.deletedIds).toHaveLength(0);
    api.deleteFailure = null;
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    api.beforeDelete = () => pending;
    await dialog.getByRole("button", { name: "Delete part", exact: true }).click();
    await expect(dialog.getByRole("button", { name: "Deleting...", exact: true })).toBeDisabled();
    await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeDisabled();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    release();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByText("No parts found.", { exact: true })).toBeVisible();
    expect(api.deletedIds).toHaveLength(1);
});

test("an already deleted part refreshes the list after a 404", async ({ page }) => {
    const api = await mockParts(page, seedParts(1));
    await openParts(page);
    await page.getByRole("button", { name: "Delete part", exact: true }).click();
    api.parts = [];
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete part", exact: true }).click();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    await expect(page.getByText("Showing 0 of 0 parts", { exact: true })).toBeVisible();
    await expect(page.getByText("Part deleted.", { exact: true })).toBeVisible();
    expect(api.deletedIds).toHaveLength(0);
});

test("delete confirmation supports Arabic mobile layout and Spanish", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const initial = seedParts(1);
    initial[0].description = "A".repeat(500);
    await mockParts(page, initial);
    await openParts(page);
    await page.locator("#language").selectOption("ar");
    await page.getByRole("button", { name: "حذف القطعة", exact: true }).click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog.getByRole("heading", { name: "حذف القطعة؟", exact: true })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "إلغاء", exact: true })).toBeFocused();
    const box = await dialog.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(360);
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath("parts-delete-arabic.png") });
    await dialog.getByRole("button", { name: "إلغاء", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await page.locator("#language").selectOption("es");
    await page.getByRole("button", { name: "Eliminar pieza", exact: true }).click();
    await expect(dialog.getByRole("heading", { name: "¿Eliminar la pieza?", exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
    await expect(dialog).toHaveCount(0);
});
