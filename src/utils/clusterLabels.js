// Place headings near the actual bubble envelope, avoiding every bubble and
// previously placed heading. Dimensions are SVG units, not CSS pixels.
export function placeClusterLabels(nodes, labels, width, height) {
  const placed = [];
  const padding = 10;
  const overlaps = (rect, node) => {
    const x = Math.max(rect.x, Math.min(node.x, rect.x + rect.width));
    const y = Math.max(rect.y, Math.min(node.y, rect.y + rect.height));
    return Math.hypot(node.x - x, node.y - y) < node.r + padding;
  };
  for (const label of labels) {
    const members = nodes.filter(node => node.labelRegion === label.region);
    const left = members.length ? Math.min(...members.map(n => n.x - n.r)) : label.center.x;
    const right = members.length ? Math.max(...members.map(n => n.x + n.r)) : label.center.x;
    const top = members.length ? Math.min(...members.map(n => n.y - n.r)) : label.center.y;
    const bottom = members.length ? Math.max(...members.map(n => n.y + n.r)) : label.center.y;
    const centerX = (left + right) / 2;
    const candidates = [];
    // Above is preferred; a neighbouring cluster can require a side/below.
    for (let gap = 0; gap <= 120; gap += 24) {
      for (const shift of [0, -24, 24, -48, 48, -96, 96]) {
        candidates.push({ x: centerX - label.width / 2 + shift, y: top - label.height - padding - gap });
        candidates.push({ x: centerX - label.width / 2 + shift, y: bottom + padding + gap });
      }
      candidates.push({ x: left - label.width - padding - gap, y: (top + bottom - label.height) / 2 });
      candidates.push({ x: right + padding + gap, y: (top + bottom - label.height) / 2 });
    }
    const rects = candidates.map(pos => ({
      ...label,
      x: Math.max(6, Math.min(pos.x, width - label.width - 6)),
      y: Math.max(6, Math.min(pos.y, height - label.height - 6))
    }));
    const cost = rect => nodes.reduce((sum, node) => sum + Number(overlaps(rect, node)), 0) +
      placed.reduce((sum, other) => sum + (rect.x < other.x + other.width + padding && rect.x + rect.width + padding > other.x && rect.y < other.y + other.height + padding && rect.y + rect.height + padding > other.y ? 10 : 0), 0);
    let best = rects[0];
    let bestCost = Infinity;
    for (const rect of rects) {
      const score = cost(rect);
      if (score < bestCost) { best = rect; bestCost = score; }
      if (score === 0) break;
    }
    placed.push(best);
  }
  return placed;
}
