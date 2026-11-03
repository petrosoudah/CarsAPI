"use client";

import { useEffect, useState } from "react";
import { getParts, type Part } from "@/lib/parts-api";
import PartForm from "@/components/parts/PartForm";
import { Button } from "@/components/ui/button";
import { useFormatter, useTranslations } from "next-intl";
import useTranslatedError from "@/components/cars/useTranslatedError";

export default function PartsPage() {
    const t = useTranslations("Parts");
    const format = useFormatter();
    const translateError = useTranslatedError();
    const [editingPart, setEditingPart] = useState<Part | null>(null);
    const [loadAttempt, setLoadAttempt] = useState(0);
    const [parts, setParts] = useState<Part[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadParts() {
            try {
                const data = await getParts(controller.signal);

                if (!controller.signal.aborted) {
                    setParts(data);
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(
                        err instanceof Error ? err.message : "Could not load parts."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadParts();
        return () => controller.abort();
    }, [loadAttempt]);

    function reloadParts() {
        setLoading(true);
        setError("");
        setLoadAttempt(prev => prev + 1);
    }
    function handleSaved() {
        setEditingPart(null);
        reloadParts();
    }
    return (

        <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto w-full max-w-5xl space-y-4 p-4 sm:p-6"
        >
            {editingPart && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingPart(null)}
                >
                    {t("cancelEditing")}
                </Button>
            )}
           
            <PartForm key={editingPart?.id ?? "new"}
                part={editingPart}
                onSaved={handleSaved}
            />  
            <h1 className="text-3xl font-bold">{t("title")}</h1>

            {loading && <p role="status">{t("loading")}</p>}
            {error && <p role="alert">{translateError(error)}</p>}

            {!loading && !error && (
                <div className="space-y-4">
                    <p>{t("loaded", { count: parts.length })}</p>

                    {parts.length === 0 ? (
                        <p>{t("empty")}</p>
                    ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            {parts.map(part => (
                                <article key={part.id} className="rounded-xl border bg-card p-4 text-card-foreground">
                                    <h2 className="font-semibold">{part.manufacturer}</h2>
                                    <p>{part.description}</p>
                                    <p>{t("price", { value: format.number(part.price, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })}</p>
                                    <p>{t("car", { name: part.carName ?? t("unassigned") })}</p>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingPart(part)}
                                    >
                                    {t("edit")}
                                    </Button>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
