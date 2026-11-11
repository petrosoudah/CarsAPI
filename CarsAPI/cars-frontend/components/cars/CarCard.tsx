"use client";

import type { CarCardProps } from "@/types/car-card";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { useTranslations } from "next-intl";
import useCarActions from "@/hooks/useCarActions";
import useTranslatedError from "@/hooks/useTranslatedError";

function CarCard({ car, busy, onUpdated, onEdit, onDelete }: CarCardProps) {
    const t = useTranslations("Card");
    const common = useTranslations("Common");
    const translateError = useTranslatedError();
    const { pending, error, toggleAvailability } = useCarActions(car, onUpdated);
    const disabled = busy || pending;
    return (
        <Card className="carCard" aria-busy={pending}>
            <CardHeader>
                <h2 className="carTitle">
                    <Link
                        href={"/cars/" + car.id}
                        className="break-words hover:underline"
                    >
                        <bdi>{car.make} {car.model}</bdi>
                    </Link>
                </h2>

                <p className="carSubtitle">
                    {car.year}
                </p>
            </CardHeader>
            <CardContent>
                <Badge className={car.isAvailable ? "statusAvalabile" : "statusSold"} variant={car.isAvailable ? "default" : "secondary"}>
                    {common(car.isAvailable ? "available" : "sold")}
                </Badge>
                {error && <p role="alert" className="mt-2 text-sm text-destructive">{translateError(error)}</p>}
            </CardContent>
            <CardFooter className="carActions">
                <Button disabled={disabled} className="carButton"  variant="default" onClick={() => onEdit(car)}>{t("edit")}</Button>
                <Button disabled={disabled} className="carButton" variant="destructive" onClick={() => onDelete(car)}>{t("delete")}</Button>
                <Button  disabled={disabled} className="carButton" variant="outline" onClick={toggleAvailability}>{t(car.isAvailable ? "markSold" : "markAvailable")}</Button>

            </CardFooter>
        </Card>
    );
}

// Unchanged cars keep their object identity; callbacks are stable in the dashboard.
const MemoizedCarCard = memo(CarCard);
MemoizedCarCard.displayName = "CarCard";
export default MemoizedCarCard;
