import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/cars/Navigation";
import LanguageProvider from "./LanguageProvider";
import ThemeProvider from "./ThemeProvider";

export const metadata: Metadata = {
  title: "CarsAPI",
  description: "Browse and manage your car inventory.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
          lang="en"

          suppressHydrationWarning
      className="h-full antialiased"
    >
          <body className="min-h-full flex flex-col">
              <ThemeProvider>
              <LanguageProvider>

              <Navigation />

                  {children}

                  </LanguageProvider>

              </ThemeProvider>
          </body>
    </html>
  );
}
