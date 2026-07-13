import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("Unhandled error in Avocado Trader:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 16, background: "#DDD1B0", fontFamily: "sans-serif", padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#25404C" }}>Something went wrong.</div>
          <div style={{ fontSize: 15, color: "#6E634C" }}>Try reloading the page.</div>
          <button onClick={() => window.location.reload()}
            style={{ fontSize: 16, fontWeight: 600, padding: "12px 24px", borderRadius: 999, border: "none",
              background: "#D96C47", color: "#F8F1DC", cursor: "pointer" }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}
