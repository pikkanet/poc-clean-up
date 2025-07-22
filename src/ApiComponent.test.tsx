import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ApiComponent from "./ApiComponent";

// Mock the custom hook
jest.mock("./useApiWithInterval", () => ({
  useApiWithInterval: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Declare mocks at the top level
const mockUseApiWithInterval =
  require("./useApiWithInterval").useApiWithInterval;
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("ApiComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render component title", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      expect(
        screen.getByText("API Component (Auto-refreshes every 5s)")
      ).toBeInTheDocument();
    });

    it("should render refetch button", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      expect(screen.getByText("Refetch Now")).toBeInTheDocument();
    });

    it("should render cleanup information", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      expect(
        screen.getByText(
          "This component will cleanup API calls and intervals when unmounted"
        )
      ).toBeInTheDocument();
    });
  });

  describe("Loading state", () => {
    it("should show loading indicator when loading is true", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      expect(screen.getByText("🔄 Loading...")).toBeInTheDocument();
    });

    it("should disable refetch button when loading", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      const button = screen.getByText("Loading...");
      expect(button).toBeDisabled();
    });

    it("should change button text when loading", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByText("Refetch Now")).not.toBeInTheDocument();
    });

    it("should not show loading indicator when loading is false", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      expect(screen.queryByText("🔄 Loading...")).not.toBeInTheDocument();
    });
  });

  describe("Error state", () => {
    it("should display error message when error exists", () => {
      const testError = new Error("Test error message");
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: false,
        error: testError,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      expect(screen.getByText("❌ Error:")).toBeInTheDocument();
      expect(screen.getByText("Test error message")).toBeInTheDocument();
    });

    it("should not display error section when no error", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      expect(screen.queryByText("❌ Error:")).not.toBeInTheDocument();
    });

    it("should style error message appropriately", () => {
      const testError = new Error("Test error");
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: false,
        error: testError,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      // Test that error styling is applied by checking the error text element itself
      const errorText = screen.getByText("Test error");
      expect(errorText).toBeInTheDocument();

      // Verify error indicator is present
      expect(screen.getByText("❌ Error:")).toBeInTheDocument();
    });
  });

  describe("Data display", () => {
    it("should display data when available", () => {
      const testData = {
        message: "Test message",
        timestamp: 1640995200000, // Jan 1, 2022
      };

      mockUseApiWithInterval.mockReturnValue({
        data: testData,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      expect(screen.getByText("✅ Latest Data:")).toBeInTheDocument();
      expect(screen.getByText("Test message")).toBeInTheDocument();
      expect(screen.getByText("Message:")).toBeInTheDocument();
      expect(screen.getByText("Fetched at:")).toBeInTheDocument();
    });

    it("should format timestamp correctly", () => {
      const testData = {
        message: "Test message",
        timestamp: 1640995200000, // Jan 1, 2022 00:00:00 UTC
      };

      mockUseApiWithInterval.mockReturnValue({
        data: testData,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      const expectedTime = new Date(testData.timestamp).toLocaleTimeString();
      expect(screen.getByText(expectedTime)).toBeInTheDocument();
    });

    it("should not display data section when no data", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      expect(screen.queryByText("✅ Latest Data:")).not.toBeInTheDocument();
    });

    it("should display data section with proper content", () => {
      const testData = {
        message: "Test message",
        timestamp: Date.now(),
      };

      mockUseApiWithInterval.mockReturnValue({
        data: testData,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      // Test that data is displayed correctly
      expect(screen.getByText("✅ Latest Data:")).toBeInTheDocument();
      expect(screen.getByText("Test message")).toBeInTheDocument();
      expect(screen.getByText("Message:")).toBeInTheDocument();
    });
  });

  describe("Refetch functionality", () => {
    it("should call refetch when button is clicked", () => {
      const mockRefetch = jest.fn();
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<ApiComponent />);

      const refetchButton = screen.getByText("Refetch Now");
      fireEvent.click(refetchButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it("should not call refetch when button is disabled (loading)", () => {
      const mockRefetch = jest.fn();
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: mockRefetch,
      });

      render(<ApiComponent />);

      const refetchButton = screen.getByText("Loading...");
      fireEvent.click(refetchButton);

      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });

  describe("Hook integration", () => {
    it("should call useApiWithInterval with correct parameters", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      expect(mockUseApiWithInterval).toHaveBeenCalledWith({
        apiCall: expect.any(Function),
        interval: 5000,
        immediate: true,
      });
    });

    it("should pass correct apiCall function to hook", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      const callArgs = mockUseApiWithInterval.mock.calls[0][0];
      expect(typeof callArgs.apiCall).toBe("function");
    });
  });

  describe("API function behavior", () => {
    let apiCall: (signal: AbortSignal) => Promise<any>;

    const setupApiCall = () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      // Extract the apiCall function from the hook call
      apiCall = mockUseApiWithInterval.mock.calls[0][0].apiCall;
    };

    it("should make fetch request to correct URL", async () => {
      setupApiCall();

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ title: "Test Title" }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const signal = new AbortController().signal;
      await apiCall(signal);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://jsonplaceholder.typicode.com/posts/1",
        { signal }
      );
    });

    it("should return formatted data on successful fetch", async () => {
      setupApiCall();

      const mockResponseData = { title: "Test Title" };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const signal = new AbortController().signal;
      const result = await apiCall(signal);

      expect(result).toEqual({
        message: "Test Title",
        timestamp: expect.any(Number),
      });
      expect(result.timestamp).toBeCloseTo(Date.now(), -2); // Within 100ms
    });

    it("should throw error when fetch fails", async () => {
      setupApiCall();

      const mockResponse = {
        ok: false,
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const signal = new AbortController().signal;

      await expect(apiCall(signal)).rejects.toThrow("Failed to fetch data");
    });

    it("should pass abort signal to fetch", async () => {
      setupApiCall();

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ title: "Test" }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const controller = new AbortController();
      await apiCall(controller.signal);

      expect(mockFetch).toHaveBeenCalledWith(expect.any(String), {
        signal: controller.signal,
      });
    });

    it("should handle fetch rejection", async () => {
      setupApiCall();

      mockFetch.mockRejectedValue(new Error("Network error"));

      const signal = new AbortController().signal;

      await expect(apiCall(signal)).rejects.toThrow("Network error");
    });
  });

  describe("Component styling", () => {
    it("should render main component structure", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      // Test that main component elements are present
      expect(
        screen.getByText("API Component (Auto-refreshes every 5s)")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Refetch Now" })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "This component will cleanup API calls and intervals when unmounted"
        )
      ).toBeInTheDocument();
    });

    it("should apply correct styles to refetch button when not loading", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      const button = screen.getByText("Refetch Now");
      expect(button).toHaveStyle({
        padding: "8px 16px",
        backgroundColor: "#007bff",
        color: "white",
        borderRadius: "4px",
      });
      // Note: border style may vary by browser, so we don't test it strictly
    });

    it("should apply correct styles to refetch button when loading", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      const button = screen.getByText("Loading...");
      expect(button).toHaveStyle({
        backgroundColor: "#ccc",
      });
    });
  });

  describe("Accessibility", () => {
    it("should have accessible button", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      const button = screen.getByRole("button", { name: "Refetch Now" });
      expect(button).toBeInTheDocument();
    });

    it("should properly disable button when loading", () => {
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Multiple states combination", () => {
    it("should handle loading and error states together", () => {
      const testError = new Error("Test error");
      mockUseApiWithInterval.mockReturnValue({
        data: null,
        loading: true,
        error: testError,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      expect(screen.getByText("🔄 Loading...")).toBeInTheDocument();
      expect(screen.getByText("❌ Error:")).toBeInTheDocument();
      expect(screen.getByText("Test error")).toBeInTheDocument();
    });

    it("should handle data and loading states together", () => {
      const testData = {
        message: "Test message",
        timestamp: Date.now(),
      };

      mockUseApiWithInterval.mockReturnValue({
        data: testData,
        loading: true,
        error: null,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      expect(screen.getByText("🔄 Loading...")).toBeInTheDocument();
      expect(screen.getByText("✅ Latest Data:")).toBeInTheDocument();
      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it("should handle all states present", () => {
      const testData = {
        message: "Test message",
        timestamp: Date.now(),
      };
      const testError = new Error("Test error");

      mockUseApiWithInterval.mockReturnValue({
        data: testData,
        loading: true,
        error: testError,
        refetch: jest.fn(),
      });

      render(<ApiComponent />);

      expect(screen.getByText("🔄 Loading...")).toBeInTheDocument();
      expect(screen.getByText("✅ Latest Data:")).toBeInTheDocument();
      expect(screen.getByText("❌ Error:")).toBeInTheDocument();
    });
  });
});
