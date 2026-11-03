"use client";

import { Badge } from "../components/ui/badge";
import Link from "next/link";


type CarProps = {
    make: string;
    model: string;
    isAvailable: boolean;
    busy: boolean;
    id: string;
    year: number;
 
};

export default function CarCard(props: CarProps) {
    

    return (
        <div>
            <h2 className="font-semibold">
                <Link href={"/cars/" + props.id} className="hover:underline">
                    {props.make} {props.model} ({props.year})
                </Link>
            </h2>
            <p>Status: {props.isAvailable ? "Available" : "Sold"}</p>
            <Badge variant={props.isAvailable ? "default" : "secondary"}>
                {props.isAvailable ? "Available" : "Sold"}
            </Badge>

        </div>
    );
}
