"use client";

import { createContext, useContext, useState, type ReactNode } from "react"; 

type UsernameContextType = {
    username: string;
    setUsername: (username: string) => void;
};

const UsernameContext = createContext<UsernameContextType | null>(null);

export function UsernameProvider({ children }: { children: ReactNode }) {
    const [username, setUsername] = useState("");

    return (
        <UsernameContext.Provider value={{ username, setUsername }}>
            {children}
        </UsernameContext.Provider>
    );
}

export function useUsername() {
    const context = useContext(UsernameContext);

    if (!context) {
        throw new Error("useUsername must be used within a UsernameProvider");
    }

    return context;
}