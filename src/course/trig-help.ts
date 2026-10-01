import type { ConceptHelp, ConceptHelpSection, ExampleContext, Idea } from "./types.ts";

export const TRIG_MEASUREMENT_NOTE = "Imperfect measurements. The bench supplies a 500 N pull and an exact angle so you can practise splitting the force into horizontal and vertical parts. On a real cable, you would measure the load and angle. An angle error changes the calculated components, even if the total pull is known. Correct arithmetic cannot repair an inaccurate input.";

/** Reused in optional reading help and in feedback only after a quiz answer. */
export const vectorResultantSections: ConceptHelpSection[] = [
  {
    heading: "1. Split each force, then add each direction",
    body: "Given: 500 N at 0° and 300 N at 60°, acting at the same point in this model. Take +x along the floor reference line (right on the diagram), and +y perpendicular to it in the same plane (up on the diagram). Both angles are measured from +x; use DEG mode for the trig.",
    table: {
      caption: "Two pulls resolved along the same axes",
      columns: ["Pull", "Right part, x (N)", "Up on diagram, y (N)"],
      rows: [
        ["500 N at 0°", "500 × cos 0° = 500", "500 × sin 0° = 0"],
        ["300 N at 60°", "300 × cos 60° = 150", "300 × sin 60° ≈ 259.8"],
        ["Total", "Rx = 650", "Ry ≈ 259.8 (about 260)"],
      ],
    },
  },
  {
    heading: "2. Rebuild the size of the single force",
    items: [
      "Rx and Ry are perpendicular components of the resultant R, so Pythagoras applies to these totals.",
      "R = √(Rx² + Ry²) = √(650² + (300 sin 60°)²) = 700 N. Keep the unrounded sine value during the calculation.",
      "Using the rounded vertical total, √(650² + 260²) ≈ 700.1 N, which still rounds to about 700 N. The small difference is rounding, not a different method.",
    ],
  },
  {
    heading: "3. Find its direction",
    items: [
      "Both totals are positive, so the force points right and up on the diagram. tan θ = Ry/Rx.",
      "In DEG mode, θ = tan⁻¹(259.8/650) ≈ 21.8° from +x toward +y. Here tan⁻¹ means inverse tangent (arctan), not 1/tan.",
      "The equivalent two-input form is atan2(Ry, Rx): y first, x second in common mathematical notation. It uses both signs to choose the correct quadrant. Check your calculator or software's argument order and output unit.",
      "JavaScript Math.atan2 returns radians. Multiply by 180/π for degrees; here about 0.3803 rad becomes 21.8°.",
    ],
  },
  {
    heading: "Why the other answers miss",
    items: [
      "800 N at 30° adds 500 + 300 and averages the angles. Adding magnitudes works only for pulls pointing the same way. These two do not oppose each other: their separation is 60°. They simply are not aligned, so their resultant is less than 800 N. Averaging angles is not the vector-addition rule.",
      "583 N comes from √(500² + 300²). That shortcut would require the original pulls to be perpendicular. They are 60° apart, not 90°.",
      "774 N at 11.2° swaps sine and cosine for the 300 N pull. It incorrectly assigns about 260 N to x and 150 N to y, giving totals near 760 N and 150 N.",
    ],
  },
];

