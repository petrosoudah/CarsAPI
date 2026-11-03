import { getCars, type Car } from "@/lib/cars-api";

export type Part = {
    id: string;
    manufacturer: string;
    description: string;
    price: number;
    carId: number | null;
    carName: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is missing from .env.local.");
}

const PARTS_URL = API_BASE_URL.replace(/\/+$/, "") + "/parts";

export async function getCarsForPartForm(
    signal: AbortSignal
): Promise<Car[]> {
    const cars: Car[] = []

    let pageNumber = 1;

    while (true) {
        const data = await getCars({
            signal,
            pageNumber,
            search: "",

            availability: "all",


        });

        cars.push(...data.items);
        if (cars.length >= data.totalCount || data.items.length === 0) {
            return cars;
        }
                pageNumber++;
    }
}

export async function getParts(signal: AbortSignal): Promise<Part[]> {
    const response = await fetch(PARTS_URL + "/list", { signal });

    if (!response.ok) {
        throw new Error("Could not load parts (" + response.status + ").");
    }

    return response.json();
}

export type PartDetails = Pick<
    Part,
    "manufacturer" | "description" | "price" | "carId"
>;

export async function addPart(details: PartDetails): Promise<void> {
    const response = await fetch(PARTS_URL + "/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(details),
    });

    if (!response.ok) {
        throw new Error("Could not add part (" + response.status + ").");
    }
}

export async function updatePart(
    id: string,
    details: PartDetails
): Promise<void> {
    const response = await fetch(
        PARTS_URL + "/" + encodeURIComponent(id),
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id,
                ...details,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Could not update part (" + response.status + ").");
    }
}