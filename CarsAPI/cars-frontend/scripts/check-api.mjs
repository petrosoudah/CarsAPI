import assert from "node:assert/strict";

// Read-only integration checks. Start the updated API first.
const base = (process.env.API_CHECK_BASE_URL || "http://localhost:5154").replace(/\/+$/, "");
const origin = process.env.API_CHECK_ORIGIN || "http://localhost:3000";
const response = await fetch(base + "/cars?pageNumber=1&pageSize=1", { headers: { Origin: origin } });
assert.equal(response.status, 200);
assert.equal(response.headers.get("access-control-allow-origin"), origin);
assert.match(response.headers.get("access-control-expose-headers"), /X-Total-Count/i);
const total = Number(response.headers.get("x-total-count"));
assert.ok(response.headers.has("x-total-count") && Number.isInteger(total) && total >= 0);
const first = await response.json();
assert.equal(first.length, Math.min(total, 1));

if (total > 1) {
    const second = await (await fetch(base + "/cars?pageNumber=2&pageSize=1")).json();
    assert.equal(second.length, 1);
    assert.ok(second[0].id > first[0].id, "Paging must have a stable ID order");
}
if (first.length) {
    const search = (first[0].make + " " + first[0].model).toLowerCase();
    const result = await fetch(base + "/cars?pageSize=100&search=" + encodeURIComponent(search));
    const matches = await result.json();
    assert.ok(matches.some(car => car.id === first[0].id));
    assert.ok(matches.every(car => (car.make + " " + car.model).toLowerCase().includes(search)));
}
for (const available of [true, false]) {
    const filtered = await fetch(base + "/cars?pageSize=100&isAvailable=" + available);
    assert.equal(filtered.status, 200);
    const cars = await filtered.json();
    assert.ok(cars.every(car => car.isAvailable === available));
    assert.ok(Number(filtered.headers.get("x-total-count")) >= cars.length);
}
assert.equal((await fetch(base + "/cars?pageNumber=0")).status, 400);
assert.equal((await fetch(base + "/cars?pageSize=101")).status, 400);
const preflight = await fetch(base + "/cars", { method: "OPTIONS", headers: {
    Origin: origin, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type",
} });
assert.equal(preflight.status, 204);
assert.equal(preflight.headers.get("access-control-allow-origin"), origin);
const blocked = await fetch(base + "/cars", { headers: { Origin: "https://unlisted.example" } });
assert.equal(blocked.headers.get("access-control-allow-origin"), null);
console.log("API checks passed: paging/count, global search, availability, bad paging, CORS, preflight. No data was modified.");
