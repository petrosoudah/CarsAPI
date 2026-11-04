"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import type { Car } from "@/lib/api/cars-api";
import useCars from "@/hooks/useCars";
import CarFilters from "@/components/cars/CarFilters";
import CarList from "@/components/cars/CarList";
import CarPagination from "@/components/cars/CarPagination";
import CarFormDialog from "@/components/cars/CarFormDialog";
import DeleteCarDialog from "@/components/cars/DeleteCarDialog";
import { Button } from "@/components/ui/button";

type DialogState =
    | { type: "closed" }
    | { type: "form"; car: Car | null }
    | { type: "delete"; car: Car };

export default function Home() {
    const t = useTranslations("Dashboard");
    const [notice, setNotice] = useState<"saved" | "deleted" | null>(null);
    const [dialog, setDialog] = useState<DialogState>({ type: "closed" });
    const {
        cars, totalCount, loading, error, query, totalPages, hasFilters,
        refresh, changeSearch, changeAvailability, changePage, clearFilters, applyCarUpdate,
    } = useCars();

    const openCreate = useCallback(() => {
        setNotice(null);
        setDialog({ type: "form", car: null });
    }, []);
    const openEdit = useCallback((car: Car) => {
        setNotice(null);
        setDialog({ type: "form", car });
    }, []);
    const openDelete = useCallback((car: Car) => {
        setNotice(null);
        setDialog({ type: "delete", car });
    }, []);
    const closeDialog = useCallback(() => setDialog({ type: "closed" }), []);
    const handleCarUpdated = useCallback((car: Car) => {
        setNotice(null);
        applyCarUpdate(car);
    }, [applyCarUpdate]);

    function handleSaved() {
        refresh(dialog.type === "form" && dialog.car === null);
        closeDialog();
        setNotice("saved");
    }
    function handleDeleted() {
        // useCars corrects an out-of-range last page after fetching the new count.
        refresh();
        closeDialog();
        setNotice("deleted");
    }

    return (
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-3xl font-bold">{t("title")}</h1>
                    <p className="text-muted-foreground">{t("description")}</p>
                </div>
                <Button disabled={loading || Boolean(error)} onClick={openCreate}>{t("addCar")}</Button>
            </header>
            <div role="status" aria-atomic="true">
                {notice && (
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">
                        {t(notice === "saved" ? "carSaved" : "carDeleted")}
                    </p>
                )}
            </div>
            <CarFilters search={query.search} availability={query.availability}
                onSearchChange={value => { setNotice(null); changeSearch(value); }}
                onAvailabilityChange={value => { setNotice(null); changeAvailability(value); }}
                onClear={() => { setNotice(null); clearFilters(); }} />
            <CarList cars={cars} totalCount={totalCount} loading={loading} error={error}
                busy={loading || dialog.type !== "closed"} hasFilters={hasFilters}
                onRetry={() => { setNotice(null); refresh(); }}
                onClear={() => { setNotice(null); clearFilters(); }} onCreate={openCreate}
                onUpdated={handleCarUpdated} onEdit={openEdit} onDelete={openDelete} />
            {!error && (
                <CarPagination pageNumber={query.pageNumber} totalPages={totalPages} loading={loading}
                    onPageChange={page => { setNotice(null); changePage(page); }} />
            )}
            {dialog.type === "form" && (
                <CarFormDialog car={dialog.car} onClose={closeDialog} onSaved={handleSaved} />
            )}
            {dialog.type === "delete" && (
                <DeleteCarDialog car={dialog.car} onClose={closeDialog} onDeleted={handleDeleted} />
            )}
        </main>
    );
}
