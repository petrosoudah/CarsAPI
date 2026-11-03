"use client";

import { useUsername } from "./UsernameContext";

export default function UsernameEditor() {
    const { username, setUsername } = useUsername();

    return (
        <div>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="border border-gray-500 bg-white text-black p-3 rounded"
            />
        </div>
    );
}