export type Language = "en" | "ar" | "es";

const storageKey = "cars-language";
const changeEvent = "cars-language-change";
let fallbackLanguage: Language = "en";

export function getLanguage(): Language {
    try {
        const saved = localStorage.getItem(storageKey);
        return saved === "ar" || saved === "es" ? saved : "en";
    } catch {
        return fallbackLanguage;
    }
}

export function setLanguage(language: Language) {
    fallbackLanguage = language;
    try {
        localStorage.setItem(storageKey, language);
    } catch {
        // Switching still works for this tab if browser storage is unavailable.
    }
    window.dispatchEvent(new Event(changeEvent));
}

export function subscribeLanguage(onChange: () => void) {
    function onStorage(event: StorageEvent) {
        if (event.key === storageKey || event.key === null) onChange();
    }
    window.addEventListener(changeEvent, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
        window.removeEventListener(changeEvent, onChange);
        window.removeEventListener("storage", onStorage);
    };
}

export function getServerLanguage(): Language {
    return "en";
}
