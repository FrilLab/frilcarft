import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@frillab/interactive/envelope-reveal.css";
import "./playground.css";
import App from "./App.js";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The Playground root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
