/**
 * Enterprise Dashboard Design System
 * 
 * Comprehensive design tokens for consistent, accessible, and scalable UI
 * Following industry best practices and WCAG AA standards
 */

/* ============================================================================
   COLOR SYSTEM - Accessible & Colorblind-Friendly
   ============================================================================ */

export const DASHBOARD_COLORS = {
  // Status Colors (WCAG AA compliant contrast ratios)
  status: {
    critical: '#dc2626',      // Red-600 - Errors, Critical alerts
    warning: '#f59e0b',       // Amber-500 - Warnings, Attention needed
    success: '#10b981',       // Emerald-500 - Success, Healthy status
    info: '#3b82f6',          // Blue-500 - Information, Running status
    neutral: '#6b7280',       // Gray-500 - Neutral, Unknown status
    paused: '#8b5cf6',        // Purple-500 - Paused, Pending approval
  },

  // Chart Colors (Optimized for colorblind users)
  charts: {
    // Categorical data (qualitative) - 8 distinct colors
    categorical: [
      '#0ea5e9',  // Sky-500
      '#8b5cf6',  // Purple-500
      '#ec4899',  // Pink-500
      '#f59e0b',  // Amber-500
      '#10b981',  // Emerald-500
      '#ef4444',  // Red-500
      '#06b6d4',  // Cyan-500
      '#f97316',  // Orange-500
    ],
    
    // Sequential data (quantitative low → high) - 5 steps
    sequential: {
      blue: ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'],
      green: ['#d1fae5', '#6ee7b7', '#10b981', '#047857', '#064e3b'],
      orange: ['#fed7aa', '#fdba74', '#fb923c', '#ea580c', '#9a3412'],
    },
    
    // Diverging data (negative ↔ neutral ↔ positive) - 5 steps
    diverging: ['#dc2626', '#f59e0b', '#fbbf24', '#a3e635', '#10b981'],
  },

  // Gradients (Premium look & feel)
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    warning: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    error: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    info: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  },

  // Glass morphism effects
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.18)',
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
    },
    dark: {
      background: 'rgba(17, 25, 40, 0.75)',
      border: 'rgba(255, 255, 255, 0.08)',
      shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    },
  },
} as const;

/* ============================================================================
   TYPOGRAPHY SYSTEM - Readable & Scalable
   ============================================================================ */

export const TYPOGRAPHY = {
  // Font Families
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
    display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },

  // Font Sizes (Type scale - 1.2 ratio)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    snug: 1.4,
    normal: 1.6,
    relaxed: 1.8,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Component-specific styles
  components: {
    // Dashboard Title
    h1: {
      fontSize: '2rem',        // 32px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      fontFamily: '"Inter", -apple-system, sans-serif',
    },

    // Widget Title
    h2: {
      fontSize: '1.125rem',    // 18px
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },

    // Section Title
    h3: {
      fontSize: '0.875rem',    // 14px
      fontWeight: 700,
      lineHeight: 1.4,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },

    // Metric Value (Big numbers)
    metric: {
      fontSize: '2.25rem',     // 36px
      fontWeight: 700,
      lineHeight: 1.1,
      fontFamily: '"JetBrains Mono", monospace',
    },

    // Metric Label
    metricLabel: {
      fontSize: '0.75rem',     // 12px
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },

    // Body Text
    body: {
      fontSize: '0.875rem',    // 14px
      fontWeight: 400,
      lineHeight: 1.6,
    },

    // Caption/Helper Text
    caption: {
      fontSize: '0.75rem',     // 12px
      fontWeight: 500,
      lineHeight: 1.4,
    },
  },
} as const;

/* ============================================================================
   SPACING SYSTEM - 8px Grid System
   ============================================================================ */

export const SPACING = {
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  2: '0.5rem',       // 8px
  3: '0.75rem',      // 12px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  10: '2.5rem',      // 40px
  12: '3rem',        // 48px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
} as const;

/* ============================================================================
   BREAKPOINTS - Mobile-First Responsive Design
   ============================================================================ */

export const BREAKPOINTS = {
  xs: '0px',         // Extra small devices (portrait phones)
  sm: '640px',       // Small devices (landscape phones)
  md: '768px',       // Medium devices (tablets)
  lg: '1024px',      // Large devices (laptops)
  xl: '1280px',      // Extra large devices (desktops)
  '2xl': '1536px',   // 2X large devices (large desktops)
} as const;

