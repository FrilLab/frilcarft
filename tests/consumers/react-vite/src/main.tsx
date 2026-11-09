import { createRoot } from "react-dom/client";
import { EnvelopeReveal } from "@frillab/interactive/envelope-reveal";
import "./consumer.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Consumer root element was not found.");
}

createRoot(root).render(
  <main className="mx-auto max-w-2xl px-4 py-16">
    <h1>Independent React consumer</h1>
    <EnvelopeReveal title="Consumer validation" message="This imports the built package with Tailwind CSS v4." />
  </main>,
);
