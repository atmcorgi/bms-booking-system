import { useState } from "react";
import api from "../services/apiClient";

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export default function CloudinaryTest() {
  const [testUrl, setTestUrl] = useState(
    "https://via.placeholder.com/600x900/000000/FFFFFF?text=Test+Image"
  );
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: TestResult) => {
    setResults((prev) => [result, ...prev]);
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/test/cloudinary/test-connection");
      addResult({
        success: true,
        message: "Connection test completed",
        data: response.data,
      });
    } catch (error: any) {
      addResult({
        success: false,
        message: "Connection test failed",
        error: error.response?.data?.message || error.message,
      });
    }
    setLoading(false);
  };

  const testUpload = async () => {
    if (!testUrl) {
      addResult({
        success: false,
        message: "Please enter a test URL",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        "/api/test/cloudinary/test-upload",
        null,
        {
          params: { imageUrl: testUrl },
        }
      );
      addResult({
        success: true,
        message: "Upload test completed",
        data: response.data,
      });
    } catch (error: any) {
      addResult({
        success: false,
        message: "Upload test failed",
        error: error.response?.data?.message || error.message,
      });
    }
    setLoading(false);
  };

  const testOptimize = async () => {
    if (!testUrl) {
      addResult({
        success: false,
        message: "Please enter a test URL",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.get("/api/test/cloudinary/test-optimize", {
        params: { imageUrl: testUrl },
      });
      addResult({
        success: true,
        message: "Optimization test completed",
        data: response.data,
      });
    } catch (error: any) {
      addResult({
        success: false,
        message: "Optimization test failed",
        error: error.response?.data?.message || error.message,
      });
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>🧪 Cloudinary Test Panel</h2>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "10px" }}>
          Test Image URL:
        </label>
        <input
          type="text"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          placeholder="Enter image URL to test"
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={testConnection}
          disabled={loading}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Testing..." : "Test Connection"}
        </button>

        <button
          onClick={testUpload}
          disabled={loading}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Testing..." : "Test Upload"}
        </button>

        <button
          onClick={testOptimize}
          disabled={loading}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#ffc107",
            color: "black",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Testing..." : "Test Optimize"}
        </button>

        <button
          onClick={clearResults}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Clear Results
        </button>
      </div>

      <div>
        <h3>Test Results:</h3>
        {results.length === 0 ? (
          <p style={{ color: "#666" }}>
            No tests run yet. Click a test button above.
          </p>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              style={{
                padding: "15px",
                marginBottom: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: result.success ? "#d4edda" : "#f8d7da",
                borderColor: result.success ? "#c3e6cb" : "#f5c6cb",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                {result.success ? "✅" : "❌"} {result.message}
              </div>
              {result.error && (
                <div style={{ color: "#721c24", fontSize: "14px" }}>
                  Error: {result.error}
                </div>
              )}
              {result.data && (
                <details style={{ marginTop: "10px" }}>
                  <summary style={{ cursor: "pointer" }}>View Details</summary>
                  <pre
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "10px",
                      borderRadius: "4px",
                      overflow: "auto",
                      fontSize: "12px",
                    }}
                  >
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
