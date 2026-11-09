"use client";

import { useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { getParts, PARTS_PAGE_SIZE, type Part } from "@/lib/api/parts-api";
import { queryKeys } from "@/lib/api/query-keys";
import PartForm from "@/components/parts/PartForm";
import DeletePartDialog from "@/components/parts/DeletePartDialog";
import { Button } from "@/components/ui/button";
import { useFormatter, useTranslations } from "next-intl";
import useTranslatedError from "@/hooks/useTranslatedError";

export default function PartsPage() {
    const t = useTranslations("Parts");
    const format = useFormatter();
    const translateError = useTranslatedError();
    const client = useQueryClient();
    const [pageNumber, setPageNumber] = useState(1);
    const [editingPart, setEditingPart] = useState<Part | null>(null);
    const [partToDelete, setPartToDelete] = useState<Part | null>(null);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<"saved" | "deleted" | null>(null);
    const list = useQuery({
        queryKey: queryKeys.partList(pageNumber),
        queryFn: ({ signal }) => getParts(signal, pageNumber),
        placeholderData: keepPreviousData,
    });
    const parts = list.data?.items ?? [];
    const totalCount = list.data?.totalCount ?? 0;
    const loading = list.isFetching;
    const error = list.error instanceof Error ? list.error.message : "";
    const totalPages = Math.max(1, Math.ceil(totalCount / PARTS_PAGE_SIZE));

    if (!loading && !error && pageNumber > totalPages) setPageNumber(totalPages);

    function reloadParts() {
        setNotice(null);
        void client.invalidateQueries({ queryKey: queryKeys.parts });
    }

    function handleSaved() {
        if (!editingPart) setPageNumber(1);
        setEditingPart(null);
        reloadParts();
        setNotice("saved");
    }

    function changePage(nextPage: number) {
        if (loading || saving || nextPage < 1 || nextPage > totalPages) return;
        setPageNumber(nextPage);
        setNotice(null);
    }

    function startEditing(part: Part) {
        setEditingPart(part);
        setNotice(null);
        requestAnimationFrame(() => document.getElementById("part-manufacturer")?.focus());
    }

    return (
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl space-y-4 p-4 sm:p-6">
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            {editingPart && (
                <Button type="button" variant="outline" disabled={saving} onClick={() => setEditingPart(null)}>
                    {t("cancelEditing")}
                </Button>
            )}
            <PartForm key={editingPart?.id ?? "new"} part={editingPart}
                onSaved={handleSaved} onSavingChange={setSaving} />
            {notice && <p role="status">{t(notice)}</p>}

            <section aria-label={t("listLabel")} aria-busy={loading} className="space-y-4">
                {loading && <p role="status">{t("loading")}</p>}
                {error && (
                    <div className="space-y-2">
                        <p role="alert" className="text-destructive">{translateError(error)}</p>
                        <Button type="button" variant="outline" disabled={saving} onClick={reloadParts}>{t("retry")}</Button>
                    </div>
                )}
                {!loading && !error && (
                    <>
                        <p role="status">{t("results", { count: parts.length, total: totalCount })}</p>
                        {parts.length === 0 ? <p>{t("empty")}</p> : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {parts.map(part => (
                                    <article key={part.id} className="partCard">
                                        <h2 className="break-words font-semibold"><bdi>{part.manufacturer}</bdi></h2>
                                        <p className="break-words">{part.description}</p>
                                        <p>{t("price", { value: format.number(part.price, {
                                            minimumFractionDigits: 2, maximumFractionDigits: 2,
                                        }) })}</p>
                                        <p>{t("car", { name: part.carName ?? t("unassigned") })}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Button type="button" variant="outline" disabled={saving} onClick={() => startEditing(part)}>
                                                {t("edit")}
                                            </Button>
                                            <Button type="button" variant="destructive" disabled={saving} onClick={() => {
                                                setPartToDelete(part);
                                                setNotice(null);
                                            }}>{t("delete")}</Button>
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
                    <Button type="button" variant="outline" disabled={loading || saving || pageNumber <= 1}
                        onClick={() => changePage(pageNumber - 1)}>{t("previous")}</Button>
                    <span role="status">{t("page", { page: pageNumber, pages: totalPages })}</span>
                    <Button type="button" variant="outline" disabled={loading || saving || pageNumber >= totalPages}
                        onClick={() => changePage(pageNumber + 1)}>{t("next")}</Button>
                </nav>
            )}
            {partToDelete && <DeletePartDialog part={partToDelete} onClose={() => setPartToDelete(null)}
                onDeletingChange={setSaving} onDeleted={id => {
                    setPartToDelete(null);
                    if (editingPart?.id === id) setEditingPart(null);
                    if (parts.length === 1 && pageNumber > 1) setPageNumber(previous => previous - 1);
                    reloadParts();
                    setNotice("deleted");
                }} />}
        </main>
    );
}
