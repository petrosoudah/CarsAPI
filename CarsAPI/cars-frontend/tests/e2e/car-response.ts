import type { Car } from "../../lib/api/cars-api";

export function carResponse(car: Car) {
    return {
        ...car,
        year: { value: car.year },
        horsepower: { value: car.horsepower },
        price: car.price === null ? null : { amount: car.price, currency: "USD" },
    };
}
