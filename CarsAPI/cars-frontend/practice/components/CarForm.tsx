"use client";
import { useState } from "react";
import type { FormEvent } from "react"; 
import { Button } from "@/components/ui/button";
export default function CarForm() {
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [message, setMessage] = useState("");

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage(`Added car: ${make} ${model}`);
        setMake("");
        setModel("");
    }
    
    return (
        <form onSubmit={handleSubmit}>
            <h2>Add a New Car</h2>

            <input
                type="text"
                placeholder="Make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                required
            />

            <input
                type="text"
                placeholder="Model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
            />

            <Button type="submit">Add Car</Button>
            <p>{message}</p>
        </form>
    );
}