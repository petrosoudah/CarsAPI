"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useFormatter } from "next-intl";
import { SkeletonCardGrid, SkeletonPagination } from "@/components/ui/skeleton";
import PartFormDialog from "@/components/parts/PartFormDialog";
import DeletePartDialog from "@/components/parts/DeletePartDialog";
import { Button } from "@/components/ui/button";
import useParts from "@/hooks/useParts";
import useTranslatedError from "@/hooks/useTranslatedError";
import { useToast } from "@/components/providers/ToastProvider";
import type { Part, PartDetails } from "@/lib/api/parts-api";

export default function PartsPage() {
    const t = useTranslations("Parts");
    const format = useFormatter();
    const translateError = useTranslatedError();
    const { success, error: toastError } = useToast();
    const [dialog, setDialog] = useState<{ type: "closed" | "form" | "delete"; part?: Part }>({ type: "closed" });

    const {
        parts, totalCount, loading, error, pageNumber, totalPages,
        createPart, updatePart, deletePart, isCreating, isUpdating, isDeleting,
        changePage, refresh,
    } = useParts();

    const openCreate = useCallback(() => setDialog({ type: "form" }), []);
    const openEdit = useCallback((part: Part) => setDialog({ type: "form", part }), []);
    const openDelete = useCallback((part: Part) => setDialog({ type: "delete", part }), []);
    const closeDialog = useCallback(() => setDialog({ type: "closed" }), []);

    async function handleSubmit(details: PartDetails) {
        if (dialog.type === "form") {
            if (dialog.part) await updatePart({ id: dialog.part.id, details });
            else await createPart(details);
        }
        closeDialog();
        success(t("saved"));
    }

    async function handleDelete(id: string) {
        await deletePart(id);
        closeDialog();
        success(t("deleted"));
    }

    return (
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-3xl font-bold">{t("title")}</h1></div>
                <Button onClick={openCreate} disabled={loading}>{t("add")}</Button>
            </header>

            <section aria-label={t("listLabel")} aria-busy={loading} className="space-y-4">
                {loading && <SkeletonCardGrid count={4} aria-label={t("loading")} />}
                {error && (
                    <div className="space-y-2">
                        <p role="alert" className="text-destructive">{translateError(error)}</p>
                        <Button type="button" variant="outline" onClick={refresh}>{t("retry")}</Button>
                    </div>
                )}
                {!loading && !error && (
                    <>
                        <p role="status">{t("results", { count: parts.length, total: totalCount })}</p>
                        {parts.length === 0 ? <p>{t("empty")}</p> : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {parts.map(part => (
                                    <article key={part.id} className="partCard space-y-4 p-4 rounded-xl border">
                                        <h2 className="break-words font-semibold"><bdi>{part.manufacturer}</bdi></h2>
                                        <p className="break-words">{part.description}</p>
                                        <p>{t("price", { value: format.number(part.price, {
                                            minimumFractionDigits: 2, maximumFractionDigits: 2,
                                        }) })}</p>
                                        <p>{t("car", { name: part.carName ?? t("unassigned") })}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Button type="button" variant="outline" disabled={isUpdating} onClick={() => openEdit(part)}>{t("edit")}</Button>
                                            <Button type="button" variant="destructive" disabled={isDeleting} onClick={() => openDelete(part)}>{t("delete")}</Button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>

            {!error && totalPages > 1 && (
                <nav aria-label={t("pagination")} className="flex flex-wrap items-center justify-center gap-3">
                    {loading ? (
                        <SkeletonPagination aria-label={t("loading")} />
                    ) : (
                        <>
                            <Button type="button" variant="outline" disabled={pageNumber <= 1}
                                onClick={() => changePage(pageNumber - 1)}>{t("previous")}</Button>
                            <span role="status">{t("page", { page: pageNumber, pages: totalPages })}</span>
                            <Button type="button" variant="outline" disabled={pageNumber >= totalPages}
                                onClick={() => changePage(pageNumber + 1)}>{t("next")}</Button>
                        </>
                    )}
                </nav>
            )}

            {dialog.type === "form" && (
                <PartFormDialog
                    part={dialog.part}
                    onClose={closeDialog}
                    onSubmit={handleSubmit}
                    isSubmitting={dialog.part ? isUpdating : isCreating}
                />
            )}
            {dialog.type === "delete" && dialog.part && (
                <DeletePartDialog
                    part={dialog.part}
                    onClose={closeDialog}
                    onDeleted={handleDelete}
                    onDeletingChange={() => {}}
                />
            )}
        </main>
    );
}