"use client";

import { useEffect, useState } from "react";
import { CARS_PAGE_SIZE, getCars, updateCarAvailability, type Car } from "@/lib/cars-api";
import CarCard from "@/components/cars/CarCard";
import CarFormDialog from "@/components/cars/CarFormDialog";
import DeleteCarDialog from "@/components/cars/DeleteCarDialog";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import CarFilter from "./CarFilter";
import { useTranslations } from "next-intl";
import useTranslatedError from "@/components/cars/useTranslatedError";

export default function Home() {
    const t = useTranslations("Dashboard");
    const translateError = useTranslatedError();
    const [cars, setCars] = useState<Car[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [availability, setAvailability] = useState("all");
    const [formOpen, setFormOpen] = useState(false);
    const [editingCar, setEditingCar] = useState<Car | null>(null);
    const [carToDelete, setCarToDelete] = useState<Car | null>(null);
    const [actionError, setActionError] = useState("");
    const [updatingAvailability, setUpdatingAvailability] = useState(false);
    const [loadAttempt, setLoadAttempt] = useState(0);
    const totalPages = Math.max(1, Math.ceil(totalCount / CARS_PAGE_SIZE));

    useEffect(() => {
        const controller = new AbortController();
        async function loadCars() {
            try {
                const data = await getCars({ signal: controller.signal, pageNumber, search, availability });
                if (!controller.signal.aborted) {
                    setCars(data.items);
                    setTotalCount(data.totalCount);
                    // A deletion in another tab can remove the last page.
                    const lastPage = Math.max(1, Math.ceil(data.totalCount / CARS_PAGE_SIZE));
                    if (pageNumber > lastPage) setPageNumber(lastPage);
                }
            } catch (err) {
                if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load cars.");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        // Debounce typing and abort superseded requests.
        const timer = setTimeout(loadCars, 250);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [pageNumber, search, availability, loadAttempt]);

    function reload() {
        setLoading(true);
        setError("");
        setActionError("");
        setLoadAttempt(previous => previous + 1);
    }

    function changePage(page: number) {
        setPageNumber(page);
        reload();
    }

    function changeSearch(value: string) {
        setSearch(value);
        setPageNumber(1);
        reload();
    }

    function changeAvailability(value: string) {
        setAvailability(value);
        setPageNumber(1);
        reload();
    }

    function handleSaved() {
        setFormOpen(false);
        if (!editingCar) setPageNumber(1);
        reload();
    }

    async function toggleCarAvailability(carId: number) {
        if (updatingAvailability || loading || formOpen || carToDelete !== null) return;
        const existingCar = cars.find(car => car.id === carId);
        if (!existingCar) return;
        setUpdatingAvailability(true);
        setActionError("");
        try {
            await updateCarAvailability(existingCar);
            reload();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Update failed.");
        } finally {
            setUpdatingAvailability(false);
        }
    }

    return (
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-3xl font-bold">{t("title")}</h1>
                    <p className="text-muted-foreground">{t("description")}</p>
                </div>
                <Button disabled={loading || Boolean(error) || updatingAvailability} onClick={() => {
                    setEditingCar(null);
                    setFormOpen(true);
                }}>
                    {t("addCar")}
                </Button>
            </header>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                    <CarFilter search={search} onSearchChange={changeSearch} />
                </div>
                <NativeSelect value={availability} onChange={event => changeAvailability(event.target.value)}
                    aria-label={t("filterLabel")}>
                    <NativeSelectOption value="all">{t("all")}</NativeSelectOption>
                    <NativeSelectOption value="available">{t("available")}</NativeSelectOption>
                    <NativeSelectOption value="sold">{t("sold")}</NativeSelectOption>
                </NativeSelect>
                {(search !== "" || availability !== "all") && (
                    <Button variant="outline" onClick={() => {
                        setSearch("");
                        changeAvailability("all");
                    }}>{t("clearFilter")}</Button>
                )}
            </div>

            <section aria-busy={loading} aria-label={t("listLabel")} className="space-y-4">
                {loading && <p role="status">{t("loading")}</p>}
                {error && (
                    <div className="space-y-2">
                        <p role="alert" className="text-destructive">{translateError(error)}</p>
                        <Button variant="outline" onClick={reload}>{t("retry")}</Button>
                    </div>
                )}
                {!loading && !error && (
                    <>
                        <p role="status" className="text-sm text-muted-foreground">
                            {t("results", { count: cars.length, total: totalCount })}
                        </p>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {cars.map(car => (
                                <CarCard key={car.id} car={car} busy={updatingAvailability}
                                    onToggle={() => toggleCarAvailability(car.id)}
                                    onEdit={() => { setEditingCar(car); setFormOpen(true); }}
                                    onDelete={() => setCarToDelete(car)} />
                            ))}
                        </div>
                        {cars.length === 0 && <p className="text-muted-foreground">{t("noCars")}</p>}
                    </>
                )}
                {actionError && <p role="alert" className="text-destructive">{translateError(actionError)}</p>}
            </section>

            {!error && totalCount > CARS_PAGE_SIZE && (
                <nav aria-label={t("pagination")} className="flex flex-wrap items-center justify-center gap-3">
                    <Button variant="outline" disabled={loading || updatingAvailability || pageNumber <= 1}
                        onClick={() => changePage(pageNumber - 1)}>{t("previous")}</Button>
                    <span role="status">{t("page", { page: pageNumber, pages: totalPages })}</span>
                    <Button variant="outline" disabled={loading || updatingAvailability || pageNumber >= totalPages}
                        onClick={() => changePage(pageNumber + 1)}>{t("next")}</Button>
                </nav>
            )}

            {formOpen && <CarFormDialog car={editingCar} onClose={() => setFormOpen(false)} onSaved={handleSaved} />}
            {carToDelete && <DeleteCarDialog car={carToDelete} onClose={() => setCarToDelete(null)}
                onDeleted={() => {
                    setCarToDelete(null);
                    if (cars.length === 1 && pageNumber > 1) setPageNumber(previous => previous - 1);
                    reload();
                }} />}
        </main>
    );
}
