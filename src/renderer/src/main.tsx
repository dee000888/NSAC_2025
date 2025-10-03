import "./assets/main.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ResidenceProvider from "./contexts/ResidenceProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ResidenceProvider>
      <App />
    </ResidenceProvider>
  </StrictMode>,
);
