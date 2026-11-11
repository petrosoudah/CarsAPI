"use client";

import { useQuery } from "@tanstack/react-query";
import { getCar } from "@/lib/api/cars-api";
import { queryKeys } from "@/lib/api/query-keys";
import { Badge } from "@/components/ui/badge";
import { SkeletonDetail } from "@/components/ui/skeleton";
import { useFormatter, useTranslations } from "next-intl";
import type { CarDetailsViewProps } from "@/types/car-details-view";

export default function CarDetailsView({ id }: CarDetailsViewProps) {
    const t = useTranslations("Details");
    const common = useTranslations("Common");
    const format = useFormatter();

    const { data: car, isPending, isError } = useQuery({
        queryKey: queryKeys.car(id),
        queryFn: ({ signal }) => getCar(id, signal),
    });

    if (isPending) return <SkeletonDetail />;
    if (isError) return <p role="alert">{t("error")}</p>;
    if (!car) return <p>{t("notFound")}</p>;

    return (
        <section className="space-y-3">
            <h1 className="text-3xl font-bold">
                {car.make} {car.model}
            </h1>

            <Badge variant={car.isAvailable ? "default" : "secondary"}>
                {common(car.isAvailable ? "available" : "sold")}
            </Badge>

            <p className="font-bold text-2xl">{t("year", { value: car.year })}</p>
            <p>{t("horsepower", { value: format.number(car.horsepower) })}</p>
            <p> {t("price", { value: car.price === null ? t("notProvided") : format.number(car.price) })}</p>
            <p>{t("color", { value: car.color ?? t("notProvided") })}</p>
        </section>
    );
}
