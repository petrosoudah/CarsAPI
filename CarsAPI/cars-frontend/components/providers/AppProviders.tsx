"use client";

import type { ReactNode } from "react";
import LanguageProvider from "./LanguageProvider";
import ThemeProvider from "./ThemeProvider";
import QueryProvider from "./QueryProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <QueryProvider>{children}</QueryProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}
