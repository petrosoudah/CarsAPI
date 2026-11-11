"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { deletePart } from "@/lib/api/parts-api";
import useTranslatedError from "@/hooks/useTranslatedError";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { DeletePartDialogProps } from "@/types/delete-part-dialog";

export default function DeletePartDialog({ part, onClose, onDeleted, onDeletingChange }: DeletePartDialogProps) {
    const t = useTranslations("Parts");
    const common = useTranslations("Common");
    const translateError = useTranslatedError();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const mutation = useMutation({ mutationFn: deletePart });
    const deleting = mutation.isPending;
    const [error, setError] = useState("");

    async function handleDelete() {
        if (deleting) return;
        onDeletingChange(true);
        setError("");
        try {
            await mutation.mutateAsync(part.id);
            onDeleted(part.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not delete part.");
        } finally {
            onDeletingChange(false);
        }
    }

    return (
        <AlertDialog open onOpenChange={open => { if (!open && !deleting) onClose(); }}>
            <AlertDialogContent initialFocus={cancelRef}
                finalFocus={() => document.getElementById("main-content")}
                className="max-h-[85dvh] overflow-y-auto">
                <AlertDialogHeader className="min-w-0 grid-cols-[minmax(0,1fr)]">
                    <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
                    <AlertDialogDescription className="w-full min-w-0 [overflow-wrap:anywhere]">
                        {t("deleteDescription", { manufacturer: part.manufacturer, description: part.description })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {error && <p role="alert" className="text-sm text-destructive">{translateError(error)}</p>}
                <AlertDialogFooter>
                    <AlertDialogCancel ref={cancelRef} disabled={deleting}>{common("cancel")}</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" disabled={deleting} onClick={handleDelete}>
                        {t(deleting ? "deleting" : "delete")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
