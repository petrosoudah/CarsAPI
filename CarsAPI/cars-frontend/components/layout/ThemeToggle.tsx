"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function ThemeToggle() {
    const t = useTranslations("Common");
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <Button
            variant="outline"
            size="icon"
            aria-label={t("toggleTheme")}
            onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
        >
            <Moon className="size-4 dark:hidden" aria-hidden="true" />
            <Sun className="hidden size-4 dark:block" aria-hidden="true" />
        </Button>
    );
}
