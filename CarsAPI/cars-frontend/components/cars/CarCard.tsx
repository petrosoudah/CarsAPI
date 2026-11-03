"use client";

import type { Car } from "@/lib/cars-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { useTranslations } from "next-intl";

type CarCardProps = {
    car: Car;
    busy: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function CarCard({ car, busy, onToggle, onEdit, onDelete }: CarCardProps) {
    const t = useTranslations("Card");
    const common = useTranslations("Common");
    return (
        <Card className="min-w-0">
            <CardHeader>
                <h2 className="font-semibold">
                    <Link href={"/cars/" + car.id} className="break-words hover:underline">
                        <bdi>{car.make} {car.model}</bdi> ({car.year})
                    </Link>
                </h2>
            </CardHeader>
            <CardContent>
                <Badge variant={car.isAvailable ? "default" : "secondary"}>
                    {common(car.isAvailable ? "available" : "sold")}
                </Badge>
            </CardContent>
            <CardFooter className="flex-wrap gap-2">
                <Button disabled={busy} onClick={onToggle}>{t("toggle")}</Button>
                <Button disabled={busy} variant="outline" onClick={onEdit}>{t("edit")}</Button>
                <Button disabled={busy} variant="destructive" onClick={onDelete}>{t("delete")}</Button>
            </CardFooter>
        </Card>
    );
}
