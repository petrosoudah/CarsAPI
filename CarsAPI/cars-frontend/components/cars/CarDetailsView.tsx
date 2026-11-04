"use client";

import { useEffect, useState } from "react";
import { getCar, type Car } from "@/lib/api/cars-api";
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
    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadCar() {
            try {
                const data = await getCar(id, controller.signal);

                if (!controller.signal.aborted) {
                    setCar(data);
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(
                        err instanceof Error ? err.message : "Could not load car."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadCar();
        return () => controller.abort();
    }, [id]);

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
