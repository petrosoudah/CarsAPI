import { Metadata } from "next";
import AboutContent from "@/components/about/AboutContent";

export const metadata: Metadata = {
    title: "About - CarsAPI",
    description: "Learn about CarsAPI and the team behind it.",
};

export default function AboutPage() {
    return <AboutContent />;
}