export const MEDIA_QUERIES = {
  xs: `@media (min-width: ${BREAKPOINTS.xs})`,
  sm: `@media (min-width: ${BREAKPOINTS.sm})`,
  md: `@media (min-width: ${BREAKPOINTS.md})`,
  lg: `@media (min-width: ${BREAKPOINTS.lg})`,
  xl: `@media (min-width: ${BREAKPOINTS.xl})`,
  '2xl': `@media (min-width: ${BREAKPOINTS['2xl']})`,
  
  // Range queries
  smOnly: `@media (min-width: ${BREAKPOINTS.sm}) and (max-width: ${BREAKPOINTS.md})`,
  mdOnly: `@media (min-width: ${BREAKPOINTS.md}) and (max-width: ${BREAKPOINTS.lg})`,
  lgOnly: `@media (min-width: ${BREAKPOINTS.lg}) and (max-width: ${BREAKPOINTS.xl})`,
  
  // Max-width queries (for mobile-first approach)
  maxSm: `@media (max-width: ${BREAKPOINTS.sm})`,
  maxMd: `@media (max-width: ${BREAKPOINTS.md})`,
  maxLg: `@media (max-width: ${BREAKPOINTS.lg})`,
  maxXl: `@media (max-width: ${BREAKPOINTS.xl})`,
} as const;

/* ============================================================================
   SHADOWS - Elevation System (Material Design inspired)
   ============================================================================ */

export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // Colored shadows for emphasis
  primaryGlow: '0 0 20px rgba(59, 130, 246, 0.3)',
  successGlow: '0 0 20px rgba(16, 185, 129, 0.3)',
  warningGlow: '0 0 20px rgba(245, 158, 11, 0.3)',
  errorGlow: '0 0 20px rgba(220, 38, 38, 0.3)',
} as const;

/* ============================================================================
   BORDER RADIUS - Rounded Corners
   ============================================================================ */

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.25rem',    // 4px
  base: '0.5rem',   // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  full: '9999px',   // Circular
} as const;

/* ============================================================================
   Z-INDEX - Layering System
   ============================================================================ */

export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
} as const;

/* ============================================================================
   TRANSITIONS - Animation Timing
   ============================================================================ */

export const TRANSITIONS = {
  // Duration
  duration: {
    instant: '75ms',
    fast: '150ms',
    base: '200ms',
    moderate: '300ms',
    slow: '500ms',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Common transitions
  default: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  color: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

/* ============================================================================
   ACCESSIBILITY - Motion & Contrast Preferences
   ============================================================================ */

export const A11Y = {
  // Reduced motion media query
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  
  // High contrast media query
  highContrast: '@media (prefers-contrast: high)',
  
  // Focus styles
  focusRing: {
    default: '0 0 0 3px var(--ant-color-primary-bg)',
    error: '0 0 0 3px var(--ant-color-error-bg)',
    success: '0 0 0 3px var(--ant-color-success-bg)',
  },
  
  // Minimum touch target size (WCAG 2.1 Level AAA)
  minTouchTarget: '44px',
} as const;

/* ============================================================================
   WIDGET PRIORITIES - Enterprise Dashboard Layout
   ============================================================================ */

export const WIDGET_PRIORITIES = {
  critical: {
    // Always visible, largest size
    priority: 1,
    defaultSize: { span: 2, minHeight: 200 },
    collapsible: false,
  },
  high: {
    // Visible on desktop, collapsible on mobile
    priority: 2,
    defaultSize: { span: 1, minHeight: 160 },
    collapsible: true,
  },
  medium: {
    // Hidden on mobile by default
    priority: 3,
    defaultSize: { span: 1, minHeight: 140 },
    collapsible: true,
  },
  low: {
    // Only visible on large screens
    priority: 4,
    defaultSize: { span: 1, minHeight: 120 },
    collapsible: true,
  },
} as const;

/* ============================================================================
   CHART CONFIGURATION - Default Settings
   ============================================================================ */

export const CHART_CONFIG = {
  // Default chart dimensions
  defaultHeight: 300,
  minHeight: 200,
  maxHeight: 600,

  // Animation settings
  animation: {
    duration: 300,
    easing: 'ease-out',
    // Respect user's motion preferences
    reducedMotionDuration: 0,
  },

  // Grid and axis styling
  grid: {
    stroke: 'var(--ant-color-border-secondary)',
    strokeDasharray: '3 3',
    opacity: 0.5,
  },

  axis: {
    stroke: 'var(--ant-color-border)',
    fontSize: '12px',
    fontFamily: TYPOGRAPHY.fontFamily.sans,
  },

  // Tooltip styling
  tooltip: {
    backgroundColor: 'var(--ant-color-bg-elevated)',
    border: '1px solid var(--ant-color-border)',
    borderRadius: BORDER_RADIUS.base,
    padding: SPACING[3],
    boxShadow: SHADOWS.lg,
  },
} as const;

/* ============================================================================
   TYPE EXPORTS - TypeScript Support
   ============================================================================ */

export type StatusColor = keyof typeof DASHBOARD_COLORS.status;
export type ChartPalette = keyof typeof DASHBOARD_COLORS.charts;
export type GradientName = keyof typeof DASHBOARD_COLORS.gradients;
export type Breakpoint = keyof typeof BREAKPOINTS;
export type Shadow = keyof typeof SHADOWS;
export type BorderRadius = keyof typeof BORDER_RADIUS;
export type TransitionDuration = keyof typeof TRANSITIONS.duration;
export type TransitionEasing = keyof typeof TRANSITIONS.easing;
