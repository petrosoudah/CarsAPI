"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter
} from "@/components/ui/card";

type PracticeCarProps = {
    make: string;
    model: string;
    year: number;
    IsAvailable: boolean;
    onToggle: () => void;
    onDelete: () => void;
    onEdit: () => void;
};

export default function PracticeCar(props: PracticeCarProps) {
    return (
    <Card>
        <CardHeader>
            <h2>
                {props.make} {props.model} ({props.year})
            </h2>
        </CardHeader>

        <CardContent>
            <p>Available: {props.IsAvailable ? "Yes" : "No"}</p>
        </CardContent>
            <Badge variant={props.IsAvailable ? "default" : "secondary"}>
                {props.IsAvailable ? "Available" : "Sold"}
            </Badge>

        <CardFooter className="gap-2">
            <Button onClick={props.onToggle}>
                Toggle Availability
            </Button>
            <Button variant="destructive" onClick={props.onDelete}>
                Delete Car
            </Button>
            <Button variant="outline" onClick={props.onEdit}>
                Edit Car
            </Button>
        </CardFooter>
        </Card>
    );
}