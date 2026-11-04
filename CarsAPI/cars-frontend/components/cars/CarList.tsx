"use client";

import { useTranslations } from "next-intl";
import type { Car } from "@/lib/api/cars-api";
import CarCard from "./CarCard";
import useTranslatedError from "@/hooks/useTranslatedError";
import { Button } from "@/components/ui/button";

type Props = {
    cars: Car[];
    totalCount: number;
    loading: boolean;
    error: string;
    busy: boolean;
    hasFilters: boolean;
    onRetry: () => void;
    onClear: () => void;
    onCreate: () => void;
    onUpdated: (car: Car) => void;
    onEdit: (car: Car) => void;
    onDelete: (car: Car) => void;
};

export default function CarList({
    cars, totalCount, loading, error, busy, hasFilters,
    onRetry, onClear, onCreate, onUpdated, onEdit, onDelete,
}: Props) {
    const t = useTranslations("Dashboard");
    const translateError = useTranslatedError();
    return (
        <section aria-busy={loading} aria-label={t("listLabel")} className="space-y-4">
            {loading && <p role="status">{t("loading")}</p>}
            {error && (
                <div className="carLoadError">
                    <p role="alert" className="text-destructive">{translateError(error)}</p>
                    <Button variant="outline" onClick={onRetry}>{t("retry")}</Button>
                </div>
            )}
            {!error && (cars.length > 0 || !loading) && (
                <>
                    <p role="status" className="text-sm text-muted-foreground">
                        {t("results", { count: cars.length, total: totalCount })}
                    </p>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {cars.map(car => (
                            <CarCard key={car.id} car={car} busy={busy}
                                onUpdated={onUpdated} onEdit={onEdit} onDelete={onDelete} />
                        ))}
                    </div>
                    {!loading && cars.length === 0 && (
                        <div className="emptyState">
                            <h2 className="text-xl font-semibold">
                                {t(hasFilters ? "noMatches" : "emptyTitle")}
                            </h2>
                            <p className="text-muted-foreground">
                                {t(hasFilters ? "noMatchesHint" : "emptyHint")}
                            </p>
                            <Button onClick={hasFilters ? onClear : onCreate}>
                                {t(hasFilters ? "clearFilter" : "addCar")}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
