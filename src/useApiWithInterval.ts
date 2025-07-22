import { useState, useEffect, useRef, useCallback } from "react";

interface UseApiWithIntervalOptions<T> {
  apiCall: (signal: AbortSignal) => Promise<T>;
  interval?: number; // in milliseconds, default 5000
  immediate?: boolean; // whether to call immediately on mount, default true
}

interface UseApiWithIntervalReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useApiWithInterval<T>({
  apiCall,
  interval = 5000,
  immediate = true,
}: UseApiWithIntervalOptions<T>): UseApiWithIntervalReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchData = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      // Pass the abort signal to the API call
      const result = await apiCall(abortControllerRef.current.signal);

      // Only update state if component is still mounted
      setData(result);
      setError(null);
      // }
    } catch (err) {
      // Only update state if component is still mounted and error wasn't due to abort
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err);
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const startInterval = useCallback(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(fetchData, interval);
  }, [fetchData, interval]);

  const refetch = useCallback(() => {
    fetchData();
    startInterval(); // Restart interval after manual refetch
  }, [fetchData, startInterval]);

  useEffect(() => {
    // Initial fetch if immediate is true
    if (immediate) {
      fetchData();
    }

    // Start interval
    startInterval();

    return () => {
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, startInterval, immediate]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
