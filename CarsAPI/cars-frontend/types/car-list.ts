import type { Car } from "@/lib/api/cars-api";

export type CarListProps = {
    cars: Car[];
    totalCount: number;
    loading: boolean;
    error: string;
    busy: boolean;
    hasFilters: boolean;
    onRetry: () => void;
    onClear: () => void;
    onCreate: () => void;
    onUpdated: (car: Car) => void;
    onEdit: (car: Car) => void;
    onDelete: (car: Car) => void;
};