import type { Car } from "@/lib/api/cars-api";

export type DialogState =
    | { type: "closed" }
    | { type: "form"; car: Car | null }
    | { type: "delete"; car: Car };