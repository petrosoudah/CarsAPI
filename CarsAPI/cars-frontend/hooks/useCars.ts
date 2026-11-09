"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { CARS_PAGE_SIZE, getCars, type Car } from "@/lib/api/cars-api";
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

    return {
        cars, totalCount, loading,
        error: list.error instanceof Error ? list.error.message : "",
        query, totalPages, hasFilters: search !== "" || availability !== "all",
        refresh, changeSearch, changeAvailability, changePage, clearFilters, applyCarUpdate,
    };
}
