import "./assets/main.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ResidenceProvider from "./contexts/ResidenceProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ResidenceProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ResidenceProvider>
  </StrictMode>,
);
