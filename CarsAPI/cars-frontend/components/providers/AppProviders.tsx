"use client";

import type { ReactNode } from "react";
import LanguageProvider from "./LanguageProvider";
import ThemeProvider from "./ThemeProvider";
import QueryProvider from "./QueryProvider";
import { ToastProvider } from "./ToastProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <QueryProvider>
                    <ToastProvider />
                    {children}
                </QueryProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}
