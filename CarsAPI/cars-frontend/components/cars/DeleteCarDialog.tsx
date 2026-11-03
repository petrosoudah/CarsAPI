"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import useTranslatedError from "./useTranslatedError";
import { deleteCar, type Car } from "@/lib/cars-api";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

type DeleteCarDialogProps = {
    car: Car;
    onClose: () => void;
    onDeleted: (id: number) => void;
};

export default function DeleteCarDialog({ car, onClose, onDeleted }: DeleteCarDialogProps) {
    const t = useTranslations("Delete");
    const common = useTranslations("Common");
    const translateError = useTranslatedError();
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    async function handleDelete() {
        if (deleting) return;
        setDeleting(true);
        setError("");
        try {
            await deleteCar(car.id);
            onDeleted(car.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not delete car.");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <AlertDialog open onOpenChange={open => {
            if (!open && !deleting) onClose();
        }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("description", { make: car.make, model: car.model })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {error && <p role="alert" className="text-sm text-destructive">{translateError(error)}</p>}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>{common("cancel")}</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" disabled={deleting} onClick={handleDelete}>
                        {t(deleting ? "deleting" : "delete")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
