// Browser stub for Node.js 'fs' module.
// ProjectLoader uses fs only in CLI/server contexts.
// In the browser (atlas-viewer), fs is never called at runtime — only imported.
// This stub prevents Vite from crashing on the import.

export const existsSync = () => false;
export const readFileSync = () => { throw new Error('fs.readFileSync is not available in the browser'); };
export const writeFileSync = () => { throw new Error('fs.writeFileSync is not available in the browser'); };
export default { existsSync, readFileSync, writeFileSync };
