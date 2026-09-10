/* ============================================================
   Small shared SVG helpers for the visual math models.
   Deliberately tiny - just the primitives that were duplicated
   between number line / number bond / place value. Not an
   abstraction layer.
   ============================================================ */

/** Round to 2 dp and drop trailing zeros: 2.50 -> "2.5", 7 -> "7". */
export const fmtNum = (v) => (Math.round(Number(v) * 100) / 100).toString();

/** A quadratic-bezier "hop" arc from x1 to x2 sitting on baseline y,
    rising `rise` px. Used for number-line jumps and regroup arrows. */
export function arcPath(x1, x2, y, rise = 52) {
  const mid = (x1 + x2) / 2;
  return `M${x1},${y} Q${mid},${y - rise} ${x2},${y}`;
}

/** Linear map from a value domain to a pixel range. */
export function linScale(domainMin, domainMax, rangeMin, rangeMax) {
  const d = (domainMax - domainMin) || 1;
  return (v) => rangeMin + ((v - domainMin) / d) * (rangeMax - rangeMin);
}

/** `count` evenly spaced values from min to max inclusive. */
export function tickValues(min, max, count) {
  const n = Math.max(1, count);
  return Array.from({ length: n + 1 }, (_, i) => min + (i * (max - min)) / n);
}
