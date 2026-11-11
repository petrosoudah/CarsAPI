import type { Car } from "@/lib/api/cars-api";

export type DeleteCarDialogProps = {
    car: Car;
    onClose: () => void;
    onDelete: (car: Car) => Promise<void>;
    isDeleting?: boolean;
};