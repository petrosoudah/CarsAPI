"use client";

import Link from 'next/link';
import { useTranslations } from "next-intl";
export default function AboutPage() {
    const t = useTranslations("About");
    const common = useTranslations("Common");
    return (
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl space-y-4 p-4 sm:p-6">
            <h1>{t("title")}</h1>
            <p>{t("welcome")}</p>
            <p>{t("description")}</p>
            <p>{t("internship")}</p>
            <Link href="/">{common("home")}</Link>
        </main>
    );
}
