import { Suspense } from "react";
import BackToDashboard from "@/components/cars/BackToDashboard";
import CarDetailsView from "@/components/cars/CarDetailsView";
import { SkeletonDetail } from "@/components/ui/skeleton";

type CarDetailsProps = {
    params: Promise<{ id: string }>;
};

export default async function CarDetailsPage({
    params
}: CarDetailsProps) {
    const { id } = await params;

    return (
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
            <BackToDashboard />

            <Suspense fallback={<SkeletonDetail />}>
                <CarDetailsView key={id} id={id} />
            </Suspense>
        </main>
    );
}
