# Creating a lesson

A lesson is one JSON file. It never mentions layout, colour or position.

## 1. Copy a starting point

```bash
cp lessons/unit-rate.json lessons/tip-percent.json
```

Then register it for offline/file:// use by adding the same object to
`lessons/lessons.bundle.js`. If you prefer to edit only the bundle, run:

```bash
node tools/build-lessons.cjs      # bundle → individual JSON files
```

Load it: `overlay.html?lesson=tip-percent`

## 2. The schema

```jsonc
{
  "episode": "14",
  "topic": "Unit Rate",              // shown in the topic tag
  "title": "Reality Check",          // the marker headline on the board
  "subtitle": "What is the real hourly rate?",
  "headline": "Today we're finding the _real_ hourly pay.",  // sticky note
  "quote": "I worked all week and still felt broke.",

  "facts": [                          // scenario numbers
    { "label": "Total pay", "value": "$1,200" },
    { "label": "Hours worked", "value": "160", "highlight": true }
  ],
  "question": "What is the hourly rate?",

  "answer": { "work": "1200 / 160", "value": "= 7.50", "unit": "per hour" },

  "steps": {
    "see":       { "text": "…", "equation": "…", "annotation": "…" },
    "break":     { "text": "…", "equation": "…" },
    "build":     { "text": "…", "equation": "…" },
    "transform": { "text": "…", "equation": "…" },
    "check":     { "text": "…", "equation": "…" }
  },

  "diagram": { "type": "unitRateTable", "...": "module options" },

  "comparison": { "think": "I made good money.", "math": "{$7.50} per hour is the actual rate." },

  "takeaways": [
    "Big totals can be misleading.",
    { "text": "Always compare earnings to time.", "insight": true }
  ],

  "stamp": "Reality check"           // optional stamp on the takeaway panel
}
```

Everything is optional except `topic`. Missing pieces are simply not drawn — a lesson
with no `quote` renders without the quote card and the layout closes the gap.

## 3. Text formatting

Inside `headline`, `comparison.math` and `takeaways`:

| You write | You get |
| --- | --- |
| `{7.50}` | yellow marker highlight behind the value |
| `_real_` | underline |
| `*keep the value*` | accent colour |

## 4. Writing math

Equations accept friendly plain text or LaTeX:

```
"1200 / 160"          →  stacked fraction
"7.50 × 160 = 1200"   →  proper multiplication sign
"2^10"                →  exponent
"sqrt(49)"            →  square root
"\\frac{1 \\times 3}{2 \\times 3}"  →  raw LaTeX when you want full control
```

Two rules: write numbers in equations without thousands separators (`1200`, not
`1,200` — put the formatted version in `facts` and `answer`), and use `\\text{…}` for
words inside an equation.

## 5. Diagram modules

Set `diagram.type` to one of these and add its options.

| Type | Key options |
| --- | --- |
| `numberBond` | `total`, `parts: []` |
| `fractionBar` | `rows: [{ label, denominator, shaded }]` |
| `percentBar` | `percent`, `leftLabel`, `rightLabel`, `of` |
| `numberLine` | `min`, `max`, `ticks`, `marks: [{value,label,color}]`, `jump: {from,to,label}` |
| `doubleNumberLine` | `top: {label, values[]}`, `bottom: {label, values[]}` |
| `arrayModel` | `rows`, `cols`, `split` |
| `areaModel` | `rowParts: []`, `colParts: []` |
| `ratioTable` | `columns: []`, `rows: [[]]`, `keyRow` |
| `unitRateTable` | `quantityLabel`, `valueLabel`, `rows: [[]]` |
| `balanceModel` | `left`, `right`, `relation`, `move` |
| `coordinateGraph` | `xMax`, `yMax`, `points: [{x,y,label}]`, `lines: [{from,to}]` |
| `barGraph` | `data: [{label, value, color}]` |
| `pieChart` | `data: [{label, value}]` |
| `receipt` | `title`, `rows: [{label, value, minus, total}]` |
| `formulaBlock` | `name`, `formula`, `substitution` |
| `equation` | `equation` |

Every module also accepts `caption`.

## 6. Adding a new diagram module

1. Write the function in `src/modules/diagrams.js`:

```js
export function StackedBlocks(spec = {}) {
  return wrap(spec.caption, /* … build DOM or SVG … */);
}
```

2. Register it:

```js
export const DIAGRAMS = { …, stackedBlocks: StackedBlocks };
```

That is all. It appears in the control panel dropdown, works in every preset, and any
lesson can call it with `"diagram": { "type": "stackedBlocks" }`.

Guidelines: take all sizing from `viewBox`, never fixed pixels; pull colour from the
`C` map at the top of the file so re-skinning works; and add an animation class
(`anim-fade`, `anim-grow`, `branch-draw`) rather than a bespoke keyframe.

## 7. Changing layout without touching the lesson

`?preset=` picks the arrangement, `?aspect=` picks the canvas, `?hide=` removes layers.
A single lesson file feeds the 16:9 lesson, the vertical short and the square post.

## 8. Checklist before you record

- Read every step aloud — does the explanation match the equation beside it?
- Step through 0 → 5 in the control panel and watch for text that wraps oddly.
- Check the same lesson in `aspect=9x16`; shorten `takeaways` if they crowd.
- Run `npm test`.
