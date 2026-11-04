"use client";
import { useLocale, useTranslations } from "next-intl";
import {

    setLanguage,
    type Language,
} from "@/lib/i18n/language-store";



export default function LanguageSwitcher() {
    const t = useTranslations("Common");

    const language = useLocale();

    return (
        <div className="flex items-center gap-2" >

            <label htmlFor="language">{t("language")}: </label>

            <select className="rounded border bg-background p-2 text-foreground"

                id="language"

                value={language}
                onChange={(event) =>
                    setLanguage(event.target.value as Language)
                }
            >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="ar">العربية</option>
            </select>
        </div>
    );
}
