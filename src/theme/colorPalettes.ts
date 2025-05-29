// Define the available color theme keys
export type ColorTheme =
  | "default"
  | "tropical-jungle"
  | "ocean-sunset"
  | "desert-storm"
  | "berry-fields"
  | "arctic-moss"
  | "cyber-neon"
  | "midnight-aurora"
  | "sage-terracotta"
  | "sunset-gradient"
  | "monochrome-pop";

// Each palette now has both light and dark variants
export const colorPalettes: Record<
  ColorTheme,
  {
    light: Record<string, string>;
    dark: Record<string, string>;
  }
> = {
  default: {
    light: {
      "--color-primary": "#6366F1",
      "--color-primary-50": "#EEF2FF",
      "--color-primary-100": "#E0E7FF",
      "--color-accent": "#EC4899",
      "--color-background": "#FFFFFF",
      "--color-surface": "#F8FAFC",
      "--color-text": "#1E293B",
      "--color-text-secondary": "#64748B",
      "--color-border": "#E2E8F0",
    },
    dark: {
      "--color-primary": "#818CF8",
      "--color-primary-50": "#312E81",
      "--color-primary-100": "#3730A3",
      "--color-accent": "#F472B6",
      "--color-background": "#0F172A",
      "--color-surface": "#1E293B",
      "--color-text": "#F1F5F9",
      "--color-text-secondary": "#94A3B8",
      "--color-border": "#334155",
    },
  },

  "tropical-jungle": {
    light: {
      "--color-primary": "#059669",
      "--color-primary-50": "#ECFDF5",
      "--color-primary-100": "#D1FAE5",
      "--color-accent": "#84CC16",
      "--color-background": "#FEFFFE",
      "--color-surface": "#F0FDF4",
      "--color-text": "#064E3B",
      "--color-text-secondary": "#065F46",
      "--color-border": "#BBF7D0",
    },
    dark: {
      "--color-primary": "#10B981",
      "--color-primary-50": "#064E3B",
      "--color-primary-100": "#065F46",
      "--color-accent": "#A3E635",
      "--color-background": "#0F1B0F",
      "--color-surface": "#1A2E1A",
      "--color-text": "#ECFDF5",
      "--color-text-secondary": "#A7F3D0",
      "--color-border": "#166534",
    },
  },

  "ocean-sunset": {
    light: {
      "--color-primary": "#0891B2",
      "--color-primary-50": "#E0F7FA",
      "--color-primary-100": "#B2EBF2",
      "--color-accent": "#F97316",
      "--color-background": "#FFFBF7",
      "--color-surface": "#FEF3F2",
      "--color-text": "#0F172A",
      "--color-text-secondary": "#475569",
      "--color-border": "#B3E5FC",
    },
    dark: {
      "--color-primary": "#22D3EE",
      "--color-primary-50": "#164E63",
      "--color-primary-100": "#0E7490",
      "--color-accent": "#FB923C",
      "--color-background": "#0F1419",
      "--color-surface": "#1E2A35",
      "--color-text": "#F0F9FF",
      "--color-text-secondary": "#7DD3FC",
      "--color-border": "#0E7490",
    },
  },

  "desert-storm": {
    light: {
      "--color-primary": "#DC2626",
      "--color-primary-50": "#FEF2F2",
      "--color-primary-100": "#FEE2E2",
      "--color-accent": "#F59E0B",
      "--color-background": "#FFFBEB",
      "--color-surface": "#FEF3C7",
      "--color-text": "#92400E",
      "--color-text-secondary": "#B45309",
      "--color-border": "#FED7AA",
    },
    dark: {
      "--color-primary": "#F87171",
      "--color-primary-50": "#7F1D1D",
      "--color-primary-100": "#991B1B",
      "--color-accent": "#FBBF24",
      "--color-background": "#1C1410",
      "--color-surface": "#2D2016",
      "--color-text": "#FEF3C7",
      "--color-text-secondary": "#FDE68A",
      "--color-border": "#A16207",
    },
  },

  "berry-fields": {
    light: {
      "--color-primary": "#7C3AED",
      "--color-primary-50": "#F3E8FF",
      "--color-primary-100": "#E9D5FF",
      "--color-accent": "#DB2777",
      "--color-background": "#FEFCFF",
      "--color-surface": "#FAF5FF",
      "--color-text": "#581C87",
      "--color-text-secondary": "#7C3AED",
      "--color-border": "#DDD6FE",
    },
    dark: {
      "--color-primary": "#A78BFA",
      "--color-primary-50": "#581C87",
      "--color-primary-100": "#6B21A8",
      "--color-accent": "#F472B6",
      "--color-background": "#1A0B1A",
      "--color-surface": "#2D1B2D",
      "--color-text": "#F3E8FF",
      "--color-text-secondary": "#C4B5FD",
      "--color-border": "#7C3AED",
    },
  },

  "arctic-moss": {
    light: {
      "--color-primary": "#1E40AF",
      "--color-primary-50": "#EFF6FF",
      "--color-primary-100": "#DBEAFE",
      "--color-accent": "#10B981",
      "--color-background": "#F9FAFB",
      "--color-surface": "#F3F4F6",
      "--color-text": "#111827",
      "--color-text-secondary": "#374151",
      "--color-border": "#D1D5DB",
    },
    dark: {
      "--color-primary": "#60A5FA",
      "--color-primary-50": "#1E3A8A",
      "--color-primary-100": "#1D4ED8",
      "--color-accent": "#34D399",
      "--color-background": "#0F1419",
      "--color-surface": "#1F2937",
      "--color-text": "#F9FAFB",
      "--color-text-secondary": "#D1D5DB",
      "--color-border": "#374151",
    },
  },

  "cyber-neon": {
    light: {
      "--color-primary": "#3B82F6",
      "--color-primary-50": "#EBF8FF",
      "--color-primary-100": "#DBEAFE",
      "--color-accent": "#8B5CF6",
      "--color-background": "#FAFAFA",
      "--color-surface": "#F5F5F5",
      "--color-text": "#1A202C",
      "--color-text-secondary": "#4A5568",
      "--color-border": "#E2E8F0",
    },
    dark: {
      "--color-primary": "#60A5FA",
      "--color-primary-50": "#1E3A8A",
      "--color-primary-100": "#1D4ED8",
      "--color-accent": "#A78BFA",
      "--color-background": "#0A0A0F",
      "--color-surface": "#1A1A2E",
      "--color-text": "#00FFFF",
      "--color-text-secondary": "#64FFDA",
      "--color-border": "#16213E",
    },
  },

  "midnight-aurora": {
    light: {
      "--color-primary": "#8B5CF6",
      "--color-primary-50": "#F3E8FF",
      "--color-primary-100": "#E9D5FF",
      "--color-accent": "#06B6D4",
      "--color-background": "#FFFFFF",
      "--color-surface": "#FAFAFA",
      "--color-text": "#2D3748",
      "--color-text-secondary": "#4A5568",
      "--color-border": "#E2E8F0",
    },
    dark: {
      "--color-primary": "#C084FC",
      "--color-primary-50": "#581C87",
      "--color-primary-100": "#6B21A8",
      "--color-accent": "#22D3EE",
      "--color-background": "#0D1117",
      "--color-surface": "#161B22",
      "--color-text": "#F0F6FC",
      "--color-text-secondary": "#7C3AED",
      "--color-border": "#30363D",
    },
  },

  "sage-terracotta": {
    light: {
      "--color-primary": "#84CC16",
      "--color-primary-50": "#F7FEE7",
      "--color-primary-100": "#ECFCCB",
      "--color-accent": "#EA580C",
      "--color-background": "#FFFEF7",
      "--color-surface": "#FEF7ED",
      "--color-text": "#365314",
      "--color-text-secondary": "#4D7C0F",
      "--color-border": "#D9F99D",
    },
    dark: {
      "--color-primary": "#A3E635",
      "--color-primary-50": "#365314",
      "--color-primary-100": "#4D7C0F",
      "--color-accent": "#FB923C",
      "--color-background": "#1A1A0F",
      "--color-surface": "#2A241A",
      "--color-text": "#F7FEE7",
      "--color-text-secondary": "#BEF264",
      "--color-border": "#65A30D",
    },
  },

  "sunset-gradient": {
    light: {
      "--color-primary": "#F59E0B",
      "--color-primary-50": "#FEF3C7",
      "--color-primary-100": "#FDE68A",
      "--color-accent": "#EF4444",
      "--color-background": "#FFFBF5",
      "--color-surface": "#FEF2E7",
      "--color-text": "#7C2D12",
      "--color-text-secondary": "#92400E",
      "--color-border": "#FED7AA",
    },
    dark: {
      "--color-primary": "#FBBF24",
      "--color-primary-50": "#78350F",
      "--color-primary-100": "#92400E",
      "--color-accent": "#F87171",
      "--color-background": "#1C1008",
      "--color-surface": "#2D1B08",
      "--color-text": "#FEF3C7",
      "--color-text-secondary": "#FBBF24",
      "--color-border": "#A16207",
    },
  },

  "monochrome-pop": {
    light: {
      "--color-primary": "#374151",
      "--color-primary-50": "#F9FAFB",
      "--color-primary-100": "#F3F4F6",
      "--color-accent": "#10B981",
      "--color-background": "#FFFFFF",
      "--color-surface": "#F3F4F6",
      "--color-text": "#111827",
      "--color-text-secondary": "#6B7280",
      "--color-border": "#D1D5DB",
    },
    dark: {
      "--color-primary": "#9CA3AF",
      "--color-primary-50": "#111827",
      "--color-primary-100": "#1F2937",
      "--color-accent": "#34D399",
      "--color-background": "#0F172A",
      "--color-surface": "#1E293B",
      "--color-text": "#F9FAFB",
      "--color-text-secondary": "#D1D5DB",
      "--color-border": "#374151",
    },
  },
};
