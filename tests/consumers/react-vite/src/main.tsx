import { createRoot } from "react-dom/client";
import { EnvelopeReveal } from "@frillab/interactive/envelope-reveal";
import "@frillab/interactive/envelope-reveal.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Consumer root element was not found.");
}

createRoot(root).render(
  <main style={{ maxWidth: 600, margin: "4rem auto", padding: "0 1rem" }}>
    <h1>Independent React consumer</h1>
    <EnvelopeReveal title="Consumer validation" message="This imports the built package and stylesheet." />
  </main>,
);
