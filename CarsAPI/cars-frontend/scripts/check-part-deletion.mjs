import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

// Run against an explicitly selected development/test API.
// This creates one uniquely marked part and deletes only that test fixture.
const configuredBase = process.env.API_CHECK_BASE_URL;
if (!configuredBase) throw new Error("Set API_CHECK_BASE_URL to your development/test API before running this check.");
const base = configuredBase.replace(/\/+$/, "");
const manufacturer = "Deletion check " + randomUUID();
const description = "Temporary record for the Parts DELETE integration check.";
let fixtureId;

async function findFixtures() {
    const found = [];
    for (let page = 1; ; page++) {
        const response = await fetch(base + "/parts/list?pageSize=100&pageNumber=" + page);
        assert.equal(response.status, 200);
        const items = await response.json();
        assert.ok(Array.isArray(items));
        found.push(...items.filter(part => part.manufacturer === manufacturer && part.description === description));
        if (items.length < 100) return found;
    }
}

async function removeFixture(id) {
    const check = await fetch(base + "/parts/" + encodeURIComponent(id));
    if (check.status === 404) return;
    assert.equal(check.status, 200);
    const record = await check.json();
    assert.equal(record.manufacturer, manufacturer, "Refusing to delete a record not created by this check");
    assert.equal(record.description, description, "Fixture description must match before deletion");
    const deleted = await fetch(base + "/parts/" + encodeURIComponent(id), { method: "DELETE" });
    assert.equal(deleted.status, 204);
    assert.equal(await deleted.text(), "");
}

try {
    const carsResponse = await fetch(base + "/cars?pageNumber=1&pageSize=1");
    assert.equal(carsResponse.status, 200);
    const cars = await carsResponse.json();
    const car = cars[0] ?? null;
    const carBefore = car ? await (await fetch(base + "/cars/" + car.id)).json() : null;
    const created = await fetch(base + "/parts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manufacturer, description, price: 0, carId: car?.id ?? null }),
    });
    assert.equal(created.status, 201);
    const record = await created.json();
    assert.match(record.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    fixtureId = record.id;
    assert.equal(record.manufacturer, manufacturer);
    await removeFixture(fixtureId);
    assert.equal((await fetch(base + "/parts/" + fixtureId)).status, 404);
    assert.equal((await fetch(base + "/parts/" + fixtureId, { method: "DELETE" })).status, 404);
    if (car) {
        const carAfter = await (await fetch(base + "/cars/" + car.id)).json();
        assert.equal(carAfter.id, carBefore.id);
        assert.equal(carAfter.price, carBefore.price, "Deleting a part must leave its car price unchanged");
    }
    const preflight = await fetch(base + "/parts/" + fixtureId, {
        method: "OPTIONS",
        headers: { Origin: "http://localhost:3000", "Access-Control-Request-Method": "DELETE" },
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), "http://localhost:3000");
    assert.match(preflight.headers.get("access-control-allow-methods"), /DELETE/);
    console.log("Parts API deletion passed: create fixture, DELETE 204, GET/DELETE 404, unchanged car price, and CORS.");
} finally {
    // Also handles failures after creation but before the response could be checked.
    for (const part of await findFixtures()) await removeFixture(part.id);
    assert.equal((await findFixtures()).length, 0);
    console.log("Temporary deletion-check records cleaned up.");
}
