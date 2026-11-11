"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CARS_PAGE_SIZE, deleteCar, getCars, saveCar, type Car, type CarDetails } from "@/lib/api/cars-api";
import { queryKeys } from "@/lib/api/query-keys";

type CarsQuery = {
    search: string;
    availability: string;
    pageNumber: number;
};

const initialQuery: CarsQuery = { search: "", availability: "all", pageNumber: 1 };

export default function useCars() {
    const client = useQueryClient();
    const [query, setQuery] = useState(initialQuery);
    const latestQuery = useRef(query);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const { search, availability, pageNumber } = query;
    useEffect(() => {
        latestQuery.current = query;
    }, [query]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 250);
        return () => clearTimeout(timer);
    }, [search]);

    const listKey = queryKeys.carList(debouncedSearch, availability, pageNumber);
    const list = useQuery({
        queryKey: listKey,
        queryFn: ({ signal }) => getCars({ signal, pageNumber, search: debouncedSearch, availability }),
        placeholderData: keepPreviousData,
    });
    const changingSearch = search !== debouncedSearch;
    const loading = changingSearch || list.isFetching;
    const cars = list.data?.items ?? [];
    const totalCount = list.data?.totalCount ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / CARS_PAGE_SIZE));

    if (!loading && !list.isError && pageNumber > totalPages) {
        setQuery(previous => ({ ...previous, pageNumber: totalPages }));
    }

    const refresh = useCallback((firstPage = false) => {
        if (firstPage) setQuery(previous => ({ ...previous, pageNumber: 1 }));
        void client.invalidateQueries({ queryKey: queryKeys.cars });
    }, [client]);

    const changeSearch = useCallback((value: string) => {
        setQuery(previous => ({ ...previous, search: value, pageNumber: 1 }));
    }, []);

    const changeAvailability = useCallback((value: string) => {
        setQuery(previous => ({ ...previous, availability: value, pageNumber: 1 }));
    }, []);

    const changePage = useCallback((value: number) => {
        setQuery(previous => ({ ...previous, pageNumber: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setQuery({ search: "", availability: "all", pageNumber: 1 });
    }, []);

    const applyCarUpdate = useCallback((updatedCar: Car) => {
        const current = latestQuery.current;
        const currentKey = queryKeys.carList(
            current.search, current.availability, current.pageNumber
        );
        if (current.availability !== "all" || current.search !== debouncedSearch ||
            client.isFetching({ queryKey: queryKeys.cars }) > 0) {
            refresh();
            return;
        }
        client.setQueryData<{ items: Car[]; totalCount: number }>(
            currentKey, previous =>
            previous
                ? { ...previous, items: previous.items.map(car =>
                    car.id === updatedCar.id ? updatedCar : car) }
                : previous
        );
        client.setQueryData(queryKeys.car(String(updatedCar.id)), updatedCar);
    }, [client, debouncedSearch, refresh]);

    // Optimistic create
    const createMutation = useMutation({
        mutationFn: (details: CarDetails) => saveCar(details, null),
        onMutate: async (newCar) => {
            await client.cancelQueries({ queryKey: queryKeys.cars });
            const previousCars = client.getQueryData<{ items: Car[]; totalCount: number }>(listKey);
            const tempId = Date.now();
            const optimisticCar: Car = { ...newCar, id: tempId, isAvailable: newCar.isAvailable ?? true };
            client.setQueryData<{ items: Car[]; totalCount: number }>(listKey, (old) => old ? { ...old, items: [optimisticCar, ...old.items], totalCount: old.totalCount + 1 } : old);
            return { previousCars };
        },
        onError: (_err, _newCar, context) => {
            if (context?.previousCars) client.setQueryData(listKey, context.previousCars);
        },
        onSettled: () => {
            client.invalidateQueries({ queryKey: queryKeys.cars });
        },
    });

    // Optimistic delete
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteCar(id),
        onMutate: async (id) => {
            await client.cancelQueries({ queryKey: queryKeys.cars });
            const previousCars = client.getQueryData<{ items: Car[]; totalCount: number }>(listKey);
            client.setQueryData<{ items: Car[]; totalCount: number }>(listKey, (old) => old ? { ...old, items: old.items.filter((car: Car) => car.id !== id), totalCount: old.totalCount - 1 } : old);
            client.removeQueries({ queryKey: queryKeys.car(String(id)) });
            return { previousCars };
        },
        onError: (_err, _id, context) => {
            if (context?.previousCars) client.setQueryData(listKey, context.previousCars);
        },
        onSettled: () => {
            client.invalidateQueries({ queryKey: queryKeys.cars });
        },
    });

    // Optimistic update
    const updateMutation = useMutation({
        mutationFn: ({ id, details }: { id: number; details: CarDetails }) => saveCar(details, { id } as Car),
        onMutate: async ({ id, details }) => {
            await client.cancelQueries({ queryKey: queryKeys.cars });
            const previousCars = client.getQueryData<{ items: Car[]; totalCount: number }>(listKey);
            const optimisticCar: Car = { id, ...details };
            client.setQueryData<{ items: Car[]; totalCount: number }>(listKey, (old) =>
                old ? { ...old, items: old.items.map((car) => (car.id === id ? optimisticCar : car)) } : old
            );
            client.setQueryData(queryKeys.car(String(id)), optimisticCar);
            return { previousCars };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousCars) client.setQueryData(listKey, context.previousCars);
        },
        onSettled: () => {
            client.invalidateQueries({ queryKey: queryKeys.cars });
        },
    });

    return {
        cars, totalCount, loading,
        error: list.error instanceof Error ? list.error.message : "",
        query, totalPages, hasFilters: search !== "" || availability !== "all",
        refresh, changeSearch, changeAvailability, changePage, clearFilters, applyCarUpdate,
        createCar: createMutation.mutateAsync,
        updateCar: updateMutation.mutateAsync,
        deleteCar: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
