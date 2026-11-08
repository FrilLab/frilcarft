import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const packageRoot = new URL("../", import.meta.url);
const source = new URL("src/components/envelope-reveal/envelope-reveal.css", packageRoot);
const outputDirectory = new URL("dist/", packageRoot);
const destination = new URL("envelope-reveal.css", outputDirectory);

await mkdir(fileURLToPath(outputDirectory), { recursive: true });
await copyFile(fileURLToPath(source), fileURLToPath(destination));
