import { getCars, type Car } from "@/lib/cars-api";

export type Part = {
    id: string;
    manufacturer: string;
    description: string;
    price: number;
    carId: number | null;
    carName: string | null;
};

export type PartDetails = Pick<Part, "manufacturer" | "description" | "price" | "carId">;
export const PARTS_PAGE_SIZE = 12;

export class PartValidationError extends Error {
    constructor(public readonly fields: Record<string, string[]>) {
        super(Object.values(fields).flat().join(" "));
        this.name = "PartValidationError";
    }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is missing from .env.local.");
}
const PARTS_URL = API_BASE_URL.replace(/\/+$/, "") + "/parts";

async function readPartError(response: Response, fallback: string): Promise<Error> {
    try {
        const problem: unknown = await response.json();
        if (typeof problem === "string" && problem.trim()) return new Error(problem);
        if (problem && typeof problem === "object") {
            const body = problem as { errors?: unknown; detail?: unknown; title?: unknown };
            if (body.errors && typeof body.errors === "object") {
                const fields: Record<string, string[]> = {};
                for (const [field, messages] of Object.entries(body.errors)) {
                    if (Array.isArray(messages)) {
                        const text = messages.filter((message): message is string => typeof message === "string");
                        if (text.length) fields[field] = text;
                    }
                }
                if (Object.keys(fields).length) return new PartValidationError(fields);
            }
            if (typeof body.detail === "string" && body.detail) return new Error(body.detail);
            if (typeof body.title === "string" && body.title) return new Error(body.title);
        }
    } catch {
        // An empty or non-JSON error response still gets a useful fallback.
    }
    return new Error(fallback);
}

export async function getCarsForPartForm(signal: AbortSignal): Promise<Car[]> {
    const cars: Car[] = [];
    let pageNumber = 1;
    while (true) {
        const data = await getCars({ signal, pageNumber, search: "", availability: "all" });
        cars.push(...data.items);
        if (cars.length >= data.totalCount || data.items.length === 0) return cars;
        pageNumber++;
    }
}

export async function getParts(
    signal: AbortSignal,
    pageNumber = 1
): Promise<{ items: Part[]; totalCount: number }> {
    const query = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(PARTS_PAGE_SIZE) });
    const response = await fetch(PARTS_URL + "/list?" + query, { signal, cache: "no-store" });
    if (!response.ok) {
        throw await readPartError(response, "Could not load parts (" + response.status + ").");
    }
    const items: Part[] = await response.json();
    const totalHeader = response.headers.get("X-Total-Count");
    const totalCount = Number(totalHeader);
    if (!Array.isArray(items) || totalHeader === null || !Number.isSafeInteger(totalCount) || totalCount < items.length) {
        throw new Error("Pagination information is missing. Restart the updated CarsAPI server.");
    }
    return { items, totalCount };
}

export async function addPart(details: PartDetails): Promise<void> {
    const response = await fetch(PARTS_URL + "/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
    });
    if (!response.ok) {
        throw await readPartError(response, "Could not add part (" + response.status + ").");
    }
}

export async function updatePart(id: string, details: PartDetails): Promise<void> {
    const response = await fetch(PARTS_URL + "/" + encodeURIComponent(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...details }),
    });
    if (!response.ok) {
        throw await readPartError(response, "Could not update part (" + response.status + ").");
    }
}

export async function deletePart(id: string): Promise<void> {
    const response = await fetch(PARTS_URL + "/" + encodeURIComponent(id), { method: "DELETE" });
    // Another client may already have removed it; refreshing reaches the same result.
    if (response.status === 404) return;
    if (!response.ok) {
        throw await readPartError(response, "Could not delete part (" + response.status + ").");
    }
}
  
