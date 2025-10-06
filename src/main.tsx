import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { initGA } from "./lib/ga";

// Initialize GA4 once at startup; safe no-op if env var is missing
initGA(import.meta.env.VITE_GA_MEASUREMENT_ID);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
