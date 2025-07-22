import { renderHook, act, waitFor } from "@testing-library/react";
import { useApiWithInterval } from "./useApiWithInterval";

// Mock timers
jest.useFakeTimers();

describe("useApiWithInterval", () => {
  let mockApiCall: jest.MockedFunction<(signal: AbortSignal) => Promise<any>>;

  beforeEach(() => {
    mockApiCall = jest.fn();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("Basic functionality", () => {
    it("should initialize with correct default values", () => {
      mockApiCall.mockResolvedValue({ test: "data" });

      const { result } = renderHook(() =>
        useApiWithInterval({
          apiCall: mockApiCall,
        })
      );

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(true); // Should be loading initially
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refetch).toBe("function");
    });

    it("should call API immediately when immediate is true (default)", async () => {
      mockApiCall.mockResolvedValue({ test: "data" });

      renderHook(() =>
        useApiWithInterval({
          apiCall: mockApiCall,
        })
      );

      expect(mockApiCall).toHaveBeenCalledTimes(1);
      expect(mockApiCall).toHaveBeenCalledWith(expect.any(AbortSignal));
    });

    it("should not call API immediately when immediate is false", () => {
      mockApiCall.mockResolvedValue({ test: "data" });

      renderHook(() =>
        useApiWithInterval({
          apiCall: mockApiCall,
          immediate: false,
        })
      );

      expect(mockApiCall).not.toHaveBeenCalled();
    });
  });

  describe("Data handling", () => {
    it("should update data state when API call succeeds", async () => {
      const testData = { message: "test", timestamp: 123456 };
      mockApiCall.mockResolvedValue(testData);

      const { result } = renderHook(() =>
        useApiWithInterval({
          apiCall: mockApiCall,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(testData);
      expect(result.current.error).toBeNull();
    });

    it("should update error state when API call fails", async () => {
      const testError = new Error("API Error");
      mockApiCall.mockRejectedValue(testError);

      const { result } = renderHook(() =>
        useApiWithInterval({
          apiCall: mockApiCall,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(testError);
    });

    it("should handle AbortError without setting error state", async () => {
      const abortError = new Error("Request aborted");
      abortError.name = "AbortError";
      mockApiCall.mockRejectedValue(abortError);

      const { result } = renderHook(() =>
        useApiWithInterval({
          apiCall: mockApiCall,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("Interval functionality", () => {
    it("should call API at specified intervals", async () => {
      mockApiCall.mockResolvedValue({ test: "data" });

      const { result } = renderHook(() =>
        useApiWithInterval({
          apiCall: mockApiCall,
          interval: 1000,
        })
      );

      // Wait for initial call to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Initial call
      expect(mockApiCall).toHaveBeenCalledTimes(1);

      // Fast-forward time and check interval calls
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledTimes(2);
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledTimes(3);
      });
    });

    it("should use custom interval timing", async () => {
      mockApiCall.mockResolvedValue({ test: "data" });

      renderHook(() =>
        useApiWithInterval({
          apiCall: mockApiCall,
          interval: 2000,
        })
      );

      // Initial call
      expect(mockApiCall).toHaveBeenCalledTimes(1);

      // Should not call before 2000ms
      act(() => {
        jest.advanceTimersByTime(1999);
      });
      expect(mockApiCall).toHaveBeenCalledTimes(1);

      // Should call after 2000ms
      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(mockApiCall).toHaveBeenCalledTimes(2);
    });
  });

  describe("Refetch functionality", () => {
    it("should refetch data when refetch is called", async () => {
      const initialData = { test: "initial" };
      const refetchData = { test: "refetched" };

      mockApiCall
        .mockResolvedValueOnce(initialData)
        .mockResolvedValueOnce(refetchData);

      const { result } = renderHook(() =>
        useApiWithInterval({
          apiCall: mockApiCall,
          interval: 10000, // Long interval to avoid interference
        })
      );

      // Wait for initial call
      await waitFor(() => {
        expect(result.current.data).toEqual(initialData);
      });

      expect(mockApiCall).toHaveBeenCalledTimes(1);

      // Call refetch
      act(() => {
        result.current.refetch();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(2);

      await waitFor(() => {
        expect(result.current.data).toEqual(refetchData);
      });
    });
  });

  describe("Cleanup", () => {
    it("should cleanup interval on unmount", () => {
      mockApiCall.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { unmount } = renderHook(() =>
        useApiWithInterval({
          apiCall: mockApiCall,
        })
      );

      expect(mockApiCall).toHaveBeenCalledTimes(1);

      unmount();

      // Should not call API after unmount
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });
  });

  describe("Loading states", () => {
    it("should set loading to true during API call", () => {
      mockApiCall.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() =>
        useApiWithInterval({
          apiCall: mockApiCall,
        })
      );

      expect(result.current.loading).toBe(true);
    });

    it("should set loading to false after successful API call", async () => {
      mockApiCall.mockResolvedValue({ test: "data" });

      const { result } = renderHook(() =>
        useApiWithInterval({
          apiCall: mockApiCall,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("should set loading to false after failed API call", async () => {
      mockApiCall.mockRejectedValue(new Error("API Error"));

      const { result } = renderHook(() =>
        useApiWithInterval({
          apiCall: mockApiCall,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("Error handling", () => {
    it("should handle non-Error objects thrown by API", async () => {
      mockApiCall.mockRejectedValue("String error");

      const { result } = renderHook(() =>
        useApiWithInterval({
          apiCall: mockApiCall,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should not set error for non-Error objects
      expect(result.current.error).toBeNull();
    });

    it("should clear error state on successful retry", async () => {
      mockApiCall
        .mockRejectedValueOnce(new Error("First error"))
        .mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() =>
        useApiWithInterval({
          apiCall: mockApiCall,
          interval: 1000,
        })
      );

      // Wait for first call to fail
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error?.message).toBe("First error");

      // Trigger second call
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Wait for second call to succeed
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({ success: true });
      });

      expect(result.current.error).toBeNull();
    });
  });
});
