// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  classGroups: {
    // Add custom class groups here if needed
    "font-size": [{ text: ["nav-size", "kicker-small-size"] }],
    tracking: [
      { tracking: ["nav-letter-spacing", "kicker-small-letter-spacing"] },
    ],
    leading: [{ leading: ["nav-line-height", "kicker-small-line-height"] }],
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}

// CSS variable defaults
export const cssVariables = {
  "--max-content-width": "1440px",
  "--base-duration": "300ms",
  "--slow-duration": "500ms",
  "--fast-duration": "200ms",
  "--base-easing": "cubic-bezier(0.4, 0, 0.2, 1)",
  "--over-bounce-easing-out": "cubic-bezier(0.34, 1.56, 0.64, 1)",
  "--over-bounce-easing-in": "cubic-bezier(0.36, 0, 0.66, -0.56)",
  "--grain-size": "100px",
  "--z-header": "100",
  "--ds-light-low": "0 2px 4px rgba(0, 0, 0, 0.1)",
  "--ds-dark-low": "0 4px 6px rgba(0, 0, 0, 0.15)",
  "--ds-dark-medium": "0 8px 16px rgba(0, 0, 0, 0.2)",
} as const;

// Theme colors
export const themeColors = {
  base: {
    100: "#FFFFFF",
    200: "#F3F4F6",
    600: "#6B7280",
    700: "#4B5563",
    800: "#1F2937",
    900: "#111827",
  },
  purple: {
    50: "#F5F3FF",
    100: "#EDE9FE",
    200: "#DDD6FE",
    400: "#A78BFA",
    600: "#7C3AED",
    700: "#6D28D9",
  },
  primary: {
    start: "#4E32FD",
    end: "#F82DE8",
  },
} as const;

// Type-safe animation variants
export const animations = {
  slideIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeOut" },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.2 },
  },
} as const;

// Type safe media queries
export const mediaQueries = {
  sm: "(min-width: 479px)",
  md: "(min-width: 720px)",
  lg: "(min-width: 992px)",
  xl: "(min-width: 1100px)",
  "2xl": "(min-width: 1440px)",
} as const;

// Custom hooks for animations
export function useHeaderAnimation() {
  return {
    initial: "initial",
    animate: "animate",
    exit: "exit",
    variants: {
      initial: {
        y: -100,
        opacity: 0,
        scale: 0.9,
      },
      animate: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.3,
          ease: cssVariables["--base-easing"],
        },
      },
      exit: {
        y: -100,
        opacity: 0,
        scale: 0.9,
        transition: {
          duration: 0.2,
          ease: cssVariables["--base-easing"],
        },
      },
    },
  };
}

// Type-safe gradient generator
export function createGradient(
  direction:
    | "to-r"
    | "to-l"
    | "to-t"
    | "to-b"
    | "to-br"
    | "to-bl"
    | "to-tr"
    | "to-tl",
  startColor: string,
  endColor: string,
  withGrain: boolean = false
) {
  const gradient = `bg-gradient-${direction} from-[${startColor}] to-[${endColor}]`;
  if (!withGrain) return gradient;
  return `${gradient} bg-[image:var(--grain-5-url),linear-gradient(${startColor},${endColor})]`;
}

// Type-safe shadow generator
export function createShadow(
  level: "low" | "medium" | "high",
  theme: "light" | "dark" = "light"
) {
  const shadows = {
    light: {
      low: cssVariables["--ds-light-low"],
      medium: "0 4px 8px rgba(0, 0, 0, 0.12)",
      high: "0 8px 16px rgba(0, 0, 0, 0.15)",
    },
    dark: {
      low: cssVariables["--ds-dark-low"],
      medium: cssVariables["--ds-dark-medium"],
      high: "0 12px 24px rgba(0, 0, 0, 0.25)",
    },
  } as const;

  return shadows[theme][level];
}

export type ThemeColors = typeof themeColors;
export type CSSVariables = typeof cssVariables;
export type Animations = typeof animations;
export type MediaQueries = typeof mediaQueries;
