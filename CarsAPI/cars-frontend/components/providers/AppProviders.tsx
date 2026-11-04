"use client";

import type { ReactNode } from "react";
import LanguageProvider from "./LanguageProvider";
import ThemeProvider from "./ThemeProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
    );
}