/** Shared explanations; essential side names and unit choices also remain visible. */
export const trigConceptHelp: Record<string, ConceptHelp> = {
  "right-triangle-ratios": {
    trigger: "Work through the 30° brace",
    title: "Choose the ratio from the two sides",
    intro: "For a right triangle, first choose the acute angle θ (theta). Then name the sides relative to that angle. SOH-CAH-TOA is a reminder of the ratios, not a substitute for labeling the triangle.",
    sections: [
      {
        heading: "Name the sides",
        items: [
          "Hypotenuse (hyp): the longest side, opposite the 90° corner. It stays the hypotenuse whichever acute angle you choose.",
          "Opposite (opp): the side directly across from your chosen angle θ.",
          "Adjacent (adj): the side touching θ that is not the hypotenuse.",
          "Choose the other acute angle and opposite and adjacent swap. The hypotenuse does not.",
        ],
      },
      {
        heading: "Match the two sides",
        items: [
          "Opposite and hypotenuse: sin θ = opp/hyp (SOH).",
          "Adjacent and hypotenuse: cos θ = adj/hyp (CAH).",
          "Opposite and adjacent: tan θ = opp/adj (TOA).",
        ],
      },
      {
        heading: "Find the brace height",
        items: [
          "Given: the brace makes 30° with a level floor; horizontal run = 24 in. The height is perpendicular to the floor, making a right triangle. Use DEG mode for this angle.",
          "The 24 in run is adjacent to 30°. The unknown height h is opposite. Those two sides call for tangent.",
          "tan 30° = h/(24 in). Multiply both sides by 24 in: h = 24 in × tan 30°.",
          "tan 30° ≈ 0.57735, so h ≈ 13.9 in. The trig ratio has no units; inches come from the given run.",
        ],
      },
      {
        heading: "Find the brace length instead",
        items: [
          "Now the unknown is the hypotenuse H, so use adjacent/hypotenuse: cos 30° = (24 in)/H.",
          "Multiply both sides by H: H cos 30° = 24 in. Divide by cos 30°: H = 24 in / cos 30° ≈ 27.7 in.",
          "Check with unrounded values: √(24² + 13.8564²) ≈ 27.7128 in. The hypotenuse is longer than either leg.",
        ],
      },
    ],
    caution: "These side-ratio definitions apply to right triangles. Always identify the 90° corner and the chosen acute angle first. A drawing does not have to be horizontal for the ratios to work.",
  },
  radians: {
    trigger: "Why radians?",
    title: "A radian is one radius along the circle",
    intro: "Degrees and radians measure the same turn, just as inches and centimetres measure the same length. A full turn is 360° = 2π rad; half a turn is 180° = π rad. π (pi) is about 3.14159.",
    sections: [
      {
        heading: "What one radian means",
        body: "Imagine a flexible piece of string exactly one radius long. Lay it along the circle's edge, not straight across as a chord. The angle it spans at the centre is 1 radian, about 57.3°. The circumference is 2π radii long, so one full turn contains 2π radians, about 6.28.",
      },
      {
        heading: "Convert without changing the turn",
        items: [
          "Degrees to radians: θ(rad) = θ(deg) × π/180.",
          "90° × (π rad / 180°) = π/2 rad ≈ 1.57 rad.",
          "30° × (π rad / 180°) = π/6 rad ≈ 0.524 rad.",
          "Radians to degrees: θ(deg) = θ(rad) × 180/π. For example, (π/2) rad × (180° / π rad) = 90°.",
        ],
      },
      {
        heading: "Why the arc formula uses radians",
        body: "Let s be distance along the arc and r the radius, in the same length unit. A radian angle is defined by θ = s/r. Multiply by r to get s = rθ. That simple form therefore needs θ in radians. For θ in degrees, include the conversion: s = r × θ(deg) × π/180.",
      },
      {
        heading: "A quarter-turn of a wheel",
        items: [
          "Given: radius r = 10 in; turn θ = 90°. Convert the angle first: 90° = π/2 rad.",
          "Arc distance s = 10 × (π/2) = 5π in ≈ 15.7 in. Keep π/2 until the final calculation rather than rounding it early.",
          "Check: the circumference is 2π × 10 ≈ 62.8 in, and a quarter of it is about 15.7 in.",
          "This is distance along the rim. It also equals distance rolled along the ground only when the wheel rolls without slipping.",
        ],
      },
    ],
    caution: "Putting 90 directly into s = rθ treats it as 90 radians and gives 900 in, not a quarter-turn. Changing calculator mode does not convert a number in ordinary multiplication: convert the angle explicitly.",
  },
  "angle-measurement": {
    trigger: "What if the angle is a little wrong?",
    title: "How an angle error changes the components",
    intro: "The trig is exact for the values you enter. Real measurements are not exact, so the calculated components inherit that uncertainty.",
    sections: [
      {
        heading: "The bench teaches the splitting",
        body: "Decomposition means describing one angled pull as a horizontal part F cos θ and a vertical part F sin θ, with θ measured above horizontal. The bench gives you the input values; you are practising the calculation, not taking a measurement.",
      },
      {
        heading: "A two-degree measurement error",
        body: "Illustrative example: assume the total pull is known to be 1,000 lbf (pounds-force). You read the angle as 30° above horizontal, but the actual angle is 32°. The two angles are hypothetical inputs for comparison, not a claimed accuracy for an angle finder.",
        table: {
          caption: "Same 1,000 lbf pull, different angle inputs",
          columns: ["Angle above horizontal", "Vertical component: 1,000 × sin θ"],
          rows: [
            ["30° (assumed reading)", "500 lbf"],
            ["32° (actual angle in this example)", "529.9 lbf ≈ 530 lbf"],
          ],
        },
      },
      {
        heading: "Correct maths, inaccurate input",
        body: "Using 30° underestimates the vertical component by about 30 lbf here. The total pull stays at the assumed 1,000 lbf; the angle determines how much lies along each axis. The calculation can be correct while the input is inaccurate. The effect of an angle error depends on both the angle and the force, so 30 lbf is not a universal allowance.",
      },
      {
        heading: "Keep one thing fixed",
        body: "For this illustrative sensitivity check, hold the pull at 500 N and try 34°, 35° and 36° above horizontal. The one-degree change is chosen for demonstration; it is not a measured tolerance or a property of every cable.",
        table: {
          caption: "Same 500 N pull, three assumed angles",
          columns: ["Angle above horizontal", "Horizontal: 500 cos θ", "Vertical: 500 sin θ"],
          rows: [
            ["34°", "414.5 N", "279.6 N"],
            ["35°", "409.6 N", "286.8 N"],
            ["36°", "404.5 N", "293.9 N"],
          ],
        },
      },
      {
        heading: "Read the change",
        body: "Near 35°, changing the angle by 1° changes the horizontal component by about 5 N and the vertical component by about 7 N. A steeper pull has less horizontal force and more vertical force. The total magnitude is still the supplied 500 N; its direction and the split between the axes change.",
      },
      {
        heading: "Check geometry, then check the measurement",
        body: "Using unrounded components, √(Fx² + Fy²) returns 500 N at each angle. That checks the decomposition, but does not prove the measured angle was right. In the bench, try 34°, 35° and 36° with the angle control to see the sensitivity for yourself.",
      },
    ],
    caution: "For real work, measure or justify the uncertainty in both load and angle. This one-degree example does not establish a safe tolerance for hardware.",
  },
  "vector-resultant": {
    trigger: "Work through the two pulls",
    title: "Turn two pulls into one resultant",
    intro: "A resultant is one force with the same combined effect as the two forces in this point-force model. Resolve each pull along the same x and y axes, add those components, then rebuild the magnitude and direction.",
    sections: vectorResultantSections,
    caution: "The components are another way to describe the original forces, not additional forces. Adding magnitudes is valid only when the vectors point in the same direction. Keep unrounded values until the last step.",
  },
  "atan2-direction": {
    trigger: "What does atan2 mean?",
    title: "Find an angle from two signed components",
    intro: "atan2 uses both the vertical and horizontal components to find a direction. In the common atan2(y, x) notation, put the up/down component first and the right/left component second.",
    sections: [
      { heading: "This question stays in the first quadrant", body: "Rx = 650 N and Ry ≈ 259.8 N are both positive. A calculator in DEG mode can use tan⁻¹(259.8/650) ≈ 21.8°. This inverse tangent asks which angle has that ratio; it does not mean the reciprocal 1/tan." },
      { heading: "Why retain both signs?", body: "The pairs (x, y) = (650, 259.8) and (−650, −259.8) have the same y/x ratio but point in opposite directions. atan2 keeps the signs of both inputs, so it distinguishes them. It also handles a vertical vector where x = 0 and y is nonzero without dividing by zero." },
      { heading: "Check order and output units", body: "Some tools use a different argument order. In JavaScript, Math.atan2(y, x) returns radians, so multiply by 180/π to display degrees. A zero vector, with both components zero, has no direction even if software returns a number." },
    ],
  },
  "angle-unit-choice": {
    trigger: "Which calculator mode should I use?",
    title: "Match the angle unit to the calculation",
    intro: "Start with the unit on the angle, not a blanket rule about the subject. The same triangle can be solved in degrees or radians, provided the angle and calculator mode agree.",
    sections: [
      {
        heading: "Degrees are convenient for drawings and tools",
        body: "Use the degree values marked on shop drawings, saw settings, protractors and angle finders. For a triangle with a 35° angle, use DEG mode when evaluating sin(35), cos(35) or tan(35).",
      },
      {
        heading: "Radians are required by these formulas as written",
        items: [
          "s = rθ uses an angle θ in radians to find arc distance s from radius r.",
          "v = rω uses angular speed ω (omega) in rad/s to find tangential speed v. With r in metres, v is in m/s.",
          "For example, r = 2 m and ω = 90°/s: first convert ω to π/2 rad/s, then v = 2 × π/2 = π m/s ≈ 3.14 m/s.",
          "Follow any explicit unit convention in the formula or textbook. A degree-based version includes the appropriate conversion factor.",
        ],
      },
      {
        heading: "Same keys, different angles",
        items: [
          "DEG mode: sin(35) means sin 35° ≈ 0.574.",
          "RAD mode: sin(35) means sin of 35 radians ≈ −0.428. That is a valid result for 35 radians, but not for the 35° on the drawing.",
          "In RAD mode, enter sin(35 × π/180) to recover the same ≈ 0.574. Match the unit; neither mode is inherently wrong.",
        ],
      },
      {
        heading: "Multiplication alone is not the test",
        body: "Doubling a 30° angle gives 2 × 30° = 60°; (30°/s) × 2 s = 60° is valid too. Radians are needed in s = rθ and v = rω because of how those formulas are defined, not because every multiplication involving an angle demands radians.",
      },
    ],
    caution: "DEG/RAD controls how trig functions interpret angles. It does not attach or convert angle units in multiplication such as 10 × 90.",
  },
};

