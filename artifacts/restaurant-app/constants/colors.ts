const PRIMARY = "#FF6B35";
const SECONDARY = "#2EC4B6";
const DARK_BG = "#0F0F0F";
const DARK_CARD = "#1A1A1A";
const DARK_SURFACE = "#242424";
const DARK_BORDER = "#2C2C2C";
const LIGHT_BG = "#F8F9FA";
const LIGHT_CARD = "#FFFFFF";
const LIGHT_SURFACE = "#F2F3F4";
const LIGHT_BORDER = "#E8E9EA";

export default {
  primary: PRIMARY,
  secondary: SECONDARY,
  accent: "#FFB347",
  error: "#FF4757",
  success: "#2ECC71",
  warning: "#F39C12",
  star: "#FFD700",

  light: {
    text: "#1E1E1E",
    textSecondary: "#666666",
    textTertiary: "#999999",
    background: LIGHT_BG,
    card: LIGHT_CARD,
    surface: LIGHT_SURFACE,
    border: LIGHT_BORDER,
    tint: PRIMARY,
    tabIconDefault: "#AAAAAA",
    tabIconSelected: PRIMARY,
    shadow: "rgba(0,0,0,0.08)",
    overlay: "rgba(0,0,0,0.5)",
  },

  dark: {
    text: "#F5F5F5",
    textSecondary: "#AAAAAA",
    textTertiary: "#666666",
    background: DARK_BG,
    card: DARK_CARD,
    surface: DARK_SURFACE,
    border: DARK_BORDER,
    tint: PRIMARY,
    tabIconDefault: "#555555",
    tabIconSelected: PRIMARY,
    shadow: "rgba(0,0,0,0.4)",
    overlay: "rgba(0,0,0,0.7)",
  },
};
