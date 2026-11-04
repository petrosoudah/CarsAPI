"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CARS_PAGE_SIZE, getCars, type Car } from "@/lib/api/cars-api";

export type CarsQuery = {
    search: string;
    availability: string;
    pageNumber: number;
    revision: number;
};

type CarsResult = {
    items: Car[];
    totalCount: number;
    loading: boolean;
    error: string;
};

const initialQuery: CarsQuery = {
    search: "", availability: "all", pageNumber: 1, revision: 0,
};

export default function useCars() {
    const [query, setQuery] = useState(initialQuery);
    const [result, setResult] = useState<CarsResult>({
        items: [], totalCount: 0, loading: true, error: "",
    });
    const activeRequest = useRef<AbortController | null>(null);
    const latestQuery = useRef(query);

    // Event callbacks need the current filter even if their card has unmounted.
    useEffect(() => {
        latestQuery.current = query;
    }, [query]);

    const requestList = useCallback((change: (previous: CarsQuery) => CarsQuery) => {
        // Stop the old request immediately, before the next Effect cleanup.
        activeRequest.current?.abort();
        setResult(previous => ({ ...previous, loading: true, error: "" }));
        setQuery(previous => ({
            ...change(previous),
            revision: previous.revision + 1,
        }));
    }, []);

    const refresh = useCallback((firstPage = false) => {
        requestList(previous => ({
            ...previous,
            pageNumber: firstPage ? 1 : previous.pageNumber,
        }));
    }, [requestList]);

    const changeSearch = useCallback((search: string) => {
        requestList(previous => ({ ...previous, search, pageNumber: 1 }));
    }, [requestList]);

    const changeAvailability = useCallback((availability: string) => {
        requestList(previous => ({ ...previous, availability, pageNumber: 1 }));
    }, [requestList]);

    const changePage = useCallback((pageNumber: number) => {
        requestList(previous => ({ ...previous, pageNumber }));
    }, [requestList]);

    const clearFilters = useCallback(() => {
        requestList(previous => ({ ...previous, search: "", availability: "all", pageNumber: 1 }));
    }, [requestList]);

    const { search, availability, pageNumber, revision } = query;

    useEffect(() => {
        const controller = new AbortController();
        activeRequest.current = controller;

        async function loadCars() {
            try {
                const data = await getCars({
                    signal: controller.signal, pageNumber, search, availability,
                });
                if (controller.signal.aborted) return;

                const lastPage = Math.max(1, Math.ceil(data.totalCount / CARS_PAGE_SIZE));
                if (pageNumber > lastPage) {
                    requestList(previous => ({ ...previous, pageNumber: lastPage }));
                    return;
                }

                setResult({
                    items: data.items, totalCount: data.totalCount,
                    loading: false, error: "",
                });
            } catch (err) {
                if (!controller.signal.aborted) {
                    setResult(previous => ({
                        ...previous, loading: false,
                        error: err instanceof Error ? err.message : "Could not load cars.",
                    }));
                }
            } finally {
                if (activeRequest.current === controller) activeRequest.current = null;
            }
        }

        const timer = setTimeout(loadCars, 250);
        return () => {
            clearTimeout(timer);
            controller.abort();
            if (activeRequest.current === controller) activeRequest.current = null;
        };
    }, [search, availability, pageNumber, revision, requestList]);

    const applyCarUpdate = useCallback((updatedCar: Car) => {
        // A filtered list may need a replacement row and a new total count.
        // Refresh an in-flight list too, so an older GET cannot undo this update.
        if (latestQuery.current.availability !== "all" || activeRequest.current) {
            refresh();
            return;
        }
        setResult(previous => ({
            ...previous,
            items: previous.items.map(car => car.id === updatedCar.id ? updatedCar : car),
        }));
    }, [refresh]);

    return {
        cars: result.items, totalCount: result.totalCount,
        loading: result.loading, error: result.error, query,
        totalPages: Math.max(1, Math.ceil(result.totalCount / CARS_PAGE_SIZE)),
        hasFilters: search !== "" || availability !== "all",
        refresh, changeSearch, changeAvailability, changePage,
        clearFilters, applyCarUpdate,
    };
}
