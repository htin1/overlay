import { transform } from "sucrase";
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import * as LucideIcons from "lucide-react";
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
import { interpolate, interpolateColors, spring, Easing, AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";

// Pre-compute keys once at module load
const LUCIDE_KEYS = Object.keys(LucideIcons).filter(k => k !== "default" && !k.startsWith("_"));

// Icon pack configuration: prefix -> available icon names
const ICON_PACKS = {
  Si: Object.keys(IconsSi).filter(k => k.startsWith("Si")),
  Fa: Object.keys(IconsFa6).filter(k => k.startsWith("Fa")),
  Md: Object.keys(IconsMd).filter(k => k.startsWith("Md")),
  Hi: Object.keys(IconsHi2).filter(k => k.startsWith("Hi")),
  Tb: Object.keys(IconsTb).filter(k => k.startsWith("Tb")),
  Bs: Object.keys(IconsBs).filter(k => k.startsWith("Bs")),
  Io: Object.keys(IconsIo5).filter(k => k.startsWith("Io")),
  Ri: Object.keys(IconsRi).filter(k => k.startsWith("Ri")),
  Vsc: Object.keys(IconsVsc).filter(k => k.startsWith("Vsc")),
  Gi: Object.keys(IconsGi).filter(k => k.startsWith("Gi")),
} as const;

type IconPrefix = keyof typeof ICON_PACKS;

export interface AnimationProps {
  frame: number;
  durationInFrames: number;
  width: number;
  height: number;
  media: Record<string, string>;
}

export type AnimationComponent = React.ComponentType<AnimationProps>;

export interface EvaluationResult {
  component: AnimationComponent | null;
  error: string | null;
}

/**
 * Evaluates generated animation code and returns a React component.
 * Uses sucrase for JSX transpilation and provides Remotion stubs.
 */
export function evaluateAnimationCode(code: string): EvaluationResult {
  try {
    // Remove ALL import statements - we provide everything via context
    // Handle single-line and multi-line imports
    let processedCode = code
      // Multi-line imports: import {\n  X,\n  Y\n} from 'z'
      .replace(/import\s*\{[\s\S]*?\}\s*from\s*["'][^"']+["'];?/g, "")
      // Single-line imports: import X from 'y', import * as X from 'y'
      .replace(/import\s+.*?\s+from\s*["'][^"']+["'];?/g, "")
      // Side-effect imports: import 'x'
      .replace(/import\s*["'][^"']+["'];?/g, "");

    // Convert "export default function X" to "function Animation"
    // Handle any function name, not just "Animation"
    processedCode = processedCode
      .replace(/export\s+default\s+function\s+(\w+)/g, "function Animation")
      .replace(/export\s+default\s+\w+;?/g, "")
      // Also handle any other export statements (for sub-components)
      .replace(/export\s+function\s+/g, "function ")
      .replace(/export\s+const\s+/g, "const ");

    // Transpile JSX to JavaScript
    const { code: transpiledCode } = transform(processedCode, {
      transforms: ["jsx", "typescript"],
      jsxRuntime: "classic",
      production: true,
    });

    // Find all react-icons references in the code
    // Each prefix (Si, Fa, Md, etc.) maps to a different icon pack
    const iconsByPack: Record<IconPrefix, string[]> = {
      Si: [], Fa: [], Md: [], Hi: [], Tb: [], Bs: [], Io: [], Ri: [], Vsc: [], Gi: [],
    };

    // Match icons for each prefix
    for (const prefix of Object.keys(ICON_PACKS) as IconPrefix[]) {
      const regex = new RegExp(`\\b${prefix}[A-Z][a-zA-Z0-9]*`, "g");
      const matches = transpiledCode.match(regex) || [];
      iconsByPack[prefix] = [...new Set(matches)];
    }

    // Check for missing icons in each pack
    const missingIcons: string[] = [];
    for (const prefix of Object.keys(ICON_PACKS) as IconPrefix[]) {
      for (const icon of iconsByPack[prefix]) {
        if (!ICON_PACKS[prefix].includes(icon)) {
          missingIcons.push(icon);
        }
      }
    }

    if (missingIcons.length > 0) {
      return {
        component: null,
        error: `Missing icons: ${missingIcons.join(", ")}. Use the searchIcons tool to find the correct icon name.`,
      };
    }

    // Build icon destructuring statements
    const iconDestructuring = (Object.keys(ICON_PACKS) as IconPrefix[])
      .filter(prefix => iconsByPack[prefix].length > 0)
      .map(prefix => `const { ${iconsByPack[prefix].join(", ")} } = Icons${prefix};`)
      .join("\n      ");

    // Wrap code with icon destructuring
    const wrappedCode = `
      const { ${LUCIDE_KEYS.join(", ")} } = LucideIcons;
      ${iconDestructuring}

      ${transpiledCode}
      return typeof Animation !== 'undefined' ? Animation : null;
    `;

    // Create function with provided context
    const createComponent = new Function(
      "React",
      "useMemo",
      "useState",
      "useCallback",
      "useEffect",
      "useRef",
      "interpolate",
      "interpolateColors",
      "spring",
      "Easing",
      "AbsoluteFill",
      "Sequence",
      "useCurrentFrame",
      "useVideoConfig",
      "LucideIcons",
      "IconsSi",
      "IconsFa",
      "IconsMd",
      "IconsHi",
      "IconsTb",
      "IconsBs",
      "IconsIo",
      "IconsRi",
      "IconsVsc",
      "IconsGi",
      wrappedCode
    );

    // Execute and get the component
    const Component = createComponent(
      React,
      useMemo,
      useState,
      useCallback,
      useEffect,
      useRef,
      interpolate,
      interpolateColors,
      spring,
      Easing,
      AbsoluteFill,
      Sequence,
      useCurrentFrame,
      useVideoConfig,
      LucideIcons,
      IconsSi,
      IconsFa6,
      IconsMd,
      IconsHi2,
      IconsTb,
      IconsBs,
      IconsIo5,
      IconsRi,
      IconsVsc,
      IconsGi
    );

    if (!Component) {
      return {
        component: null,
        error: "No Animation component found. Make sure to export a default function named 'Animation'.",
      };
    }

    // Wrap component to catch runtime errors
    const SafeComponent: AnimationComponent = (props) => {
      try {
        return React.createElement(Component, props);
      } catch (err) {
        return React.createElement(
          "div",
          {
            style: {
              color: "#ef4444",
              padding: 20,
              fontFamily: "monospace",
              fontSize: 14,
            },
          },
          `Runtime error: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    };

    return { component: SafeComponent, error: null };
  } catch (err) {
    return {
      component: null,
      error: err instanceof Error ? err.message : "Failed to evaluate code",
    };
  }
}
