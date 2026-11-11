"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, Plus, Edit, Trash2, Car, Package, Settings, HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Command {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    shortcut?: string;
    action: () => void;
    section: string;
}

export function CommandPalette() {
    const t = useTranslations("CommandPalette");
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [search, setSearch] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const commandsRef = useRef<Command[]>([]);

    // Build commands based on current page/context
    useEffect(() => {
        const cmds: Command[] = [
            // Navigation
            {
                id: "nav-dashboard",
                label: t("dashboard"),
                description: t("dashboardDesc"),
                icon: <Car className="w-4 h-4" />,
                shortcut: "G D",
                action: () => router.push("/"),
                section: t("navigation"),
            },
            {
                id: "nav-parts",
                label: t("parts"),
                description: t("partsDesc"),
                icon: <Package className="w-4 h-4" />,
                shortcut: "G P",
                action: () => router.push("/parts"),
                section: t("navigation"),
            },
            {
                id: "nav-about",
                label: t("about"),
                description: t("aboutDesc"),
                icon: <HelpCircle className="w-4 h-4" />,
                shortcut: "G A",
                action: () => router.push("/about"),
                section: t("navigation"),
            },
            // Car actions
            {
                id: "car-add",
                label: t("addCar"),
                description: t("addCarDesc"),
                icon: <Plus className="w-4 h-4" />,
                shortcut: "C N",
                action: () => {
                    const btn = document.querySelector('[data-command="add-car"]') as HTMLElement;
                    btn?.click();
                },
                section: t("cars"),
            },
            {
                id: "car-search",
                label: t("searchCars"),
                description: t("searchCarsDesc"),
                icon: <Search className="w-4 h-4" />,
                shortcut: "C S",
                action: () => {
                    const input = document.querySelector('[data-command="search-cars"]') as HTMLInputElement;
                    input?.focus();
                },
                section: t("cars"),
            },
            // Parts actions
            {
                id: "part-add",
                label: t("addPart"),
                description: t("addPartDesc"),
                icon: <Plus className="w-4 h-4" />,
                shortcut: "P N",
                action: () => {
                    const btn = document.querySelector('[data-command="add-part"]') as HTMLElement;
                    btn?.click();
                },
                section: t("parts"),
            },
            // Settings
            {
                id: "settings-theme",
                label: t("toggleTheme"),
                description: t("toggleThemeDesc"),
                icon: <Settings className="w-4 h-4" />,
                shortcut: "⌘ ⇧ D",
                action: () => {
                    const btn = document.querySelector('[data-command="toggle-theme"]') as HTMLElement;
                    btn?.click();
                },
                section: t("settings"),
            },
        ];
        commandsRef.current = cmds;
    }, [router, pathname, t]);

    const filteredCommands = commandsRef.current
        .filter(cmd =>
            cmd.label.toLowerCase().includes(search.toLowerCase()) ||
            cmd.description.toLowerCase().includes(search.toLowerCase()) ||
            cmd.shortcut?.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            const aMatch = a.label.toLowerCase().startsWith(search.toLowerCase()) ? 0 : 1;
            const bMatch = b.label.toLowerCase().startsWith(search.toLowerCase()) ? 0 : 1;
            return aMatch - bMatch;
        });

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!open) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
                break;
            case "Enter":
                e.preventDefault();
                filteredCommands[selectedIndex]?.action();
                setOpen(false);
                setSearch("");
                setSelectedIndex(0);
                break;
            case "Escape":
                setOpen(false);
                setSearch("");
                setSelectedIndex(0);
                break;
        }
    }, [open, filteredCommands, selectedIndex]);

    // Global keyboard shortcut to open (Cmd/Ctrl + K)
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen(true);
                setSelectedIndex(0);
                setSearch("");
                setTimeout(() => inputRef.current?.focus(), 0);
            }
            if (e.key === "Escape" && open) {
                setOpen(false);
                setSearch("");
                setSelectedIndex(0);
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [open]);

    // Focus input when opened
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [open]);

    if (!open) return null;

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.section]) acc[cmd.section] = [];
        acc[cmd.section].push(cmd);
        return acc;
    }, {} as Record<string, Command[]>);

    return (
        <div className="fixed inset-0 z-50" onClick={() => { setOpen(false); setSearch(""); setSelectedIndex(0); }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="absolute left-1/2 top-20 z-50 w-full max-w-2xl -translate-x-1/2 transform transition-all">
                <div className="rounded-xl border bg-popover p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
                            onKeyDown={handleKeyDown}
                            placeholder={t("placeholder")}
                            className="w-full rounded-md border bg-background px-10 py-3 text-sm outline-none placeholder:text-muted-foreground"
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-mono text-muted-foreground bg-muted rounded">
                            ⌘ K
                        </kbd>
                    </div>

                    {filteredCommands.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            {t("noResults")}
                        </div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto">
                            {Object.entries(groupedCommands).map(([section, cmds]) => (
                                <div key={section} className="py-2">
                                    <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {section}
                                    </h3>
                                    {cmds.map((cmd, idx) => {
                                        const isSelected = filteredCommands.indexOf(cmd) === selectedIndex;
                                        return (
                                            <button
                                                key={cmd.id}
                                                onClick={() => {
                                                    cmd.action();
                                                    setOpen(false);
                                                    setSearch("");
                                                    setSelectedIndex(0);
                                                }}
                                                onMouseEnter={() => setSelectedIndex(filteredCommands.indexOf(cmd))}
                                                className={cn(
                                                    "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                                                    isSelected
                                                        ? "bg-accent text-accent-foreground"
                                                        : "hover:bg-accent hover:text-accent-foreground"
                                                )}
                                            >
                                                <span className="flex h-5 w-5 items-center justify-center">{cmd.icon}</span>
                                                <div className="flex-1 text-left">
                                                    <div className="font-medium">{cmd.label}</div>
                                                    <div className="text-xs text-muted-foreground">{cmd.description}</div>
                                                </div>
                                                {cmd.shortcut && (
                                                    <kbd className="px-2 py-0.5 text-xs font-mono text-muted-foreground bg-muted rounded">
                                                        {cmd.shortcut}
                                                    </kbd>
                                                )}
                                                {isSelected && <ChevronDown className="w-4 h-4 text-primary" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}