export const colors = {
  corporateBlue: "#0876C9",
  lightBlue: "#B9DDF8",
  aqua: "#72BAB8",
  white: "#FFFFFF",
  nearBlack: "#242424",
  darkGray: "#383838",
} as const;

export const theme = {
  colors,
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  radius: {
    md: 12,
  },
} as const;
