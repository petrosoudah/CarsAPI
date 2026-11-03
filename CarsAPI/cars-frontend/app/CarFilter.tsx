"use client";

import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

type CarFilterProps = {
    search: string;
    onSearchChange: (value: string) => void;
};

export default function CarFilter({
    search,
    onSearchChange
}: CarFilterProps) {
    const t = useTranslations("Dashboard");
    return (
        <Input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
        />
    );
}
