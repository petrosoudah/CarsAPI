"use client";

import { useTranslations } from "next-intl";

export default function Loading() {
    const t = useTranslations("Details");
    return <p role="status">{t("loading")}</p>;
}
