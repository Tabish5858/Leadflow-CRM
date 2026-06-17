"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";

/**
 * Generic optimistic-update hook.
 *
 * Usage:
 *   const updateInvoice = useOptimisticUpdate(
 *     ["dashboard", "invoices", workspaceId],
 *     (data) => updateInvoiceDoc(data.id, data),
 *   );
 *   await updateInvoice.mutateAsync({ id: "inv-1", status: "paid" });
 *
 * On mutate: UI updates instantly via setQueryData.
 * On error:   rolls back to previous cache.
 * On success: invalidates query to sync with server truth.
 */
export function useOptimisticUpdate<TData extends { id: string }>(
  queryKey: QueryKey,
  mutationFn: (data: Partial<TData> & { id: string }) => Promise<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TData[]>(queryKey);
      queryClient.setQueryData<TData[]>(queryKey, (old) =>
        old?.map((item) =>
          item.id === newData.id ? { ...item, ...newData } as TData : item
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Optimistic insert — adds a temporary item to the list, then syncs.
 *  Returns the mutation so the caller can mutateAsync + onSuccess navigate.
 */
export function useOptimisticInsert<TData extends { id: string }>(
  queryKey: QueryKey,
  mutationFn: (data: Omit<TData, "id"> & { id?: string }) => Promise<TData | string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<TData, "id">) => {
      const result = await mutationFn(data);
      return typeof result === "string" ? result : result.id ?? result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Optimistic delete — removes item from cache immediately, restores on error.
 */
export function useOptimisticDelete<TData extends { id: string }>(
  queryKey: QueryKey,
  mutationFn: (id: string) => Promise<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TData[]>(queryKey);
      queryClient.setQueryData<TData[]>(queryKey, (old) =>
        old?.filter((item) => item.id !== id)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
