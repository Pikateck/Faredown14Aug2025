/**
 * React Hooks for API Integration
 * Provides loading states, error handling, and data management
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { ApiError } from "@/lib/api";

// Types
export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isInitialLoad: boolean;
}

export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  retryCount?: number;
  retryDelay?: number;
}

export interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  onSettled?: () => void;
}

/**
 * Generic API hook for GET requests with loading and error states
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {},
): UseApiState<T> & {
  refetch: () => Promise<void>;
  reset: () => void;
} {
  const {
    immediate = true,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    isInitialLoad: true,
  });

  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const execute = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const result = await apiCall();
      setState({
        data: result,
        loading: false,
        error: null,
        isInitialLoad: false,
      });

      retryCountRef.current = 0;
      onSuccess?.(result);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      if (retryCountRef.current < retryCount) {
        retryCountRef.current += 1;
        timeoutRef.current = setTimeout(() => {
          execute();
        }, retryDelay * retryCountRef.current);
        return;
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        isInitialLoad: false,
      }));

      onError?.(errorMessage);
    }
  }, [apiCall, onSuccess, onError, retryCount, retryDelay]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isInitialLoad: true,
    });
    retryCountRef.current = 0;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [execute, immediate]);

  return {
    ...state,
    refetch: execute,
    reset,
  };
}

/**
 * Hook for API mutations (POST, PUT, DELETE)
 */
export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData> = {},
): {
  mutate: (variables: TVariables) => Promise<void>;
  data: TData | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
} {
  const { onSuccess, onError, onSettled } = options;

  const [state, setState] = useState<{
    data: TData | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (variables: TVariables) => {
      setState({
        data: null,
        loading: true,
        error: null,
      });

      try {
        const result = await mutationFn(variables);
        setState({
          data: result,
          loading: false,
          error: null,
        });

        onSuccess?.(result);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        onError?.(errorMessage);
      } finally {
        onSettled?.();
      }
    },
    [mutationFn, onSuccess, onError, onSettled],
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    mutate,
    ...state,
    reset,
  };
}

/**
 * Hook for paginated API calls
 */
export function usePaginatedApi<T>(
  apiCall: (
    page: number,
    limit: number,
  ) => Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>,
  initialLimit: number = 10,
): {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
} {
  const [state, setState] = useState<{
    data: T[];
    loading: boolean;
    error: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    } | null;
  }>({
    data: [],
    loading: false,
    error: null,
    pagination: null,
  });

  const currentPageRef = useRef(1);

  const loadPage = useCallback(
    async (page: number, append: boolean = false) => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const result = await apiCall(page, initialLimit);
        setState((prev) => ({
          data: append ? [...prev.data, ...result.data] : result.data,
          loading: false,
          error: null,
          pagination: result.pagination,
        }));

        currentPageRef.current = page;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    },
    [apiCall, initialLimit],
  );

  const loadMore = useCallback(async () => {
    if (
      state.pagination &&
      currentPageRef.current < state.pagination.totalPages
    ) {
      await loadPage(currentPageRef.current + 1, true);
    }
  }, [loadPage, state.pagination]);

  const refetch = useCallback(async () => {
    currentPageRef.current = 1;
    await loadPage(1, false);
  }, [loadPage]);

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      pagination: null,
    });
    currentPageRef.current = 1;
  }, []);

  useEffect(() => {
    loadPage(1, false);
  }, [loadPage]);

  return {
    ...state,
    loadMore,
    refetch,
    reset,
  };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  optimisticUpdateFn: (variables: TVariables) => TData,
  options: UseMutationOptions<TData> = {},
): {
  mutate: (variables: TVariables) => Promise<void>;
  data: TData | null;
  loading: boolean;
  error: string | null;
  isOptimistic: boolean;
  reset: () => void;
} {
  const [state, setState] = useState<{
    data: TData | null;
    loading: boolean;
    error: string | null;
    isOptimistic: boolean;
  }>({
    data: null,
    loading: false,
    error: null,
    isOptimistic: false,
  });

  const mutate = useCallback(
    async (variables: TVariables) => {
      // Apply optimistic update
      const optimisticData = optimisticUpdateFn(variables);
      setState({
        data: optimisticData,
        loading: true,
        error: null,
        isOptimistic: true,
      });

      try {
        const result = await mutationFn(variables);
        setState({
          data: result,
          loading: false,
          error: null,
          isOptimistic: false,
        });

        options.onSuccess?.(result);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setState({
          data: null,
          loading: false,
          error: errorMessage,
          isOptimistic: false,
        });

        options.onError?.(errorMessage);
      } finally {
        options.onSettled?.();
      }
    },
    [mutationFn, optimisticUpdateFn, options],
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isOptimistic: false,
    });
  }, []);

  return {
    mutate,
    ...state,
    reset,
  };
}

/**
 * Extract error message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "An unexpected error occurred";
}

/**
 * Debounced API hook for search/filter scenarios
 */
export function useDebouncedApi<T>(
  apiCall: (query: string) => Promise<T>,
  delay: number = 300,
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  search: (query: string) => void;
  reset: () => void;
} {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const search = useCallback(
    (query: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!query.trim()) {
        setState({
          data: null,
          loading: false,
          error: null,
        });
        return;
      }

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await apiCall(query);
          setState({
            data: result,
            loading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          setState({
            data: null,
            loading: false,
            error: errorMessage,
          });
        }
      }, delay);
    },
    [apiCall, delay],
  );

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    search,
    reset,
  };
}
