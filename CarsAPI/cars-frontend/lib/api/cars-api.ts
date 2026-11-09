export type Car = {
    id: number;
    make: string;
    model: string;
    year: number;
    horsepower: number;
    price: number | null;
    color: string | null;
    isAvailable: boolean;
};

export type CarDetails = Pick<Car, "make" | "model" | "year" | "horsepower" | "price" | "color" | "isAvailable">;

// API response types (matching backend Value Object serialization)
type ApiCar = {
    id: number;
    make: string;
    model: string;
    year: { value: number };
    horsepower: { value: number };
    price: { amount: number; currency: string } | null;
    color: string | null;
    isAvailable: boolean;
    createdAt: string;
    domainEvents?: unknown[];
};

function toCar(apiCar: ApiCar): Car {
    return {
        id: apiCar.id,
        make: apiCar.make,
        model: apiCar.model,
        year: apiCar.year.value,
        horsepower: apiCar.horsepower.value,
        price: apiCar.price?.amount ?? null,
        color: apiCar.color,
        isAvailable: apiCar.isAvailable
    };
}

function toCarDetails(car: Car): CarDetails {
    return {
        make: car.make,
        model: car.model,
        year: car.year,
        horsepower: car.horsepower,
        price: car.price,
        color: car.color,
        isAvailable: car.isAvailable
    };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is missing from .env.local.");
}

const CARS_URL = API_BASE_URL.replace(/\/+$/, "") + "/cars";
export const CARS_PAGE_SIZE = 12;

export class CarValidationError extends Error {
    constructor(public readonly fields: Record<string, string[]>) {
        super(Object.values(fields).flat().join(" "));
        this.name = "CarValidationError";
    }
}
type ApiProblem = {
    errors?: Record<string, string[]>;
    detail?: string;
    title?: string;
};

async function readApiError(
    response: Response,
    fallback: string
): Promise<Error> {
    try {
        const problem: ApiProblem = await response.json();
        const messages = Object.values(problem.errors ?? {}).flat();

        if (messages.length > 0) {
            return new CarValidationError(problem.errors!);
        }

        return new Error(problem.detail || problem.title || fallback);
    } catch {
        return new Error(fallback);
    }
}

export async function getCars({ signal, pageNumber, search, availability }: {
    signal: AbortSignal;
    pageNumber: number;
    search: string;
    availability: string;
}): Promise<{ items: Car[]; totalCount: number }> {
    const query = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(CARS_PAGE_SIZE) });
    if (search.trim()) query.set("search", search.trim());
    if (availability !== "all") query.set("isAvailable", String(availability === "available"));
    const response = await fetch(CARS_URL + "?" + query, { signal, cache: "no-store" });
    if (!response.ok) {
        throw new Error("Could not load cars (" + response.status + ").");
    }
    const apiItems: ApiCar[] = await response.json();
    const items = apiItems.map(toCar);
    const totalHeader = response.headers.get("X-Total-Count");
    const totalCount = Number(totalHeader);
    if (totalHeader === null || !Number.isSafeInteger(totalCount) || totalCount < items.length) {
        throw new Error("Pagination information is missing. Restart the updated CarsAPI server.");
    }
    return { items, totalCount };
}

export async function saveCar(details: CarDetails, car: Car | null): Promise<Car> {
    const body = car
        ? {
            id: car.id,
            ...details
        }
        : {
            ...details,
            isAvailable: details.isAvailable ?? true
        };

    const response = await fetch(car ? CARS_URL + "/" + car.id : CARS_URL, {
        method: car ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const message = await readApiError(
            response,
            "Could not save car (" + response.status + ")."
        );

        throw message;
    }
    const apiCar: ApiCar = await response.json();
    return toCar(apiCar);
}

export async function deleteCar(id: number): Promise<void> {
    const response = await fetch(CARS_URL + "/" + id, { method: "DELETE" });
    if (!response.ok) {
        throw await readApiError(response, "Could not delete car (" + response.status + ").");
    }
}

export async function getCar(
    id: string,
    signal: AbortSignal
): Promise<Car | null> {
    const response = await fetch(
        CARS_URL + "/" + encodeURIComponent(id),
        { signal }
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(
            "Could not load car (" + response.status + ")."
        );
    }

    const apiCar: ApiCar = await response.json();
    return toCar(apiCar);
}

export async function updateCarAvailability(car: Car): Promise<Car> {
    const response = await fetch(CARS_URL + "/" + car.id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: car.id,
            ...toCarDetails(car),
            isAvailable: !car.isAvailable
        })
    });

    if (!response.ok) {
        throw await readApiError(response, "Could not update availability.");
    }

    const apiCar: ApiCar = await response.json();
    return toCar(apiCar);
}
