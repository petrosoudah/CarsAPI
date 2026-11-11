"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { CarPaginationProps } from "@/types/car-pagination";

export default function CarPagination({ pageNumber, totalPages, loading, onPageChange }: CarPaginationProps) {
    const t = useTranslations("Dashboard");
    if (totalPages <= 1) return null;
    return (
        <nav aria-label={t("pagination")} className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" disabled={loading || pageNumber <= 1}
                onClick={() => onPageChange(pageNumber - 1)}>{t("previous")}</Button>
            <span role="status">{t("page", { page: pageNumber, pages: totalPages })}</span>
            <Button variant="outline" disabled={loading || pageNumber >= totalPages}
                onClick={() => onPageChange(pageNumber + 1)}>{t("next")}</Button>
        </nav>
    );
}
