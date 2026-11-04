import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import AppProviders from "@/components/providers/AppProviders";

export const metadata: Metadata = {
    title: "CarsAPI",
    description: "Browse and manage your car inventory.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" suppressHydrationWarning className="h-full antialiased">
            <body className="flex min-h-full flex-col">
                <AppProviders>
                    <Suspense fallback={null}>
                        <Navigation />
                    </Suspense>
                    {children}
                </AppProviders>
            </body>
        </html>
    );
}
