/**
 * Icon search utility for react-icons
 * Provides search functionality across multiple icon libraries
 */

import * as IconsSi from "react-icons/si";
import * as IconsFa6 from "react-icons/fa6";
import * as IconsMd from "react-icons/md";
import * as IconsHi2 from "react-icons/hi2";
import * as IconsTb from "react-icons/tb";
import * as IconsBs from "react-icons/bs";
import * as IconsIo5 from "react-icons/io5";
import * as IconsRi from "react-icons/ri";
import * as IconsVsc from "react-icons/vsc";
import * as IconsGi from "react-icons/gi";

interface IconInfo {
  name: string;
  importPath: string;
}

// Icon packs: id -> { importPath, keys }
const ICON_PACKS = {
  si: { path: "react-icons/si", keys: Object.keys(IconsSi).filter((k) => k.startsWith("Si")) },
  fa6: { path: "react-icons/fa6", keys: Object.keys(IconsFa6).filter((k) => k.startsWith("Fa")) },
  md: { path: "react-icons/md", keys: Object.keys(IconsMd).filter((k) => k.startsWith("Md")) },
  hi2: { path: "react-icons/hi2", keys: Object.keys(IconsHi2).filter((k) => k.startsWith("Hi")) },
  tb: { path: "react-icons/tb", keys: Object.keys(IconsTb).filter((k) => k.startsWith("Tb")) },
  bs: { path: "react-icons/bs", keys: Object.keys(IconsBs).filter((k) => k.startsWith("Bs")) },
  io5: { path: "react-icons/io5", keys: Object.keys(IconsIo5).filter((k) => k.startsWith("Io")) },
  ri: { path: "react-icons/ri", keys: Object.keys(IconsRi).filter((k) => k.startsWith("Ri")) },
  vsc: { path: "react-icons/vsc", keys: Object.keys(IconsVsc).filter((k) => k.startsWith("Vsc")) },
  gi: { path: "react-icons/gi", keys: Object.keys(IconsGi).filter((k) => k.startsWith("Gi")) },
};

/**
 * Search for icons across all supported packs
 */
export function searchIcons(query: string, options: { limit?: number } = {}): IconInfo[] {
  const { limit = 20 } = options;
  const q = query.toLowerCase().replace(/[^a-z0-9]/g, "");
  const results: IconInfo[] = [];

  for (const pack of Object.values(ICON_PACKS)) {
    for (const name of pack.keys) {
      if (name.toLowerCase().includes(q)) {
        results.push({ name, importPath: pack.path });
      }
    }
  }

  // Sort: prefix matches first, then by length
  results.sort((a, b) => {
    const aPrefix = a.name.toLowerCase().startsWith(q) ? 0 : 1;
    const bPrefix = b.name.toLowerCase().startsWith(q) ? 0 : 1;
    return aPrefix !== bPrefix ? aPrefix - bPrefix : a.name.length - b.name.length;
  });

  return results.slice(0, limit);
}

/**
 * Format search results for AI context
 */
export function formatIconResults(icons: IconInfo[]): string {
  if (icons.length === 0) {
    return "No icons found. Try a different search term.";
  }
  const names = icons.map((i) => `${i.name} (${i.importPath})`);
  return `Found: ${names.join(", ")}\nUsage: <IconName size={24} color="#fff" />`;
}
