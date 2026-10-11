// Radius starts at zero so visual area is proportional to market cap.
export function bubbleRadius(marketCap, isCrazy = false) {
  return Math.sqrt(Math.max(0, marketCap) / 3500) * (isCrazy ? 82 : 78);
}
