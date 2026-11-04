"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type AvailabilityMessageProps = {
    render: (isAvailable: boolean) => ReactNode;
};

export default function AvailabilityMessage({
    render
}: AvailabilityMessageProps) {
    const [isAvailable, setIsAvailable] = useState(true);

    return (
        <div className="space-y-2">
            <Button onClick={() => setIsAvailable(previous => !previous)}>
                Toggle availability
            </Button>

            {render(isAvailable)}
        </div>
    );
}