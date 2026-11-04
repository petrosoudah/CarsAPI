"use client";

import { useRef, useState } from "react";
import { updateCarAvailability, type Car } from "@/lib/api/cars-api";

export default function useCarActions(
    car: Car,
    onUpdated: (updatedCar: Car) => void
) {
    const inFlight = useRef(false);
    const [state, setState] = useState({
        pending: false,
        error: "",
    });

    async function toggleAvailability() {
        // A ref changes immediately, so even two calls before a render cannot duplicate a write.
        if (inFlight.current) return;
        inFlight.current = true;

        setState({ pending: true, error: "" });

        try {
            const updatedCar = await updateCarAvailability(car);

            onUpdated(updatedCar);
        } catch (err) {
            setState(previous => ({
                ...previous,
                error: err instanceof Error
                    ? err.message
                    : "Could not update availability.",
            }));
        } finally {
            inFlight.current = false;
            setState(previous => ({
                ...previous,
                pending: false,
            }));
        }
    }

    return {
        pending: state.pending,
        error: state.error,
        toggleAvailability,
    };
}
