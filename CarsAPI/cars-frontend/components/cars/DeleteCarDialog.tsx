"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import useTranslatedError from "@/hooks/useTranslatedError";
import type { Car } from "@/lib/api/cars-api";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import type { DeleteCarDialogProps } from "@/types/delete-car-dialog";

export default function DeleteCarDialog({ car, onClose, onDelete, isDeleting = false }: DeleteCarDialogProps) {
    const t = useTranslations("Delete");
    const common = useTranslations("Common");
    const translateError = useTranslatedError();
    const deleting = isDeleting;
    const [error, setError] = useState("");

    async function handleDelete() {
        if (deleting) return;
        setError("");
        try {
            await onDelete(car);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not delete car.");
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
