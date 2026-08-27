/* ============================================================
   Math rendering
   Uses KaTeX when it is loaded (see index/overlay <head>).
   If KaTeX is unavailable (offline machine, blocked CDN) it
   falls back to a small pretty-printer so nothing ever renders
   as raw LaTeX source on stream.
   ============================================================ */

import { el, esc } from './dom.js';

export const hasKatex = () => typeof window !== 'undefined' && !!window.katex;

/**
 * Render a math expression into an element.
 * Accepts LaTeX ("\frac{1200}{160}") or plain text ("1200 / 160 = 7.50").
 */
export function renderMath(expr, { display = false, className = '' } = {}) {
  const node = el('span', { class: `math ${className}` });
  if (expr === null || expr === undefined || expr === '') return node;
  const src = String(expr);

  if (hasKatex()) {
    try {
      window.katex.render(toLatex(src), node, {
        displayMode: display,
        throwOnError: false,
        strict: 'ignore',
        trust: false,
      });
      return node;
    } catch (_) { /* fall through to plain rendering */ }
  }
  node.innerHTML = prettyPlain(src);
  return node;
}

/** True if the string already looks like LaTeX. */
const looksLatex = (s) => /\\[a-zA-Z]+|[\^_]\{|\\frac|\\sqrt|\\times|\\div/.test(s);

/**
 * Convert friendly plain-text math into LaTeX.
 * Lesson authors can write "1200 / 160 = 7.50" or "3/4 + 1/2"
 * and still get proper stacked fractions.
 */
export function toLatex(s) {
  if (looksLatex(s)) return s;
  let out = String(s);
  out = out.replace(/\s*\|\|\s*/g, ' \\quad ');            // column break
  out = out.replace(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g, '\\frac{$1}{$2}');
  out = out.replace(/([A-Za-z0-9\)])\s*\^\s*([A-Za-z0-9]+)/g, '$1^{$2}');
  out = out.replace(/sqrt\(([^)]+)\)/gi, '\\sqrt{$1}');
  out = out.replace(/×|\bx\b(?=\s*\d)/g, '\\times ');
  out = out.replace(/÷/g, '\\div ');
  out = out.replace(/<=/g, '\\le ').replace(/>=/g, '\\ge ').replace(/!=/g, '\\ne ');
  out = out.replace(/\$/g, '\\$').replace(/%/g, '\\%');
  return out;
}

/** Fallback pretty-printer: real fraction bars via inline HTML, no LaTeX. */
export function prettyPlain(s) {
  let out = esc(String(s));
  out = out.replace(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g,
    '<span class="pf"><span class="pf__n">$1</span><span class="pf__d">$2</span></span>');
  out = out.replace(/\^\{?([A-Za-z0-9]+)\}?/g, '<sup>$1</sup>');
  out = out.replace(/\*/g, '×').replace(/&lt;=/g, '≤').replace(/&gt;=/g, '≥').replace(/!=/g, '≠');
  return out;
}

/** Injected once so the fallback renderer has styling. */
export function installFallbackStyles() {
  if (document.getElementById('mtd-math-fallback')) return;
  const css = `
  .pf{display:inline-flex;flex-direction:column;vertical-align:-0.5em;text-align:center;margin:0 .18em}
  .pf__n{border-bottom:2px solid currentColor;padding:0 .28em;line-height:1.12}
  .pf__d{padding:0 .28em;line-height:1.12}
  .math sup{font-size:.62em;vertical-align:super}`;
  const tag = document.createElement('style');
  tag.id = 'mtd-math-fallback';
  tag.textContent = css;
  document.head.appendChild(tag);
}
