import type { Car } from "@/lib/api/cars-api";
import type { CarDetails } from "@/lib/api/cars-api";

export type CarFormDialogProps = {
    car: Car | null;
    onClose: () => void;
    onSubmit: (details: CarDetails) => Promise<void>;
    isSubmitting?: boolean;
};