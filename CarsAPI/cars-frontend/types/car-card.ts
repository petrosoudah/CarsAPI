import type { Car } from "@/lib/api/cars-api";

export type CarCardProps = {
    car: Car;
    busy: boolean;
    onUpdated: (updatedCar: Car) => void;
    onEdit: (car: Car) => void;
    onDelete: (car: Car) => void;
};