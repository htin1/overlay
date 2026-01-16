import { transform } from "sucrase";
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import * as LucideIcons from "lucide-react";
import * as SimpleIcons from "simple-icons";
import { interpolate, interpolateColors, spring, Easing, AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";

// Pre-compute keys once at module load
const LUCIDE_KEYS = Object.keys(LucideIcons).filter(k => k !== "default" && !k.startsWith("_"));
const SIMPLE_ICON_KEYS = Object.keys(SimpleIcons).filter(k => k.startsWith("si"));

export interface AnimationProps {
  frame: number;
  durationInFrames: number;
  width: number;
  height: number;
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

    // Find all si* icon references in the code
    const siIconsUsed = [...new Set(
      (transpiledCode.match(/\bsi[A-Z][a-zA-Z]*/g) || [])
    )];

    // Check for missing simple-icons before execution
    const missingSiIcons = siIconsUsed.filter(icon => !SIMPLE_ICON_KEYS.includes(icon));
    if (missingSiIcons.length > 0) {
      return {
        component: null,
        error: `Missing simple-icons: ${missingSiIcons.join(", ")}. These icons don't exist in the simple-icons package. Use only available icons like: siGithub, siX, siInstagram, siYoutube, siSpotify, siDiscord, siFigma, siNotion, siReact, siVercel, siStripe`,
      };
    }

    // Wrap code with icon destructuring
    const wrappedCode = `
      const { ${LUCIDE_KEYS.join(", ")} } = LucideIcons;
      ${siIconsUsed.length > 0 ? `const { ${siIconsUsed.join(", ")} } = SimpleIcons;` : ""}

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
      "SimpleIcons",
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
      SimpleIcons
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
