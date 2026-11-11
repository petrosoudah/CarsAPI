"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutContent() {
    const t = useTranslations("About");
    return (
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>{t("welcome")}</p>
                    <p>{t("description")}</p>
                    <p className="text-muted-foreground">{t("internship")}</p>
                </CardContent>
            </Card>
        </main>
    );
}