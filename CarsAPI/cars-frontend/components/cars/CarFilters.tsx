"use client";

import { useTranslations } from "next-intl";
import CarSearchInput from "@/components/cars/CarSearchInput";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

type Props = {
    search: string;
    availability: string;
    onSearchChange: (value: string) => void;
    onAvailabilityChange: (value: string) => void;
    onClear: () => void;
};

export default function CarFilters({
    search, availability, onSearchChange, onAvailabilityChange, onClear,
}: Props) {
    const t = useTranslations("Dashboard");
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
                <CarSearchInput search={search} onSearchChange={onSearchChange} />
            </div>
            <NativeSelect value={availability} aria-label={t("filterLabel")}
                onChange={event => onAvailabilityChange(event.target.value)}>
                <NativeSelectOption value="all">{t("all")}</NativeSelectOption>
                <NativeSelectOption value="available">{t("available")}</NativeSelectOption>
                <NativeSelectOption value="sold">{t("sold")}</NativeSelectOption>
            </NativeSelect>
            {(search !== "" || availability !== "all") && (
                <Button variant="outline" onClick={onClear}>{t("clearFilter")}</Button>
            )}
        </div>
    );
}
