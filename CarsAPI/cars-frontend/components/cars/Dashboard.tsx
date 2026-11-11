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
import type { DialogState } from "@/types/dashboard";
import { useToast } from "@/components/providers/ToastProvider";

export default function Home() {
    const t = useTranslations("Dashboard");
    const { success, error: toastError } = useToast();
    const [dialog, setDialog] = useState<DialogState>({ type: "closed" });
    const {
        cars, totalCount, loading, error, query, totalPages, hasFilters,
        refresh, changeSearch, changeAvailability, changePage, clearFilters, applyCarUpdate,
        createCar, updateCar, deleteCar, isCreating, isUpdating, isDeleting,
    } = useCars();

    const openCreate = useCallback(() => {
        setDialog({ type: "form", car: null });
    }, []);
    const openEdit = useCallback((car: Car) => {
        setDialog({ type: "form", car });
    }, []);
    const openDelete = useCallback((car: Car) => {
        setDialog({ type: "delete", car });
    }, []);
    const closeDialog = useCallback(() => setDialog({ type: "closed" }), []);
    const handleCarUpdated = useCallback((car: Car) => {
        applyCarUpdate(car);
    }, [applyCarUpdate]);

    async function handleSubmit(details: { make: string; model: string; year: number; horsepower: number; price: number | null; color: string | null; isAvailable: boolean }) {
        if (dialog.type === "form") {
            if (dialog.car === null) {
                await createCar(details);
            } else {
                await updateCar({ id: dialog.car.id, details });
            }
        }
        closeDialog();
        success(t("carSaved"));
    }

    async function handleDelete(car: Car) {
        await deleteCar(car.id);
        closeDialog();
        success(t("carDeleted"));
    }

    return (
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-3xl font-bold">{t("title")}</h1>
                    <p className="text-muted-foreground">{t("description")}</p>
                </div>
                <Button disabled={loading || Boolean(error)} onClick={openCreate} data-command="add-car">{t("addCar")}</Button>
            </header>
            <CarFilters search={query.search} availability={query.availability}
                onSearchChange={value => { changeSearch(value); }}
                onAvailabilityChange={value => { changeAvailability(value); }}
                onClear={() => { clearFilters(); }} />
            <CarList cars={cars} totalCount={totalCount} loading={loading} error={error}
                busy={loading || dialog.type !== "closed"} hasFilters={hasFilters}
                onRetry={() => { refresh(); }}
                onClear={() => { clearFilters(); }} onCreate={openCreate}
                onUpdated={handleCarUpdated} onEdit={openEdit} onDelete={openDelete} />
            {!error && (
                <CarPagination pageNumber={query.pageNumber} totalPages={totalPages} loading={loading}
                    onPageChange={page => { changePage(page); }} />
            )}
            {dialog.type === "form" && (
                <CarFormDialog
                    car={dialog.car}
                    onClose={closeDialog}
                    onSubmit={handleSubmit}
                    isSubmitting={dialog.car === null ? isCreating : isUpdating}
                />
            )}
            {dialog.type === "delete" && (
                <DeleteCarDialog
                    car={dialog.car}
                    onClose={closeDialog}
                    onDelete={handleDelete}
                    isDeleting={isDeleting}
                />
            )}
        </main>
    );
}
