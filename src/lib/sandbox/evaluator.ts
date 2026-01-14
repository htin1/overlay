import { transform } from "sucrase";
import React from "react";
import * as LucideIcons from "lucide-react";
import * as SimpleIcons from "simple-icons";
import { interpolate, spring } from "./remotion-stubs";

// Pre-compute icon keys once at module load (filter out reserved words)
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
    // Remove import statements - we'll provide these via context
    let processedCode = code
      .replace(/import\s+\{[^}]+\}\s+from\s+["']remotion["'];?\n?/g, "")
      .replace(/import\s+.*\s+from\s+["']remotion["'];?\n?/g, "")
      .replace(/import\s+\{[^}]+\}\s+from\s+["']lucide-react["'];?\n?/g, "")
      .replace(/import\s+\{[^}]+\}\s+from\s+["']simple-icons["'];?\n?/g, "");

    // Convert "export default function Animation" to "function Animation"
    // and store a reference to return it
    processedCode = processedCode
      .replace(/export\s+default\s+function\s+Animation/g, "function Animation")
      .replace(/export\s+default\s+Animation;?/g, "");

    // Transpile JSX to JavaScript
    const { code: transpiledCode } = transform(processedCode, {
      transforms: ["jsx", "typescript"],
      jsxRuntime: "classic",
      production: true,
    });

    // Wrap code with icon destructuring and return the Animation component
    const wrappedCode = `
      const { ${LUCIDE_KEYS.join(", ")} } = LucideIcons;
      const { ${SIMPLE_ICON_KEYS.join(", ")} } = SimpleIcons;
      ${transpiledCode}
      return typeof Animation !== 'undefined' ? Animation : null;
    `;

    // Create function with provided context
    const createComponent = new Function(
      "React",
      "interpolate",
      "spring",
      "LucideIcons",
      "SimpleIcons",
      wrappedCode
    );

    // Execute and get the component
    const Component = createComponent(React, interpolate, spring, LucideIcons, SimpleIcons);

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
