"use client";

import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import es from "@/messages/es.json";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { getLanguage, getServerLanguage, setLanguage, subscribeLanguage, type Language } from "@/lib/language-store";

const dictionaries = { en, ar, es };

export default function LanguageProvider({
    children,
}: {
    children: ReactNode;
}) {
    const language = useSyncExternalStore(subscribeLanguage, getLanguage, getServerLanguage);

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir =
            language === "ar" ? "rtl" : "ltr";
    }, [language]);


    return (
        <DirectionProvider direction={language === "ar" ? "rtl" : "ltr"}>
        <NextIntlClientProvider
            locale={language}
            messages={dictionaries[language]}
            timeZone="Asia/Amman"
        >
            <div className="p-4">
                <label htmlFor="language">{dictionaries[language].Common.language}: </label>
                <select
                    id="language"
                    value={language}
                    onChange={event =>
                        setLanguage(event.target.value as Language)
                    }
                    className="rounded border bg-background p-2 text-foreground"
                >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                    <option value="es">Español</option>
                </select>
            </div>

            {children}
            </NextIntlClientProvider>

        </DirectionProvider>
    );
}
