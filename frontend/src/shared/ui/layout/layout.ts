export type LayoutSize = "compact" | "regular";

export type LayoutInfo = {
  width: number;
  size: LayoutSize;
  gutter: number;
};

export function layoutFor(width: number): LayoutInfo {
  if (width < 360) {
    return {
      width,
      size: "compact",
      gutter: 12,
    };
  }

  return {
    width,
    size: "regular",
    gutter: 16,
  };
}
