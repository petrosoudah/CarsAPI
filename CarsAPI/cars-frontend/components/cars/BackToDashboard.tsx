"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function BackToDashboard() {
    const t = useTranslations("Common");
    return <Link href="/" className="text-sm hover:underline">{t("back")}</Link>;
}
