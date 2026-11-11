"use client";

import { cn } from "@/lib/utils";

export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded bg-muted", className)}
            {...props}
        />
    );
}

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-4 p-4 rounded-xl border", className)}>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
            </div>
        </div>
    );
}

export function SkeletonCardGrid({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

export function SkeletonPagination({ className }: { className?: string }) {
    return (
        <nav className={cn("flex flex-wrap items-center justify-center gap-3", className)}>
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
        </nav>
    );
}

export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
    return (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
            ))}
        </div>
    );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <SkeletonTableRow key={i} columns={columns} />
            ))}
        </div>
    );
}

export function SkeletonForm({ fields = 6 }: { fields?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
            <Skeleton className="h-10 w-24" />
        </div>
    );
}

export function SkeletonDetail({ className }: { className?: string }) {
    return (
        <section className={cn("space-y-3", className)}>
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
        </section>
    );
}