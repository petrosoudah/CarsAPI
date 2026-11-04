"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card } from "@/components/ui/card";


type CarProps = {
    make: string;
    model: string;
    isAvailable: boolean;
    busy: boolean;
    id: string;
    year: number;
 
};

export default function LegacyCarCard(props: CarProps) {
    

    return (
        <div>
            <Card className="CarCard">
                <Link href={"/cars/" + props.id} className="hover:underline">
                    {props.make} {props.model} ({props.year})
                </Link>
            </Card>
            <p>Status: {props.isAvailable ? "Available" : "Sold"}</p>
            <Badge variant={props.isAvailable ? "default" : "secondary"}>
                {props.isAvailable ? "Available" : "Sold"}
            </Badge>

        </div>
    );
}
