"use client";
import { useState, useRef } from "react";
import { Button } from "../components/ui/button";

export default function CarSearch() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState("");

    function focusSearch() {
        inputRef.current?.focus();
    }

    return (
        <div>
            <h2>Search for a Car</h2>
            <input
                ref={inputRef}
                type="text"
                placeholder="Enter car make or model"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={focusSearch}>Focus Search</Button>
            <p>Searching for: {searchTerm}</p>
        </div>
    );
}