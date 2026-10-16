export const colors = {
  corporateBlue: "#0876C9",
  lightBlue: "#B9DDF8",
  aqua: "#72BAB8",
  white: "#FFFFFF",
  nearBlack: "#242424",
  darkGray: "#383838",
} as const;

export const semanticColors = {
  background: "#F4F8FC",
  text: "#242424",
  textMuted: "#64748B",
  textSubtle: "#94A3B8",
  surface: "#FFFFFF",
  surfaceAlt: "#F8FAFC",
  surfaceTint: "#F0F7FD",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  success: "#27AE60",
  successBg: "#EAFAF1",
  warning: "#F39C12",
  warningBg: "#FEF5E7",
  danger: "#C0392B",
  dangerBg: "#FDEDEC",
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const typography = {
  sizes: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    display: 26,
  },
  weights: {
    regular: "400",
    semibold: "600",
    bold: "700",
  },
} as const;

export const theme = {
  colors: {
    ...colors,
    ...semanticColors,
  },
  spacing,
  radius,
  typography,
} as const;
