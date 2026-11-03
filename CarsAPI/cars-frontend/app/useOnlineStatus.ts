"use client";

import { useSyncExternalStore } from "react";

function subscribe(notifyReact: () => void) {
    window.addEventListener("online", notifyReact);
    window.addEventListener("offline", notifyReact);

    return () => {
        window.removeEventListener("online", notifyReact);
        window.removeEventListener("offline", notifyReact);
    };
}

function getSnapshot() {
    return navigator.onLine;
}

function getServerSnapshot() {
    return null;
}

export function useOnlineStatus() {
    return useSyncExternalStore<boolean | null>(
        subscribe,
        getSnapshot,
        getServerSnapshot
    );
}