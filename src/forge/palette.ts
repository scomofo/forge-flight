/** WebGL cannot read Tailwind classes. These match the --color-* tokens in styles.css. */
export const palette = {
  hangar: "#121410",
  panel: "#1c211c",
  bone: "#ebe6da",
  dust: "#9a9588",
  brass: "#d4923a",
  alarm: "#c4543e",
} as const;

/** Cividis-like stops: blue → gray → yellow. Chosen so deuteranopia does not collapse the scale into one hue. */
export const stressStops = ["#00224e", "#3d4c6b", "#7d7c78", "#c6b44a", "#fee838"] as const;

export function stressTint(t: number): string {
  const x = Math.min(1, Math.max(0, t));
  return mixHex(palette.bone, palette.alarm, x);
}

function mixHex(a: string, b: string, f: number): string {
  const pa = hexRgb(a);
  const pb = hexRgb(b);
  const c = pa.map((v, i) => Math.round(v + (pb[i]! - v) * f));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function hexRgb(hex: string): [number, number, number] {
  const n = hex.replace("#", "");
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}

/** Relative luminance, sRGB. */
export function relativeLuminance(hex: string): number {
  const lin = hexRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}
