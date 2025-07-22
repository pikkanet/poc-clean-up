import React from "react";
import { useApiWithInterval } from "./useApiWithInterval.ts";

// Example API function - replace with your actual API call
const fetchData = async (signal: AbortSignal): Promise<{ message: string; timestamp: number }> => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts/1", {
    signal // Pass the AbortSignal to fetch
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await response.json();
  return {
    message: data.title,
    timestamp: Date.now(),
  };
};

const ApiComponent: React.FC = () => {
  const { data, loading, error, refetch } = useApiWithInterval({
    apiCall: fetchData,
    interval: 5000, // 5 seconds
    immediate: true,
  });

  return (
    <div
      style={{
        border: "2px solid #007bff",
        borderRadius: "8px",
        padding: "20px",
        margin: "20px 0",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h2>API Component (Auto-refreshes every 5s)</h2>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={refetch}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : "Refetch Now"}
        </button>
      </div>

      {loading && <p style={{ color: "#007bff" }}>🔄 Loading...</p>}

      {error && (
        <div
          style={{
            color: "#dc3545",
            backgroundColor: "#f8d7da",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <strong>❌ Error:</strong> {error.message}
        </div>
      )}

      {data && (
        <div
          style={{
            backgroundColor: "#d4edda",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
            border: "1px solid #c3e6cb",
          }}
        >
          <h3>✅ Latest Data:</h3>
          <p>
            <strong>Message:</strong> {data.message}
          </p>
          <p>
            <strong>Fetched at:</strong>{" "}
            {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}

      <p style={{ fontSize: "14px", color: "#666", fontStyle: "italic" }}>
        This component will cleanup API calls and intervals when unmounted
      </p>
    </div>
  );
};

export default ApiComponent;
