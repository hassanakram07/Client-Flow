import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand — Enterprise Blue / Indigo (Stripe, Linear, Mercury standard)
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        // Neutral — Slate / Gray scale for clean, professional contrast
        slate: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        // Status colors — clean, accessible pastel & high-contrast accents
        success: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          900: "#064e3b",
        },
        warning: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          900: "#78350f",
        },
        danger: {
          50:  "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          900: "#7f1d1d",
        },
        info: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a8a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-geist-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],     // 11px
        xs:   ["0.75rem",   { lineHeight: "1.125rem" }], // 12px
        sm:   ["0.875rem",  { lineHeight: "1.375rem" }], // 14px
        base: ["1rem",      { lineHeight: "1.5rem" }],   // 16px
        lg:   ["1.125rem",  { lineHeight: "1.75rem" }],  // 18px
        xl:   ["1.25rem",   { lineHeight: "1.875rem" }], // 20px
        "2xl":["1.5rem",    { lineHeight: "2rem" }],     // 24px
        "3xl":["1.875rem",  { lineHeight: "2.25rem" }],  // 30px
        "4xl":["2.25rem",   { lineHeight: "2.625rem" }], // 36px
        "5xl":["3rem",      { lineHeight: "1" }],        // 48px
      },
      spacing: {
        "4.5": "1.125rem",
        "13":  "3.25rem",
        "15":  "3.75rem",
        "18":  "4.5rem",
      },
      borderRadius: {
        none: "0",
        sm:   "0.1875rem",
        DEFAULT: "0.25rem",
        md:   "0.375rem",
        lg:   "0.5rem",
        xl:   "0.75rem",
        "2xl":"1rem",
        full: "9999px",
      },
      boxShadow: {
        "xs":     "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "sm":     "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "DEFAULT":"0 2px 8px -1px rgb(0 0 0 / 0.12), 0 1px 3px -1px rgb(0 0 0 / 0.08)",
        "md":     "0 4px 12px -2px rgb(0 0 0 / 0.15), 0 2px 4px -2px rgb(0 0 0 / 0.08)",
        "lg":     "0 8px 24px -4px rgb(0 0 0 / 0.18), 0 4px 8px -4px rgb(0 0 0 / 0.1)",
        "inset-brand": "inset 0 0 0 1px rgb(37 99 235 / 0.5)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to:   { transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to:   { transform: "translateX(0)" },
        },
        "skeleton-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%":      { opacity: "0.7" },
        },
        "dot-bounce": {
          "0%, 80%, 100%": { transform: "scale(0.7)", opacity: "0.5" },
          "40%":           { transform: "scale(1.0)", opacity: "1" },
        },
        "progress-indeterminate": {
          "0%":   { left: "-50%", width: "50%" },
          "100%": { left: "100%", width: "50%" },
        },
      },
      animation: {
        "fade-in":      "fade-in 0.15s ease-out",
        "fade-up":      "fade-up 0.2s ease-out",
        "slide-in-right":"slide-in-right 0.2s ease-out",
        "slide-in-left":"slide-in-left 0.2s ease-out",
        "skeleton":     "skeleton-pulse 1.5s ease-in-out infinite",
        "progress":     "progress-indeterminate 1.4s ease-in-out infinite",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      zIndex: {
        "dropdown":  "1000",
        "sticky":    "1020",
        "fixed":     "1030",
        "modal-backdrop": "1040",
        "modal":     "1050",
        "popover":   "1060",
        "toast":     "1070",
        "command":   "1080",
        "tooltip":   "1090",
      },
    },
  },
  plugins: [],
};

export default config;
