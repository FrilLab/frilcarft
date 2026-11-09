import { verifyRegistry } from "./friladd-registry.mjs";

const { itemCount, fileCount } = await verifyRegistry();
console.log(`FrilAdd registry verified: ${itemCount} item(s), ${fileCount} file(s); installable Playground IDs match the Registry.`);
