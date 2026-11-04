"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function HorsepowerTracker() {
    const [horsepower, setHorsepower] = useState(140);

    useEffect(() => {
        document.title = `Horsepower: ${horsepower} HP`;
    }, [horsepower]);

    return (
        <div>
            <h2>Horsepower Tracker</h2>
            <p>Current Horsepower: {horsepower} HP</p>

            <Button onClick={() => setHorsepower(h => h + 10)}>
                Increase Horsepower
            </Button>
        </div>
    );
}