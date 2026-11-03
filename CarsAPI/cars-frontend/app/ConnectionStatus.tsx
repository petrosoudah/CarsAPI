"use client";

import { useOnlineStatus }  from "./useOnlineStatus";

export default function ConnectionStatus() {
    const isOnline = useOnlineStatus();

    const message =
        isOnline === null
            ? "Checking browser network status..."
            : isOnline
                ? "Browser reports online"
                : "Browser reports offline";

    return (
        <div
            role="status"
            className="rounded-lg border p-3 text-sm"
        >
            {message}
        </div>
    );
}