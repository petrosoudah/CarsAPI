"use client";

import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import type { CarSearchInputProps } from "@/types/car-search-input";

export default function CarSearchInput({
    search,
    onSearchChange
}: CarSearchInputProps) {
    const t = useTranslations("Dashboard");
    return (
        <Input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            data-command="search-cars"
        />
    );
}