export const triangleSidesIdea: Idea = {
  heading: "Label the sides, then choose the ratio",
  body: "These three side ratios are for a right triangle. Pick an acute angle θ first. The hypotenuse is the longest side, across from the 90° corner. Opposite is directly across from θ; adjacent touches θ but is not the hypotenuse. Switch to the other acute angle and opposite and adjacent swap; the hypotenuse stays the same.",
  formula: "sin θ = opp/hyp,   cos θ = adj/hyp,   tan θ = opp/adj",
  formulaNote: "θ is theta, the angle you chose. opp = opposite; adj = adjacent; hyp = hypotenuse. SOH-CAH-TOA helps you remember which pair each ratio uses.",
  sections: [
    {
      heading: "Which two sides are involved?",
      body: "When the angle is known, identify the side you know and the side you want. Use the ratio containing exactly those two sides, then rearrange it to leave the unknown alone.",
      table: {
        caption: "Choose sine, cosine or tangent by the two sides",
        columns: ["Sides involved", "Ratio", "Memory aid"],
        rows: [
          ["Opposite and hypotenuse", "sin θ = opp/hyp", "SOH"],
          ["Adjacent and hypotenuse", "cos θ = adj/hyp", "CAH"],
          ["Opposite and adjacent", "tan θ = opp/adj", "TOA"],
        ],
      },
    },
  ],
  help: [{ concept: "right-triangle-ratios" }],
};

