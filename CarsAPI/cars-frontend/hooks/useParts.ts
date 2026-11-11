"use client";

import { useCallback, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getParts, addPart, updatePart, deletePart, PARTS_PAGE_SIZE, type Part, type PartDetails } from "@/lib/api/parts-api";
import { queryKeys } from "@/lib/api/query-keys";
import { useToast } from "@/components/providers/ToastProvider";
import { useTranslations } from "next-intl";

export default function useParts() {
    const client = useQueryClient();
    const { success, error: toastError } = useToast();
    const t = useTranslations("Toast");
    const [pageNumber, setPageNumber] = useState(1);

    const list = useQuery({
        queryKey: queryKeys.partList(pageNumber),
        queryFn: ({ signal }) => getParts(signal, pageNumber),
        placeholderData: keepPreviousData,
    });

    const parts = list.data?.items ?? [];
    const totalCount = list.data?.totalCount ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / PARTS_PAGE_SIZE));
    const loading = list.isFetching;
    const error = list.error instanceof Error ? list.error.message : "";

    const createMutation = useMutation({
        mutationFn: (details: PartDetails) => addPart(details),
        onMutate: async (newPart) => {
            await client.cancelQueries({ queryKey: queryKeys.parts });
            const previous = client.getQueryData(queryKeys.partList(pageNumber));
            const tempId = crypto.randomUUID();
            const optimistic = { ...newPart, id: tempId, carName: null };
            client.setQueryData(queryKeys.partList(pageNumber), (old: any) =>
                old ? { ...old, items: [optimistic, ...old.items], totalCount: old.totalCount + 1 } : old
            );
            return { previous };
        },
        onError: (_err, _vars, ctx) => ctx?.previous && client.setQueryData(queryKeys.partList(pageNumber), ctx.previous),
        onSettled: () => client.invalidateQueries({ queryKey: queryKeys.parts }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, details }: { id: string; details: PartDetails }) => updatePart(id, details),
        onMutate: async ({ id, details }) => {
            await client.cancelQueries({ queryKey: queryKeys.parts });
            const previous = client.getQueryData(queryKeys.partList(pageNumber));
            client.setQueryData(queryKeys.partList(pageNumber), (old: any) =>
                old ? { ...old, items: old.items.map((p: Part) => p.id === id ? { ...p, ...details } : p) } : old
            );
            return { previous };
        },
        onError: (_err, _vars, ctx) => ctx?.previous && client.setQueryData(queryKeys.partList(pageNumber), ctx.previous),
        onSettled: () => client.invalidateQueries({ queryKey: queryKeys.parts }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deletePart(id),
        onMutate: async (id) => {
            await client.cancelQueries({ queryKey: queryKeys.parts });
            const previous = client.getQueryData(queryKeys.partList(pageNumber));
            client.setQueryData(queryKeys.partList(pageNumber), (old: any) =>
                old ? { ...old, items: old.items.filter((p: Part) => p.id !== id), totalCount: old.totalCount - 1 } : old
            );
            return { previous };
        },
        onError: (_err, _id, ctx) => ctx?.previous && client.setQueryData(queryKeys.partList(pageNumber), ctx.previous),
        onSettled: () => client.invalidateQueries({ queryKey: queryKeys.parts }),
    });

    const changePage = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) setPageNumber(page);
    }, [totalPages]);

    return {
        parts, totalCount, loading, error, pageNumber, totalPages,
        createPart: createMutation.mutateAsync,
        updatePart: updateMutation.mutateAsync,
        deletePart: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        changePage,
        refresh: () => client.invalidateQueries({ queryKey: queryKeys.parts }),
    };
}