"use client";

import { useUsername } from "@/practice/context/UsernameContext";

export default function UserProfile() {
    const { username } = useUsername();

    return (
        <div>
            <h2>User Profile</h2>
            <p>Username: {username}</p>
        </div>
    );
}