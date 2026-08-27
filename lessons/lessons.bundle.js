/* ============================================================
   Lesson bundle
   The overlay fetches lessons/<id>.json when it is served over
   http(s). Opened straight from disk (file://) it reads this
   file instead, so the kit works with zero setup.

   Keep both in sync: edit the JSON, then run
     node tools/build-lessons.cjs
   or edit here and run the same script with --from-bundle.
   ============================================================ */
window.MTD_LESSONS = {

  /* ---------------------------------------------------------- 1 */
  "unit-rate": {
    "series": "Math Through Discovery",
    "seriesLine": "Reality Check Series",
    "episode": "14",
    "subject": "Unit Rate",
    "topic": "Unit Rate",
    "title": "Reality Check",
    "subtitle": "What is the real hourly rate?",
    "headline": "Today we're finding the _real_ hourly pay.",
    "quote": "I worked all week and still felt broke.",
    "presenter": { "name": "Your host", "role": "Math Through Discovery" },
    "facts": [
      { "label": "Total pay", "value": "$1,200" },
      { "label": "Total hours worked", "value": "160", "highlight": true }
    ],
    "question": "What is the hourly rate?",
    "answer": { "work": "1200 / 160", "value": "= 7.50", "unit": "per hour" },
    "steps": {
      "see":       { "text": "Identify the important numbers.", "equation": "1200 \\;\\text{and}\\; 160", "annotation": "money and time" },
      "break":     { "text": "We're finding how much for 1 hour.", "equation": "160 \\text{ hrs} \\rightarrow 1 \\text{ hr}" },
      "build":     { "text": "Set up the division.", "equation": "1200 / 160" },
      "transform": { "text": "Make it easier to divide.", "equation": "120 / 16 = 7.5" },
      "check":     { "text": "Multiply to confirm.", "equation": "7.50 \\times 160 = 1200" }
    },
    "diagram": {
      "type": "unitRateTable",
      "quantityLabel": "Hours",
      "valueLabel": "Pay",
      "rows": [[160, "$1,200"], [1, "$7.50"]],
      "caption": "Unit rate compares everything to one hour"
    },
    "comparison": { "think": "I made good money.", "math": "{$7.50} per hour is the actual rate." },
    "takeaways": [
      "Big totals can be misleading.",
      "Unit rate compares everything to one unit.",
      { "text": "Always compare earnings to time.", "insight": true }
    ]
  },

  /* ---------------------------------------------------------- 2 */
  "percentages": {
    "episode": "9",
    "subject": "Percent",
    "topic": "Percentages",
    "title": "Reality Check",
    "subtitle": "How much did that 25% actually take?",
    "headline": "A small-sounding percent, a real dollar amount.",
    "quote": "25% isn't much. It's basically nothing.",
    "facts": [
      { "label": "Total amount", "value": "$800" },
      { "label": "Percent taken", "value": "25%", "highlight": true }
    ],
    "question": "How much was taken? How much is left?",
    "answer": { "work": "800 \\times 0.25", "value": "= 200", "unit": "taken" },
    "steps": {
      "see":       { "text": "Name the whole and the part.", "equation": "\\text{whole} = 800" },
      "break":     { "text": "Turn the percent into a piece.", "equation": "25\\% = 1/4 = 0.25" },
      "build":     { "text": "Take one quarter of the whole.", "equation": "800 / 4" },
      "transform": { "text": "Find what is left over.", "equation": "800 - 200 = 600" },
      "check":     { "text": "Put the pieces back together.", "equation": "200 + 600 = 800" }
    },
    "diagram": { "type": "percentBar", "percent": 25, "leftLabel": "$200 taken", "rightLabel": "$600 left", "of": "$800" },
    "comparison": { "think": "25% isn't much.", "math": "{$200} is gone. $600 is left." },
    "takeaways": [
      "A percent is a piece of a specific whole.",
      "The bigger the whole, the bigger the piece.",
      { "text": "Always ask: percent of what?", "insight": true }
    ]
  },

  /* ---------------------------------------------------------- 3 */
  "fractions": {
    "episode": "6",
    "subject": "Fractions",
    "topic": "Fractions",
    "title": "Same Value, New Form",
    "subtitle": "Why 1/2 and 3/6 are the same amount",
    "headline": "Different numbers. _Same_ amount.",
    "quote": "Three sixths has to be bigger. The numbers are bigger.",
    "facts": [
      { "label": "First share", "value": "1/2" },
      { "label": "Second share", "value": "3/6", "highlight": true }
    ],
    "question": "Which share is bigger?",
    "answer": { "work": "1/2", "value": "= 3/6", "unit": "same amount" },
    "steps": {
      "see":       { "text": "Two ways of cutting the same bar.", "equation": "1/2 \\;\\text{vs}\\; 3/6" },
      "break":     { "text": "Cut each half into three pieces.", "equation": "1/2 = 3/6" },
      "build":     { "text": "Multiply top and bottom by 3.", "equation": "\\frac{1 \\times 3}{2 \\times 3}" },
      "transform": { "text": "The form changed, the value did not.", "equation": "3/6 = 1/2" },
      "check":     { "text": "Line the bars up and compare.", "equation": "0.5 = 0.5" }
    },
    "diagram": {
      "type": "fractionBar",
      "rows": [
        { "label": "1/2", "denominator": 2, "shaded": 1 },
        { "label": "3/6", "denominator": 6, "shaded": 3 }
      ],
      "caption": "Same shaded length, different cuts"
    },
    "comparison": { "think": "Bigger numbers means more.", "math": "Both shares equal {half} the bar." },
    "takeaways": [
      "Equivalent fractions name the same amount.",
      "Multiplying top and bottom by the same number keeps the value.",
      { "text": "Compare the amount, not the digits.", "insight": true }
    ]
  },

  /* ---------------------------------------------------------- 4 */
  "multiplication": {
    "episode": "4",
    "subject": "Multiplication",
    "topic": "Multiplication",
    "title": "Break It To Build It",
    "subtitle": "14 × 13 without a calculator",
    "headline": "Hard problems are easy problems stacked together.",
    "quote": "I can't do that one in my head.",
    "facts": [
      { "label": "First number", "value": "14" },
      { "label": "Second number", "value": "13", "highlight": true }
    ],
    "question": "What is 14 × 13?",
    "answer": { "work": "14 \\times 13", "value": "= 182", "unit": "" },
    "steps": {
      "see":       { "text": "Two two-digit numbers.", "equation": "14 \\times 13" },
      "break":     { "text": "Split each into tens and ones.", "equation": "(10+4)(10+3)" },
      "build":     { "text": "Four easy rectangles.", "equation": "100 + 30 + 40 + 12" },
      "transform": { "text": "Add the pieces.", "equation": "170 + 12 = 182" },
      "check":     { "text": "Estimate to confirm.", "equation": "14 \\times 13 \\approx 182" }
    },
    "diagram": { "type": "areaModel", "rowParts": [10, 4], "colParts": [10, 3], "caption": "14 × 13 = 182" },
    "comparison": { "think": "That's too hard to do mentally.", "math": "Four small products: {182}." },
    "takeaways": [
      "Breaking apart keeps the value the same.",
      "Area models make multiplication visible.",
      { "text": "Every hard product is small products added.", "insight": true }
    ]
  },

  /* ---------------------------------------------------------- 5 */
  "algebra": {
    "episode": "21",
    "subject": "Algebra",
    "topic": "Algebra",
    "title": "Keep It Balanced",
    "subtitle": "Solving 2x + 3 = 11",
    "headline": "Whatever you do to one side, do to the _other_.",
    "quote": "Letters in math make no sense to me.",
    "facts": [
      { "label": "Equation", "value": "2x + 3 = 11" },
      { "label": "Unknown", "value": "x", "highlight": true }
    ],
    "question": "What value of x keeps both sides equal?",
    "answer": { "work": "2x + 3 = 11", "value": "x = 4", "unit": "" },
    "steps": {
      "see":       { "text": "Both sides weigh the same.", "equation": "2x + 3 = 11" },
      "break":     { "text": "The 3 is extra weight.", "equation": "-3 \\;\\text{both sides}" },
      "build":     { "text": "Remove it from both sides.", "equation": "2x = 8" },
      "transform": { "text": "Split into two equal groups.", "equation": "x = 8/2" },
      "check":     { "text": "Put the answer back in.", "equation": "2(4) + 3 = 11" }
    },
    "diagram": { "type": "balanceModel", "left": "2x + 3", "right": "11", "move": "Take 3 off both pans, then halve both pans." },
    "comparison": { "think": "The letter is the hard part.", "math": "x is just the {unknown weight}: x = 4." },
    "takeaways": [
      "An equation is a balanced scale.",
      "Equal moves on both sides keep it true.",
      { "text": "Checking your answer is part of solving.", "insight": true }
    ]
  },

  /* ---------------------------------------------------------- 6 */
  "number-sense": {
    "episode": "1",
    "subject": "Number Sense",
    "topic": "Number Sense",
    "title": "Close Enough To Catch It",
    "subtitle": "Estimating before you calculate",
    "headline": "Estimate first. Then you'll notice a wrong answer.",
    "quote": "The register said $87. That sounds about right.",
    "facts": [
      { "label": "Items", "value": "4 at about $9" },
      { "label": "Register total", "value": "$87", "highlight": true }
    ],
    "question": "Does the total make sense?",
    "answer": { "work": "4 \\times 9", "value": "\\approx 36", "unit": "expected" },
    "steps": {
      "see":       { "text": "Round each price to something friendly.", "equation": "8.75 \\approx 9" },
      "break":     { "text": "Four groups of about nine.", "equation": "4 \\times 9" },
      "build":     { "text": "Estimate the total.", "equation": "= 36" },
      "transform": { "text": "Compare with the receipt.", "equation": "87 \\gg 36" },
      "check":     { "text": "The total is far too high.", "equation": "87 - 36 = 51" }
    },
    "diagram": { "type": "numberLine", "min": 0, "max": 100, "ticks": 10, "marks": [{ "value": 36, "label": "expected" }, { "value": 87, "label": "charged", "color": "var(--c-error)" }] },
    "comparison": { "think": "The register is always right.", "math": "The estimate says about {$36}." },
    "takeaways": [
      "Estimating gives you a range to judge against.",
      "Rounding trades a little accuracy for a lot of speed.",
      { "text": "If the answer is far from your estimate, check it.", "insight": true }
    ]
  },

  /* ---------------------------------------------------------- 7 */
  "place-value": {
    "episode": "2",
    "subject": "Place Value",
    "topic": "Place Value",
    "title": "Where The Digit Sits",
    "subtitle": "Why 4 can mean 4, 40, or 400",
    "headline": "Position carries the value.",
    "quote": "A four is a four. It's the same number.",
    "facts": [
      { "label": "Number", "value": "462" },
      { "label": "Digit in question", "value": "4", "highlight": true }
    ],
    "question": "What is the 4 actually worth?",
    "answer": { "work": "400 + 60 + 2", "value": "= 462", "unit": "" },
    "steps": {
      "see":       { "text": "Three digits, three places.", "equation": "4\\,|\\,6\\,|\\,2" },
      "break":     { "text": "Give each digit its place.", "equation": "400,\\; 60,\\; 2" },
      "build":     { "text": "Write it as a sum.", "equation": "400 + 60 + 2" },
      "transform": { "text": "Each place is ten times the next.", "equation": "10 \\times 10 \\times 4" },
      "check":     { "text": "Add the parts back up.", "equation": "462" }
    },
    "diagram": { "type": "numberBond", "total": 462, "parts": [400, 60, 2], "caption": "Expanded form" },
    "comparison": { "think": "A 4 is always 4.", "math": "In 462 the 4 is worth {400}." },
    "takeaways": [
      "Place value is a multiplier, not decoration.",
      "Expanded form shows what each digit carries.",
      { "text": "Same digit. Different place. Different value.", "insight": true }
    ]
  },

  /* ---------------------------------------------------------- 8 */
  "addition": {
    "episode": "3",
    "subject": "Addition",
    "topic": "Addition",
    "title": "Make A Friendly Number",
    "subtitle": "Adding 68 + 27 in your head",
    "headline": "Move a little. Keep the total.",
    "quote": "I need paper for anything over twenty.",
    "facts": [
      { "label": "First amount", "value": "68" },
      { "label": "Second amount", "value": "27", "highlight": true }
    ],
    "question": "What is 68 + 27?",
    "answer": { "work": "68 + 27", "value": "= 95", "unit": "" },
    "steps": {
      "see":       { "text": "68 is close to 70.", "equation": "68 + 27" },
      "break":     { "text": "Take 2 from the 27.", "equation": "27 = 2 + 25" },
      "build":     { "text": "Give the 2 to the 68.", "equation": "70 + 25" },
      "transform": { "text": "Now it's easy.", "equation": "= 95" },
      "check":     { "text": "The total never moved.", "equation": "68 + 27 = 95" }
    },
    "diagram": { "type": "numberLine", "min": 60, "max": 100, "ticks": 8, "jump": { "from": 68, "to": 95, "label": "+27" }, "marks": [{ "value": 70, "label": "friendly" }] },
    "comparison": { "think": "Mental math is guessing.", "math": "Moving 2 across gives {95} exactly." },
    "takeaways": [
      "Compensation moves value without losing it.",
      "Friendly numbers end in 0.",
      { "text": "Same value. Different form.", "insight": true }
    ]
  },

  /* ---------------------------------------------------------- 9 */
  "subtraction": {
    "episode": "5",
    "subject": "Subtraction",
    "topic": "Subtraction",
    "title": "Count The Gap",
    "subtitle": "$50 minus a $32.75 bill",
    "headline": "Subtraction is the distance between two numbers.",
    "quote": "Borrowing across zeros always trips me up.",
    "facts": [
      { "label": "Cash", "value": "$50.00" },
      { "label": "Bill", "value": "$32.75", "highlight": true }
    ],
    "question": "How much change comes back?",
    "answer": { "work": "50 - 32.75", "value": "= 17.25", "unit": "change" },
    "steps": {
      "see":       { "text": "Two amounts, one gap.", "equation": "50 - 32.75" },
      "break":     { "text": "Count up to a friendly number.", "equation": "32.75 \\rightarrow 33" },
      "build":     { "text": "Then up to fifty.", "equation": "0.25 + 17" },
      "transform": { "text": "Add the hops together.", "equation": "= 17.25" },
      "check":     { "text": "Add change back to the bill.", "equation": "32.75 + 17.25 = 50" }
    },
    "diagram": { "type": "numberLine", "min": 32, "max": 50, "ticks": 9, "jump": { "from": 32.75, "to": 50, "label": "+17.25" }, "marks": [{ "value": 33, "label": "$33" }] },
    "comparison": { "think": "I have to borrow across the zeros.", "math": "Counting up gives {$17.25} with no borrowing." },
    "takeaways": [
      "Subtraction measures distance, not just removal.",
      "Counting up avoids regrouping entirely.",
      { "text": "Check by adding back.", "insight": true }
    ]
  },

  /* --------------------------------------------------------- 10 */
  "division": {
    "episode": "7",
    "subject": "Division",
    "topic": "Division",
    "title": "Share It Out",
    "subtitle": "Splitting a $144 bill four ways",
    "headline": "Division answers: how much for _one_?",
    "quote": "Just split it however, it's close enough.",
    "facts": [
      { "label": "Total bill", "value": "$144" },
      { "label": "People", "value": "4", "highlight": true }
    ],
    "question": "What does each person owe?",
    "answer": { "work": "144 / 4", "value": "= 36", "unit": "each" },
    "steps": {
      "see":       { "text": "One total, four equal shares.", "equation": "144 / 4" },
      "break":     { "text": "Split the total into easy parts.", "equation": "144 = 120 + 24" },
      "build":     { "text": "Divide each part.", "equation": "120/4 + 24/4" },
      "transform": { "text": "Add the shares.", "equation": "30 + 6 = 36" },
      "check":     { "text": "Multiply back.", "equation": "36 \\times 4 = 144" }
    },
    "diagram": { "type": "arrayModel", "rows": 4, "cols": 9, "caption": "4 equal rows" },
    "comparison": { "think": "Close enough is fine.", "math": "Exactly {$36} each, no one overpays." },
    "takeaways": [
      "Division splits a total into equal groups.",
      "Breaking the total apart makes it mental math.",
      { "text": "Multiplication is the check.", "insight": true }
    ]
  },

  /* --------------------------------------------------------- 11 */
  "decimals": {
    "episode": "8",
    "subject": "Decimals",
    "topic": "Decimals",
    "title": "Line Up The Places",
    "subtitle": "Why 0.7 is bigger than 0.65",
    "headline": "More digits does not mean more value.",
    "quote": "0.65 has more numbers, so it's bigger.",
    "facts": [
      { "label": "First price", "value": "$0.70" },
      { "label": "Second price", "value": "$0.65", "highlight": true }
    ],
    "question": "Which value is larger?",
    "answer": { "work": "0.70 \\;\\text{vs}\\; 0.65", "value": "0.70 > 0.65", "unit": "" },
    "steps": {
      "see":       { "text": "Compare place by place.", "equation": "0.7 \\;\\text{and}\\; 0.65" },
      "break":     { "text": "Give them the same number of places.", "equation": "0.7 = 0.70" },
      "build":     { "text": "Now compare hundredths.", "equation": "70 \\;\\text{vs}\\; 65" },
      "transform": { "text": "Read them as whole numbers.", "equation": "70 > 65" },
      "check":     { "text": "Check on a number line.", "equation": "0.70 > 0.65" }
    },
    "diagram": { "type": "numberLine", "min": 0.6, "max": 0.8, "ticks": 4, "marks": [{ "value": 0.65, "label": "0.65", "color": "var(--c-adjust)" }, { "value": 0.7, "label": "0.70", "color": "var(--c-correct)" }] },
    "comparison": { "think": "More digits means more money.", "math": "{0.70} is five hundredths more." },
    "takeaways": [
      "Decimal places have fixed values.",
      "Adding a zero changes the form, not the value.",
      { "text": "Compare the same place, not the digit count.", "insight": true }
    ]
  },

  /* --------------------------------------------------------- 12 */
  "ratio-proportion": {
    "episode": "12",
    "subject": "Ratio / Proportion",
    "topic": "Ratio & Proportion",
    "title": "Scale It Up",
    "subtitle": "A recipe for 4, cooking for 10",
    "headline": "Keep the relationship. Change the size.",
    "quote": "I'll just double it and add a little extra.",
    "facts": [
      { "label": "Recipe serves", "value": "4" },
      { "label": "Cups of rice", "value": "3" },
      { "label": "Guests coming", "value": "10", "highlight": true }
    ],
    "question": "How much rice for 10 servings?",
    "answer": { "work": "3 / 4", "value": "\\times 10 = 7.5", "unit": "cups" },
    "steps": {
      "see":       { "text": "3 cups goes with 4 servings.", "equation": "3 : 4" },
      "break":     { "text": "Find one serving first.", "equation": "3/4 = 0.75" },
      "build":     { "text": "Multiply by the new size.", "equation": "0.75 \\times 10" },
      "transform": { "text": "Read the result.", "equation": "= 7.5 \\text{ cups}" },
      "check":     { "text": "The ratio still holds.", "equation": "7.5 : 10 = 3 : 4" }
    },
    "diagram": { "type": "ratioTable", "columns": ["Servings", "Cups of rice"], "rows": [[4, 3], [1, 0.75], [10, 7.5]], "keyRow": 2, "caption": "Same ratio at every size" },
    "comparison": { "think": "Double it and guess.", "math": "{7.5 cups} keeps the ratio exact." },
    "takeaways": [
      "A ratio is a relationship, not a fixed amount.",
      "Finding one unit makes any scale easy.",
      { "text": "Scaling changes size, not proportion.", "insight": true }
    ]
  },

  /* --------------------------------------------------------- 13 */
  "integers": {
    "episode": "16",
    "subject": "Integers",
    "topic": "Integers",
    "title": "Below Zero Is Real",
    "subtitle": "An account at -$45",
    "headline": "Negative is a direction, not a mistake.",
    "quote": "It said negative forty-five, so I have nothing.",
    "facts": [
      { "label": "Account balance", "value": "-$45" },
      { "label": "Deposit", "value": "$60", "highlight": true }
    ],
    "question": "What is the balance after the deposit?",
    "answer": { "work": "-45 + 60", "value": "= 15", "unit": "" },
    "steps": {
      "see":       { "text": "Start below zero.", "equation": "-45" },
      "break":     { "text": "Part of the deposit fills the hole.", "equation": "60 = 45 + 15" },
      "build":     { "text": "Fill the hole first.", "equation": "-45 + 45 = 0" },
      "transform": { "text": "What is left goes above zero.", "equation": "0 + 15 = 15" },
      "check":     { "text": "Walk it on the number line.", "equation": "-45 + 60 = 15" }
    },
    "diagram": { "type": "numberLine", "min": -60, "max": 40, "ticks": 10, "jump": { "from": -45, "to": 15, "label": "+60" }, "marks": [{ "value": 0, "label": "zero" }] },
    "comparison": { "think": "Negative means I have zero.", "math": "It means owing {$45} before you gain anything." },
    "takeaways": [
      "Zero is a position, not the bottom.",
      "Adding a positive moves right on the line.",
      { "text": "Debt is a direction you can measure.", "insight": true }
    ]
  },

  /* --------------------------------------------------------- 14 */
  "exponents": {
    "episode": "18",
    "subject": "Exponents",
    "topic": "Exponents",
    "title": "Doubling Adds Up Fast",
    "subtitle": "One penny doubled for ten days",
    "headline": "Repeated multiplication is not repeated addition.",
    "quote": "A penny a day? That's nothing.",
    "facts": [
      { "label": "Starting amount", "value": "$0.01" },
      { "label": "Days doubling", "value": "10", "highlight": true }
    ],
    "question": "What is the amount on day 10?",
    "answer": { "work": "0.01 \\times 2^{10}", "value": "= 10.24", "unit": "dollars" },
    "steps": {
      "see":       { "text": "The same move, repeated.", "equation": "\\times 2 \\;\\text{each day}" },
      "break":     { "text": "Count the doublings, not the days.", "equation": "2^{10}" },
      "build":     { "text": "Write it as a power.", "equation": "0.01 \\times 2^{10}" },
      "transform": { "text": "2 to the tenth is 1024.", "equation": "0.01 \\times 1024" },
      "check":     { "text": "Read the result in dollars.", "equation": "= 10.24" }
    },
    "diagram": { "type": "barGraph", "data": [{ "label": "Day 1", "value": 1 }, { "label": "Day 4", "value": 8 }, { "label": "Day 7", "value": 64 }, { "label": "Day 10", "value": 512 }], "caption": "Pennies, day by day" },
    "comparison": { "think": "It stays tiny.", "math": "It reaches {$10.24} in ten days." },
    "takeaways": [
      "An exponent counts how many times you multiply.",
      "Growth by multiplying starts slow and turns steep.",
      { "text": "Small rates plus time change the picture.", "insight": true }
    ]
  },

  /* --------------------------------------------------------- 15 */
  "geometry": {
    "episode": "24",
    "subject": "Geometry",
    "topic": "Geometry",
    "title": "Measure Before You Buy",
    "subtitle": "Flooring for a 12 ft by 9 ft room",
    "headline": "Area is what you pay for.",
    "quote": "I'll just get about a hundred feet of flooring.",
    "facts": [
      { "label": "Room length", "value": "12 ft" },
      { "label": "Room width", "value": "9 ft" },
      { "label": "Price per sq ft", "value": "$3", "highlight": true }
    ],
    "question": "How much flooring, and what does it cost?",
    "answer": { "work": "12 \\times 9", "value": "= 108", "unit": "square feet" },
    "steps": {
      "see":       { "text": "A rectangle with two measurements.", "equation": "12 \\text{ ft} \\times 9 \\text{ ft}" },
      "break":     { "text": "Area is length times width.", "equation": "A = l \\times w" },
      "build":     { "text": "Substitute the numbers.", "equation": "A = 12 \\times 9" },
      "transform": { "text": "Multiply.", "equation": "A = 108 \\text{ sq ft}" },
      "check":     { "text": "Now find the cost.", "equation": "108 \\times 3 = 324" }
    },
    "diagram": { "type": "formulaBlock", "name": "Area of a rectangle", "formula": "A = l \\times w", "substitution": "A = 12 \\times 9 = 108 \\text{ sq ft}", "caption": "Then multiply by price per square foot" },
    "comparison": { "think": "About a hundred feet.", "math": "{108 sq ft} — and $324 at $3 a foot." },
    "takeaways": [
      "Area needs two dimensions, not one.",
      "Units tell you what you are counting.",
      { "text": "Measure first, buy once.", "insight": true }
    ]
  },

  /* --------------------------------------------------------- 16 */
  "budget-receipt": {
    "episode": "27",
    "subject": "Percent / Money",
    "topic": "Take-Home Pay",
    "title": "Reality Check",
    "subtitle": "Where did the paycheck go?",
    "headline": "Gross pay is not _take-home_ pay.",
    "quote": "They said the job pays two thousand a month.",
    "facts": [
      { "label": "Gross pay", "value": "$2,000" },
      { "label": "Deductions", "value": "22%", "highlight": true }
    ],
    "question": "What actually lands in the account?",
    "answer": { "work": "2000 \\times 0.78", "value": "= 1560", "unit": "take-home" },
    "steps": {
      "see":       { "text": "Start from the gross amount.", "equation": "2000" },
      "break":     { "text": "Deductions take 22 percent.", "equation": "0.22 \\times 2000" },
      "build":     { "text": "That is the amount removed.", "equation": "= 440" },
      "transform": { "text": "Subtract to find take-home.", "equation": "2000 - 440 = 1560" },
      "check":     { "text": "Or take 78 percent directly.", "equation": "0.78 \\times 2000 = 1560" }
    },
    "diagram": {
      "type": "receipt",
      "title": "Monthly pay",
      "rows": [
        { "label": "Gross pay", "value": "$2,000.00" },
        { "label": "Deductions (22%)", "value": "-$440.00", "minus": true },
        { "label": "Take-home", "value": "$1,560.00", "total": true }
      ]
    },
    "comparison": { "think": "I'm making two thousand a month.", "math": "{$1,560} is the number to budget with." },
    "takeaways": [
      "Percent off the top changes the whole plan.",
      "Budget from take-home, not the offer letter.",
      { "text": "Know the number that reaches your account.", "insight": true }
    ]
  }
};

/* Fill in shared defaults so each lesson file stays short. */
(function applyDefaults(all) {
  for (const [id, l] of Object.entries(all)) {
    l.id = id;
    l.series = l.series || 'Math Through Discovery';
    l.seriesLine = l.seriesLine || 'Reality Check Series';
    l.presenter = l.presenter || { name: 'Your host', role: 'Math Through Discovery' };
    l.philosophy = l.philosophy || 'See the pattern. Change the form. *Keep the value.*';
  }
})(window.MTD_LESSONS);
