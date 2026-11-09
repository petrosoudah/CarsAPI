"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateCarAvailability, type Car } from "@/lib/api/cars-api";

export default function useCarActions(
    car: Car,
    onUpdated: (updatedCar: Car) => void
) {
    const inFlight = useRef(false);
    const [state, setState] = useState({
        error: "",
    });
    const mutation = useMutation({ mutationFn: updateCarAvailability });

    async function toggleAvailability() {
        // A ref changes immediately, so even two calls before a render cannot duplicate a write.
        if (inFlight.current) return;
        inFlight.current = true;

        setState({ error: "" });

        try {
            const updatedCar = await mutation.mutateAsync(car);

            onUpdated(updatedCar);
        } catch (err) {
            setState({
                error: err instanceof Error
                    ? err.message
                    : "Could not update availability.",
            });
        } finally {
            inFlight.current = false;
        }
    }

    return {
        pending: mutation.isPending,
        error: state.error,
        toggleAvailability,
    };
}
