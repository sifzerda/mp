// src/theme/colors.js

export const DARK_COLORS = {
  background: "#08121f",
  surface: "#142436",
  surfaceAlt: "#193448",
  border: "#28445b",
  text: "#ffffff",
  muted: "#9baec1",
  primary: "#00d9ff",
  danger: "#ff477e",
  success: "#22c55e",
  overlay: "rgba(0, 0, 0, 0.65)",
  sliderTrack: "#34485b",
  placeholder: "#172b40",
};

export const LIGHT_COLORS = {
  background: "#f1f5f9",
  surface: "#ffffff",
  surfaceAlt: "#e2e8f0",
  border: "#cbd5e1",
  text: "#0f172a",
  muted: "#64748b",
  primary: "#00d9ff",
  danger: "#e11d48",
  success: "#16a34a",
  overlay: "rgba(0, 0, 0, 0.4)",
  sliderTrack: "#cbd5e1",
  placeholder: "#e2e8f0",
};

export const ACCENT_PRESETS = [
  { name: "Cyan", color: "#00d9ff" },
  { name: "Blue", color: "#3684ff" },
  { name: "Purple", color: "#a855f7" },
  { name: "Pink", color: "#ec4899" },
  { name: "Red", color: "#ef4444" },
  { name: "Orange", color: "#f97316" },
  { name: "Green", color: "#22c55e" },
  { name: "Gold", color: "#eab308" },
];

// Backward compatibility while migrating components.
export default DARK_COLORS;