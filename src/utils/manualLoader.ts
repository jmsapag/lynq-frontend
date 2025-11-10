/**
 * Utility to load manual markdown files
 */

// Import all markdown files from docs/manual
const manualFiles: Record<string, string> = import.meta.glob(
  "../../docs/manual/*.md",
  { query: "?raw", import: "default", eager: true },
);

/**
 * Load a manual markdown file by filename
 * @param filename - The name of the file (e.g., "bienvenida.md")
 * @returns The markdown content as a string, or null if not found
 */
export const loadManualFile = (filename: string): string | null => {
  const path = `../../docs/manual/${filename}`;
  return manualFiles[path] || null;
};

/**
 * Get all available manual files
 */
export const getAvailableManualFiles = (): string[] => {
  return Object.keys(manualFiles).map((path) =>
    path.replace("../../docs/manual/", ""),
  );
};