export const angleUnitsIdea: Idea = {
  heading: "Degrees and radians: which should I use?",
  body: "Both units measure a turn. Use degrees for drawings and tool settings, and DEG mode for trig with those degree angles. Radians work for triangle trig too when the input and RAD mode agree. For s = rθ, use θ in radians; for v = rω, use angular speed ω in rad/s. Follow the units the formula expects, not simply whether an angle gets multiplied.",
  formula: "π rad = 180°;   rad = deg × π/180;   deg = rad × 180/π",
  formulaNote: "π (pi) ≈ 3.14159. θ (theta) is an angle; ω (omega) is angular speed. s is arc distance, r is radius, and v is tangential speed. Calculator mode affects trig functions; it does not convert ordinary multiplication.",
  sections: [
    {
      heading: "The same turn in two units",
      table: {
        caption: "Degrees and radians describe the same turn",
        columns: ["Turn", "Degrees", "Radians"],
        rows: [
          ["Quarter-turn", "90°", "π/2 rad ≈ 1.57 rad"],
          ["Half-turn", "180°", "π rad ≈ 3.14 rad"],
          ["Full turn", "360°", "2π rad ≈ 6.28 rad"],
        ],
      },
    },
    {
      heading: "Check the unit before calculating",
      items: [
        "Triangle trig: sin 35° ≈ 0.574 in DEG mode. In RAD mode, use sin(35 × π/180) for that same angle.",
        "Arc distance: for a 10 in radius and a 90° turn, first use θ = π/2 rad; then s = 10 × π/2 ≈ 15.7 in.",
        "Multiplication is not a universal signal to convert: 2 × 30° = 60° is still valid. The required unit comes from the formula.",
      ],
    },
  ],
  help: [
    { concept: "radians", trigger: "What does one radian mean?" },
    { concept: "angle-unit-choice" },
  ],
};

