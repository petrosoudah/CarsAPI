"use client";

import { useQuery } from "@tanstack/react-query";
import { getCar } from "@/lib/api/cars-api";
import { queryKeys } from "@/lib/api/query-keys";
import { Badge } from "@/components/ui/badge";
import { useFormatter, useTranslations } from "next-intl";
import useTranslatedError from "@/hooks/useTranslatedError";

type CarDetailsViewProps = {
    id: string;
};

export default function CarDetailsView({ id }: CarDetailsViewProps) {
    const t = useTranslations("Details");
    const common = useTranslations("Common");
    const format = useFormatter();
    const translateError = useTranslatedError();
    const { data: car, isPending: loading, error: queryError } = useQuery({
        queryKey: queryKeys.car(id),
        queryFn: ({ signal }) => getCar(id, signal),
    });
    const error = queryError instanceof Error ? queryError.message : "";

    if (loading) return <p role="status">{t("loading")}</p>;

    if (error) {
        return <p role="alert" className="text-destructive">{translateError(error)}</p>;
    }

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
