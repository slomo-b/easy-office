import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    dark: {
      colors: {
        // Primary Accent - Electric Cyan
        primary: {
          DEFAULT: "#00E5FF",
          foreground: "#0B141A",
        },
        // Secondary Accent - Lime Glow (Success)
        success: {
          DEFAULT: "#A7F3D0",
          foreground: "#0B141A",
        },
        // Warning
        warning: {
          DEFAULT: "#FBBF24",
          foreground: "#0B141A",
        },
        // Error
        danger: {
          DEFAULT: "#F87171",
          foreground: "#0B141A",
        },
        // Background colors
        background: "#0B141A", // Deep Ocean
        foreground: "#E2E8F0", // Light Gray - Primary Text
        // Content surfaces
        content1: "#111B22", // Dark Slate - Cards, Elevated surfaces
        content2: "#16232B", // Midnight - Hover/Active states
        content3: "#1E2A36", // Soft Blue - Borders, Dividers
        content4: "#1E2A36",
        // Default colors
        default: {
          50: "#16232B",
          100: "#111B22",
          200: "#1E2A36",
          300: "#1E2A36",
          400: "#94A3B8", // Muted Gray - Secondary Text
          500: "#94A3B8",
          600: "#E2E8F0", // Light Gray
          700: "#E2E8F0",
          800: "#E2E8F0",
          900: "#E2E8F0",
          DEFAULT: "#1E2A36",
          foreground: "#E2E8F0",
        },
        // Focus ring
        focus: "#00E5FF",
        // Overlay
        overlay: "rgba(11, 20, 26, 0.8)",
      },
    },
  },
});

