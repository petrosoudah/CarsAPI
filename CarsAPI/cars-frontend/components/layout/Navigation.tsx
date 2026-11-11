"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { usePathname } from "next/navigation";
import { CommandPalette } from "@/components/ui/command-palette";

export default function Navigation() {
    const t = useTranslations("Common");
    const pathname = usePathname();

    return (
        <>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:block focus:bg-background focus:p-4 focus:text-foreground">
            {t("skip")}
        </a>
        <nav className="flex flex-wrap items-center gap-5 bg-muted p-5">
            <span style={{ margin: 0, textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)", font: "bold 24px sans-serif" }}>CarsAPI</span>
            <Link href="/" className="navLink" aria-current={pathname === "/" ? "page" : undefined}>
                {t("dashboard")}
            </Link>
                <Link href="/about" className="navLink" aria-current={pathname === "/about" ? "page" : undefined}>
                    {t("about")}
                </Link>

                <Link href="/parts" className="navLink" aria-current={pathname === "/parts" ? "page" : undefined}>
                    {t("parts")}
                </Link>
            <LanguageSwitcher />
            <ThemeToggle data-command="toggle-theme" />
            <CommandPalette />
        </nav>
        </>
    );
}
