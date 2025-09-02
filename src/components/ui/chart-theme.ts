export const chartTheme = {
  colors: {
    primary: "hsl(var(--brand))",
    secondary: "hsl(var(--accent))", 
    success: "hsl(var(--success))",
    warning: "hsl(var(--warning))",
    danger: "hsl(var(--danger))",
    muted: "hsl(var(--muted))",
    surface: "hsl(var(--surface))",
  },
  grid: {
    stroke: "#E9EDF5",
    strokeWidth: 1,
  },
  bar: {
    radius: 6,
  },
  text: {
    fill: "hsl(var(--muted-foreground))",
    fontSize: 12,
  },
  tooltip: {
    contentStyle: {
      backgroundColor: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "12px",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    },
  },
  height: {
    default: 280,
    compact: 240,
    tall: 320,
  },
}