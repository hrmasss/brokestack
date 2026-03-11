/**
 * BROKESTACK MINT - Design Tokens
 * 
 * Centralized design tokens for consistent theming across the marketing page.
 * These values can be tweaked to adjust the entire visual system.
 * 
 * Theme: Soft mint - pastel green workspace aesthetic
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const colors = {
  // Primary brand colors (Mint/Sage family)
  primary: {
    50: "#f1faf3",
    100: "#dff0e4",
    200: "#c4e3cd",
    300: "#a2d0b1",
    400: "#84be96",
    500: "#72b48a", // Main primary
    600: "#5f9b75",
    700: "#4c7c5d",
    800: "#3d624a",
    900: "#304d3a",
    950: "#18291f",
  },
  
  // Secondary colors (Soft eucalyptus)
  secondary: {
    50: "#f4faf6",
    100: "#e8f5eb",
    200: "#d4ead9",
    300: "#b7d7c0",
    400: "#99c4a6",
    500: "#86b797", // Main secondary
    600: "#6e9d7f",
    700: "#597f67",
    800: "#486554",
    900: "#3b5144",
    950: "#1e2c24",
  },
  
  // Accent colors (Herbal moss)
  accent: {
    50: "#f7fbf7",
    100: "#eef6ef",
    200: "#ddebdd",
    300: "#c7dbc8",
    400: "#aac6ad",
    500: "#8cab90", // Main accent
    600: "#738d77",
    700: "#5c715f",
    800: "#4a5b4d",
    900: "#3c493e",
    950: "#1f2721",
  },
  
  // Neutral colors (Slate)
  slate: {
    50: "#f8fafc",
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
} as const;

// =============================================================================
// THEME VARIANTS (Light & Dark)
// =============================================================================

export const themes = {
  dark: {
    // Backgrounds
    bgPrimary: colors.slate[950],
    bgSecondary: colors.slate[900],
    bgTertiary: colors.slate[800],
    bgMuted: `${colors.slate[800]}66`, // 40% opacity
    
    // Glass morphism
    glassBackground: `${colors.slate[800]}66`, // 40% opacity
    glassBorder: `${colors.slate[700]}80`, // 50% opacity
    glassShadow: `${colors.primary[500]}0d`, // 5% opacity
    
    // Navigation
    navBackground: `${colors.slate[900]}99`, // 60% opacity
    navBorder: `${colors.slate[800]}80`,
    
    // Text colors
    textPrimary: "#ffffff",
    textSecondary: colors.slate[300],
    textMuted: colors.slate[400],
    textDimmed: colors.slate[500],
    textAccent: colors.primary[400],
    
    // Borders
    borderPrimary: `${colors.slate[700]}80`,
    borderSecondary: colors.slate[800],
    borderAccent: `${colors.primary[500]}4d`, // 30% opacity
    
    // Gradient overlays
    heroGradient: `linear-gradient(to bottom, ${colors.slate[950]}, ${colors.slate[900]}, ${colors.slate[950]})`,
    ctaGradientFrom: `${colors.primary[500]}33`, // 20% opacity
    ctaGradientTo: colors.slate[900],
    
    // Aurora orbs
    orbPrimaryOpacity: 0.15,
    orbSecondaryOpacity: 0.10,
    orbTertiaryOpacity: 0.10,
  },
  
  light: {
    // Backgrounds
    bgPrimary: "#fafafa",
    bgSecondary: "#ffffff",
    bgTertiary: colors.slate[100],
    bgMuted: `${colors.slate[100]}99`,
    
    // Glass morphism
    glassBackground: "rgba(255, 255, 255, 0.7)",
    glassBorder: `${colors.slate[200]}99`,
    glassShadow: `${colors.slate[500]}0d`,
    
    // Navigation
    navBackground: "rgba(255, 255, 255, 0.8)",
    navBorder: `${colors.slate[200]}80`,
    
    // Text colors
    textPrimary: colors.slate[900],
    textSecondary: colors.slate[700],
    textMuted: colors.slate[500],
    textDimmed: colors.slate[400],
    textAccent: colors.primary[600],
    
    // Borders
    borderPrimary: `${colors.slate[200]}cc`,
    borderSecondary: colors.slate[200],
    borderAccent: `${colors.primary[500]}33`,
    
    // Gradient overlays
    heroGradient: `linear-gradient(to bottom, #fafafa, #ffffff, #f5f5f5)`,
    ctaGradientFrom: `${colors.primary[500]}1a`,
    ctaGradientTo: "#fafafa",
    
    // Aurora orbs
    orbPrimaryOpacity: 0.25,
    orbSecondaryOpacity: 0.15,
    orbTertiaryOpacity: 0.12,
  },
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  // Font families
  fontFamily: {
    sans: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
    display: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
  },
  
  // Font sizes (in rem)
  fontSize: {
    xs: "0.75rem",     // 12px
    sm: "0.875rem",    // 14px
    base: "1rem",      // 16px
    lg: "1.125rem",    // 18px
    xl: "1.25rem",     // 20px
    "2xl": "1.5rem",   // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
    "5xl": "3rem",     // 48px
    "6xl": "3.75rem",  // 60px
    "7xl": "4.5rem",   // 72px
  },
  
  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.2em",
  },
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  // Base spacing scale (in rem)
  0: "0",
  0.5: "0.125rem",  // 2px
  1: "0.25rem",     // 4px
  1.5: "0.375rem",  // 6px
  2: "0.5rem",      // 8px
  2.5: "0.625rem",  // 10px
  3: "0.75rem",     // 12px
  4: "1rem",        // 16px
  5: "1.25rem",     // 20px
  6: "1.5rem",      // 24px
  8: "2rem",        // 32px
  10: "2.5rem",     // 40px
  12: "3rem",       // 48px
  16: "4rem",       // 64px
  20: "5rem",       // 80px
  24: "6rem",       // 96px
  32: "8rem",       // 128px
  
  // Section spacing
  sectionPaddingY: "6rem",      // py-24
  sectionPaddingX: "1.5rem",    // px-6
  containerMaxWidth: "72rem",   // max-w-6xl
  containerMaxWidthLg: "80rem", // max-w-7xl
  heroMaxWidth: "56rem",        // max-w-4xl
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const radius = {
  none: "0",
  sm: "0.125rem",    // 2px
  default: "0.25rem", // 4px
  md: "0.375rem",    // 6px
  lg: "0.5rem",      // 8px
  xl: "0.75rem",     // 12px
  "2xl": "1rem",     // 16px
  "3xl": "1.5rem",   // 24px
  full: "9999px",
  
  // Component-specific
  card: "1rem",      // rounded-2xl
  button: "0.5rem",  // rounded-lg
  input: "0.5rem",   // rounded-lg
  badge: "9999px",   // rounded-full
  avatar: "9999px",  // rounded-full
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  default: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  
  // Brand shadows
  primaryGlow: `0 10px 40px -10px ${colors.primary[500]}40`,
  primaryGlowStrong: `0 20px 50px -12px ${colors.primary[500]}50`,
  cardGlow: `0 25px 50px -12px ${colors.primary[500]}0d`,
} as const;

// =============================================================================
// EFFECTS - BLUR, GRAIN, GRADIENTS
// =============================================================================

export const effects = {
  // Backdrop blur intensities
  blur: {
    none: "0",
    sm: "4px",
    default: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "40px",
    "3xl": "64px",
    
    // Component-specific
    glass: "40px",        // backdrop-blur-2xl
    nav: "40px",          // backdrop-blur-2xl
    card: "40px",         // backdrop-blur-2xl
    overlay: "24px",      // backdrop-blur-xl
  },
  
  // Gradient blur for aurora orbs
  orbBlur: {
    primary: "150px",
    secondary: "120px",
    tertiary: "100px",
  },
  
  // Grain/noise texture
  grain: {
    // Base frequency for fractal noise (higher = finer grain)
    baseFrequency: 0.8,
    // Number of octaves (more = more detail)
    numOctaves: 4,
    // Opacity for different contexts
    opacity: {
      subtle: 0.03,
      default: 0.04,
      strong: 0.06,
      overlay: 0.08,
    },
  },
  
  // Gradient intensities (opacity multipliers)
  gradient: {
    // Aurora orb opacities
    orb: {
      light: { primary: 0.25, secondary: 0.15, tertiary: 0.12 },
      dark: { primary: 0.15, secondary: 0.10, tertiary: 0.10 },
    },
    // Hover glow intensity
    hoverGlow: 0.30,
    // CTA section gradient
    ctaOverlay: 0.20,
    // Text gradient stops (for AuroraText)
    textStops: {
      from: colors.primary[400],
      via: colors.secondary[400],
      to: colors.accent[400],
    },
  },
  
  // Cursor glow
  cursorGlow: {
    size: 600, // px
    opacity: 0.30,
    colors: {
      inner: `${colors.primary[500]}1f`,  // 12% opacity
      middle: `${colors.secondary[500]}14`, // 8% opacity
      outer: `${colors.accent[500]}0a`,    // 4% opacity
    },
  },
} as const;

// =============================================================================
// TRANSITIONS & ANIMATIONS
// =============================================================================

export const transitions = {
  // Durations
  duration: {
    fast: "150ms",
    default: "200ms",
    medium: "300ms",
    slow: "500ms",
    slower: "700ms",
  },
  
  // Timing functions
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  
  // Common transitions
  base: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  colors: "color, background-color, border-color, text-decoration-color, fill, stroke 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  transform: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
  hover: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
  glow: "all 700ms cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

export const zIndex = {
  behind: -1,
  base: 0,
  raised: 1,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
  nav: 50,
  cursorGlow: 0,
  noise: 1,
} as const;

// =============================================================================
// COMPONENT TOKENS
// =============================================================================

export const components = {
  // Navigation bar
  nav: {
    height: "4rem", // h-16
    backdropBlur: effects.blur.nav,
  },
  
  // Buttons
  button: {
    heightSm: "2rem",
    height: "2.5rem",
    heightLg: "3rem",
    heightXl: "3.5rem",
    paddingX: "1rem",
    paddingXLg: "2rem",
    radius: radius.button,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Cards
  card: {
    padding: "1.5rem", // p-6
    radius: radius.card,
    backdropBlur: effects.blur.card,
  },
  
  // Inputs
  input: {
    height: "3rem", // h-12
    paddingX: "1rem",
    radius: radius.input,
  },
  
  // Section labels
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.widest,
    lineWidth: "2rem", // w-8
  },
} as const;

// =============================================================================
// NOISE TEXTURE SVG GENERATOR
// =============================================================================

export function generateNoiseTexture(
  baseFrequency = effects.grain.baseFrequency,
  numOctaves = effects.grain.numOctaves
): string {
  return `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${baseFrequency}' numOctaves='${numOctaves}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;
}

// =============================================================================
// AURORA GRADIENT GENERATOR
// =============================================================================

export function generateAuroraGradient(
  direction: "to-r" | "to-br" | "to-b" | "to-t" = "to-r",
  from = colors.primary[400],
  via = colors.secondary[400],
  to = colors.accent[400]
): string {
  const dirMap = {
    "to-r": "to right",
    "to-br": "to bottom right",
    "to-b": "to bottom",
    "to-t": "to top",
  };
  return `linear-gradient(${dirMap[direction]}, ${from}, ${via}, ${to})`;
}

// =============================================================================
// CURSOR GLOW GRADIENT
// =============================================================================

export function generateCursorGlow(): string {
  const { colors: glowColors } = effects.cursorGlow;
  return `radial-gradient(circle, ${glowColors.inner} 0%, ${glowColors.middle} 30%, ${glowColors.outer} 60%, transparent 80%)`;
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ThemeMode = "light" | "dark";
export type Theme = typeof themes.dark;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Effects = typeof effects;
