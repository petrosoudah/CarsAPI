"use client";

import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import es from "@/messages/es.json";
import { startTransition, useEffect, useState, type ReactNode } from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { getLanguage, subscribeLanguage, type Language } from "@/lib/language-store";

const dictionaries = { en, ar, es };

export default function LanguageProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [language, setLanguage] = useState<Language>("en");

    useEffect(() => {
        function synchronizeLanguage() {
            // Hydrate suspended navigation with the server's English snapshot first.
            // A transition lets React finish that hydration before changing messages.
            startTransition(() => setLanguage(getLanguage()));
        }
        const unsubscribe = subscribeLanguage(synchronizeLanguage);
        synchronizeLanguage();
        return unsubscribe;
    }, []);

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
               

            {children}
            </NextIntlClientProvider>

        </DirectionProvider>
    );
}