export const triangleExampleContext: ExampleContext = {
  inputs: [
    { label: "Cable force (hypotenuse)", value: "500 N", origin: "Given", detail: "The full angled force, not either component." },
    { label: "Chosen angle θ (theta)", value: "35° above horizontal", origin: "Given", detail: "Horizontal Fx is adjacent; vertical Fy is opposite. The two component directions meet at 90°." },
    { label: "Calculator convention", value: "DEG for sin 35° and cos 35°", origin: "Given", detail: "In RAD mode, first convert 35° to 35 × π/180 rad. Both methods describe the same angle." },
  ],
  notes: ["Label the right triangle before calculating: the diagonal is the hypotenuse, the horizontal leg is adjacent to 35°, and the vertical leg is opposite.", `This model leaves out: ${TRIG_MEASUREMENT_NOTE}`],
};

export const vectorComponentsIdea: Idea = {
  heading: "Add rightward parts, then upward parts",
  body: "A resultant is the single force that replaces the combined pulls in this model. Choose the same x and y axes for every force, resolve each one, then add all x-components and all y-components separately. Keep their signs: left is negative x and down on the diagram is negative y. Pythagoras combines the perpendicular totals into the resultant magnitude.",
  formula: "Rx = ΣAx,   Ry = ΣAy,   R = √(Rx² + Ry²)",
  formulaNote: "R means resultant; Rx and Ry are its signed components. Σ (capital sigma) means add all the contributions along that axis. A here stands for each contributing vector. √ means square root. Components must use the same units and the same axes.",
  sections: [
    {
      heading: "Find a direction, not just a size",
      body: "When Rx and Ry are both positive, tan⁻¹(Ry/Rx) in DEG mode gives the angle above +x. Inverse tangent asks for an angle, not 1/tan. For other quadrants, a two-input atan2 function keeps both component signs; check its argument order and output units. A zero resultant has no direction.",
    },
  ],
  help: [{ concept: "vector-resultant" }, { concept: "atan2-direction" }],
};
