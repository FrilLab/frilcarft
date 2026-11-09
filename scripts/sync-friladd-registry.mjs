import { syncRegistry } from "./friladd-registry.mjs";

const changed = await syncRegistry();
if (changed.length === 0) {
  console.log("Registry hashes are already synchronized.");
} else {
  console.log("Updated Registry SHA-256 hashes:");
  for (const file of changed) console.log(`  ${file}`);
}
