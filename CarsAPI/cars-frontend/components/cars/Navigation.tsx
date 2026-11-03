"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import ThemeToggle from "./ThemeToggle";

export default function Navigation() {
    const t = useTranslations("Common");

    return (
        <>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:block focus:bg-background focus:p-4 focus:text-foreground">
            {t("skip")}
        </a>
        <nav className="flex flex-wrap items-center gap-5 bg-muted p-5">
            <span style={{ margin: 0, textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)", font: "bold 24px Comic Sans MS" }}>CarsAPI</span>
            <Link href="/">{t("dashboard")}</Link>
                <Link href="/about">{t("about")}</Link>

                <Link href="/parts">{t("parts")}</Link>
            <ThemeToggle />
        </nav>
        </>
    );
}
