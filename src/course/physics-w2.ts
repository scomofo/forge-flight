import type { Lesson } from "./types.ts";

/**
 * Physics 101, Week 2 — Vectors & kinematics.
 * Week 2 lessons, indices 4–6. Evidence due: motion
 * reconstruction from position-time data (lesson 2 bench) + projectile
 * prediction set (lesson 3 bench and checks).
 */
export const physicsW2Lessons: Lesson[] = [
  {
    id: "veccomp",
    track: "physics",
    index: 4,
    title: "Vectors by components",
    minutes: 35,
    lede: "Resolve any vector into components, add vectors component-wise, and use the dot product to project one vector onto another.",
    start:
      "A survey crew fixes a property corner at 40 m east and 30 m north of the benchmark, then a second corner 25 m west and 10 m north of the first. The deed needs the straight-line distance between the two corners, and '35 m of walking' is not the answer. || A vector is a magnitude plus a direction. Components are its shadows on chosen axes: pick perpendicular axes and the vector becomes two signed numbers — x = |v|cosθ, y = |v|sinθ, with θ measured from +x. The axes are your choice; the arrow does not care which way you drew them. || Components turn geometry into arithmetic. Adding arrows is a mess of parallelograms; adding components is 'add the x's, add the y's.' The dot product, which looks like a formula to memorize, becomes a one-line projection. The rule has this shape because perpendicular directions don't interfere — each axis minds its own business.",
    use: "Whenever vectors must be combined — forces on a bracket, a boat in a current, displacements on a map — or when only the part of a vector along some direction matters. || Write each vector as (x, y). Add component-wise: R = (Ax+Bx, Ay+By). Recover magnitude |R| = √(Rx² + Ry²) and direction θ = atan2(Ry, Rx). For the part of A along B, take A·B = AxBx + AyBy = |A||B|cosφ and divide by |B|. || Stop when you can state the result as magnitude and direction in the frame the problem uses. Never add magnitudes unless the vectors are parallel — the sum of the lengths is only an upper bound.",
    example:
      "Two tugs pull a barge: F₁ = 5.0 kN at 30° above the dock axis, F₂ = 3.0 kN at 20° below it. Resultant? || F₁ = (5cos30°, 5sin30°) = (4.33, 2.50) kN. F₂ = (3cos(−20°), 3sin(−20°)) = (2.82, −1.03) kN. Sum: R = (7.15, 1.47) kN. |R| = √(7.15² + 1.47²) = 7.30 kN, at θ = atan2(1.47, 7.15) = 11.6° above the dock. The projection of F₁ onto the dock direction is F₁·x̂ = 4.33 kN. || The barge feels 7.30 kN at 11.6° — well under the 8.0 kN the magnitudes sum to, because the vertical parts partly cancel. That cancellation is the entire reason components exist.",
    ideas: [
      {
        heading: "Components are a choice of axes",
        body: "The same arrow has different components in different frames, and that is fine — components describe your coordinate system as much as the vector. What never changes: the magnitude, the angle between two vectors, and any dot product. When a problem hands you an awkward angle, rotate your axes; putting x along the ramp instead of along the page is standard practice, not cheating. The physics lives in the arrows; components are the bookkeeping.",
        formula: "Ax = |A|cosθ,  Ay = |A|sinθ",
      },
      {
        heading: "Addition is component-wise; the triangle inequality is the guardrail",
        body: "|A + B| ≤ |A| + |B|, with equality only when A and B point the same way. Walk 3 blocks east and 4 north and you are 5 blocks displaced, not 7: components (3, 4) give √(9 + 16) = 5. Every time you are tempted to add magnitudes, check the directions first. If they differ, you need components.",
        formula: "|A + B| ≤ |A| + |B|",
      },
      {
        heading: "The dot product is a projection machine",
        body: "A·B = |A||B|cosφ answers 'how much of A lies along B?' Divide by |B| and you have the signed length of A's shadow on B. This is not abstract: work is F·d — only the force along the displacement counts. A force perpendicular to the motion does no work, which is why the normal force never changes a sliding block's speed.",
        formula: "A·B = AxBx + AyBy = |A||B|cosφ",
      },
    ],
    bench: "vectors",
    prompt:
      "Set A and B so the resultant points due east with magnitude exactly 5. || The bright arrow is A + B — watch |A| + |B| stay above 5 unless the pale arrows align. || Then point the resultant due north without changing either magnitude, and say which components you moved.",
    note: "The bench draws in the page's frame: +x right, +y up, angles counterclockwise from +x. The physics is identical in any frame — only the component numbers change.",
    checks: [
      {
        prompt: "A = (3, 4) and B = (−3, 4). |A + B| is…",
        options: ["8", "10", "6", "√73"],
        answer: 0,
        why: "Add components: (3−3, 4+4) = (0, 8), magnitude 8. Adding magnitudes gives 5 + 5 = 10 — the triangle-inequality ceiling, wrong here because the x-parts cancel.",
      },
      {
        prompt: "A 10 N force acts at 60° to the displacement. The work done per meter is…",
        options: ["10 J", "5 J", "8.66 J", "0 J"],
        answer: 1,
        why: "Only the component along the displacement works: 10cos60° = 5 N, so 5 J per meter. The perpendicular 8.66 N does nothing.",
      },
      {
        prompt: "|A| = |B| = 1 and A·B = 0. The vectors are…",
        options: ["Parallel", "Perpendicular", "Opposite", "Equal"],
        answer: 1,
        why: "A·B = |A||B|cosφ = 0 with nonzero magnitudes forces cosφ = 0, so φ = 90°.",
      },
      {
        prompt: "You rotate your coordinate axes by 20°. A vector's…",
        options: [
          "Components change; its magnitude does not",
          "Components and magnitude both stay the same",
          "Magnitude changes; components do not",
          "Dot products with other vectors change",
        ],
        answer: 0,
        why: "Components describe the arrow relative to your axes — new axes, new numbers. Magnitude, dot products, and angles between vectors are frame-independent.",
      },
    ],
  },
  {
    id: "kingraphs",
    track: "physics",
    index: 5,
    title: "Reading motion graphs",
    minutes: 35,
    lede: "Read velocity as the slope of a position–time graph, acceleration as the slope of velocity–time, and displacement as the signed area under velocity–time.",
    start:
      "A delivery van's GPS logs its position every second. The dispatcher doesn't care where it was — she wants to know when it was speeding and whether it braked before the intersection. The position log contains both answers, but only if you know how to read it. || Velocity is the rate position changes: the slope of the x–t graph. Acceleration is the rate velocity changes: the slope of the v–t graph. Going the other way, displacement is the area under v–t — velocity accumulated over time. Slope differentiates; area integrates. || One dataset, three graphs, each answering a different question: x–t says where, v–t says how fast, a–t says how the fast is changing. Translate fluently between them and you can read the motion straight off a table of numbers.",
    use: "Whenever motion is recorded or plotted — lab sensors, telemetry, timestamped video. || Average velocity between samples: Δx/Δt, the secant slope. Instantaneous velocity from samples: the central difference (x[i+1]−x[i−1])/(t[i+1]−t[i−1]) — it centers the estimate instead of attributing one interval's slope to its endpoint. Displacement: area under v–t, by geometry for straight segments. Curvature of x–t: concave up means a > 0, concave down a < 0, straight means a = 0. || Stop when you can narrate the motion — 'cruised, then braked, then waited' — and back every verb with a slope or an area.",
    example:
      "A cart's position is logged: t = 0, 1, 2, 3 s → x = 0, 2.0, 8.0, 18.0 m. What happened? || Central-difference velocities: v(1) = (8−0)/2 = 4 m/s, v(2) = (18−2)/2 = 8 m/s. The v–t slope is (8−4)/(2−1) = 4 m/s² — constant acceleration. Displacement from t = 1 to t = 3 is the area under v–t: with v(3) ≈ 12 m/s the trapezoid gives (4+12)/2 × 2 = 16 m, matching x(3) − x(1) = 16 m. || Steady 4 m/s² acceleration. The consistency check is the point: the area under the derived v–t must return the measured displacement. When it doesn't, your velocities are wrong — not the geometry.",
    ideas: [
      {
        heading: "Slope is a rate; the axes decide which",
        body: "On x–t, slope is velocity. On v–t, slope is acceleration. Same geometric operation, different physical meaning — the axes do the work. Steeper x–t means faster; steeper v–t means harder acceleration. Flat x–t is rest; flat v–t is cruise.",
        formula: "v = dx/dt,   a = dv/dt",
      },
      {
        heading: "Area under v–t is displacement — signed",
        body: "Each strip of the v–t graph is velocity × time, and strips below the axis subtract: the area is net displacement, not total path. A trip out and back encloses zero net area. For straight-line v–t segments the area is trapezoids and triangles — no calculus required, though this is exactly what an integral computes.",
        formula: "Δx = area under v–t (signed)",
      },
      {
        heading: "Curvature of x–t is acceleration's signature",
        body: "Constant velocity draws a straight x–t line. Speeding up bends it concave-up in the direction of motion; slowing down bends it the other way. You can diagnose acceleration from the shape of the position graph alone — which is precisely what the reconstruction bench asks you to do with real numbers.",
        formula: "x–t straight ⟺ a = 0",
      },
    ],
    bench: "motionrecon",
    prompt:
      "Open the cart's position log. || Compute the interval velocities by finite differences, then mark which intervals are cruise and which are thrust. || Fit the thrust segment's acceleration and check your reconstruction against the fitted curve.",
    note: "The log carries ±2 cm of sensor jitter — real data is never clean. Finite differences amplify noise, which is why the fit uses every thrust sample at once instead of two noisy endpoints.",
    checks: [
      {
        prompt: "An x–t graph is a straight line with positive slope. The motion is…",
        options: ["Constant positive velocity", "Accelerating", "At rest", "Constant negative velocity"],
        answer: 0,
        why: "Straight x–t means constant slope, and the slope of x–t is velocity. Positive slope: moving in +x at constant speed.",
      },
      {
        prompt: "A v–t graph forms a triangle above the axis from t = 0 to t = 4 s, peaking at 6 m/s. The displacement is…",
        options: ["24 m", "12 m", "6 m", "48 m"],
        answer: 1,
        why: "Area = ½ × base × height = ½ × 4 × 6 = 12 m. The triangle's area is the displacement.",
      },
      {
        prompt: "x–t is concave down while x is increasing. The object is…",
        options: ["Speeding up in +x", "Slowing down while moving +x", "Moving in −x", "At rest"],
        answer: 1,
        why: "Concave-down x–t means a negative second derivative: a < 0. Moving in +x with a < 0 is slowing down.",
      },
      {
        prompt: "Samples: x = 0, 3, 12 m at t = 0, 1, 2 s. The central-difference velocity at t = 1 s is…",
        options: ["6 m/s", "3 m/s", "7.5 m/s", "12 m/s"],
        answer: 0,
        why: "v(1) ≈ (x₂−x₀)/(t₂−t₀) = (12−0)/2 = 6 m/s. The forward difference (12−3)/1 = 9 m/s attributes the second interval's speed to t = 1; central difference centers the estimate.",
      },
    ],
  },
  {
    id: "projectiles",
    track: "physics",
    index: 6,
    title: "Constant acceleration and projectiles",
    minutes: 35,
    lede: "Derive the constant-acceleration equations from the geometry of the v–t graph, and solve projectile motion by treating the two axes as independent motions.",
    start:
      "Legend says Galileo dropped two balls from the Leaning Tower of Pisa. The legend is dubious; his inclined planes were the real instrument, slowing gravity enough to time with a water clock. What he found: distance goes as time squared. || With constant acceleration the v–t graph is a straight line from v₀ with slope a. Velocity at time t reads straight off: v = v₀ + at. Displacement is the area under that line — a rectangle v₀t plus a triangle ½at². That is the entire derivation: x = x₀ + v₀t + ½at². Eliminate t between the two and you get v² = v₀² + 2aΔx. || The three equations are one straight line and its area, written three ways. They hold exactly when a is constant — and they do not apply one step beyond that.",
    use: "Falling bodies, cars braking at steady deceleration, any motion with constant a — and projectiles, which are two such motions at right angles. || Horizontal: no acceleration (drag ignored), so x = x₀ + v₀ₓt with v₀ₓ = v₀cosθ. Vertical: a = −g, so y = y₀ + v₀ᵧt − ½gt² with v₀ᵧ = v₀sinθ. Solve the vertical equation for the flight time, feed it to the horizontal one. Flat-ground range: R = v₀²sin2θ/g. || Stop when each axis has its own equation and time is the only variable they share. If acceleration isn't constant — drag, thrust curves — these equations are the wrong tool; integrate numerically instead.",
    example:
      "A ball launches at 20 m/s and 30° from level ground. Range? Max height? || v₀ₓ = 20cos30° = 17.3 m/s, v₀ᵧ = 20sin30° = 10.0 m/s. Vertical: 0 = 10t − 4.905t² gives flight time t = 2.04 s. Range: x = 17.3 × 2.04 = 35.3 m. Max height at t = v₀ᵧ/g = 1.02 s: y = 10(1.02) − 4.905(1.02)² = 5.10 m. Cross-check: R = v₀²sin60°/g = 400 × 0.866/9.81 = 35.3 m. || The axis-separated solution and the closed-form range agree — both came from the same straight line. When they disagree, suspect the algebra.",
    ideas: [
      {
        heading: "The equations are areas, not incantations",
        body: "x = x₀ + v₀t + ½at² is a rectangle plus a triangle under the v–t line. v² = v₀² + 2aΔx is the same geometry with t eliminated. Deriving them takes ten seconds once you see the picture — and derivation is how you know exactly when they apply: constant a, full stop.",
        formula: "Δx = v₀t + ½at²  (area under v–t)",
      },
      {
        heading: "The axes are independent — gravity doesn't know about x",
        body: "The horizontal motion cruises at constant velocity while the vertical motion falls, and neither consults the other; time is their only shared variable. This separation is what makes projectile problems solvable by hand. It fails the moment drag appears, because drag couples the axes through the total speed.",
        formula: "x = v₀cosθ·t,   y = v₀sinθ·t − ½gt²",
      },
      {
        heading: "45° is optimal only under the fine print",
        body: "R = v₀²sin2θ/g peaks at θ = 45° — on flat ground, in vacuum, at fixed launch speed. Change any condition and the optimum moves: downhill targets favor shallower angles, drag punishes high slow arcs, shot-putters release above the ground and throw below 45°. The formula is exact; its assumptions are the part you must check.",
        formula: "R = v₀²sin2θ/g  (flat ground, no drag)",
      },
    ],
    bench: "projrange",
    prompt:
      "Pick a target downrange. || Choose launch speed and angle, read the predicted range, and fire. || Land within ±1.5 m in three tries or fewer — then say which equation did the aiming.",
    note: "Vacuum ballistics: no drag, flat range, g = 9.81 m/s². Real shells meet air; the range table ends where the drag model begins.",
    checks: [
      {
        prompt: "A car brakes from 20 m/s at a constant 5 m/s². The stopping distance is…",
        options: ["40 m", "20 m", "80 m", "50 m"],
        answer: 0,
        why: "v² = v₀² + 2aΔx with v = 0 and a = −5: 0 = 400 − 10Δx, so Δx = 40 m. Double the speed and this quadruples — the v² dependence.",
      },
      {
        prompt: "In projectile motion without drag, the horizontal velocity…",
        options: ["Stays constant", "Decreases steadily", "Increases steadily", "Is zero at the top"],
        answer: 0,
        why: "No horizontal force means no horizontal acceleration — aₓ = 0, so vₓ never changes. Only the vertical component falls at g.",
      },
      {
        prompt: "One ball is dropped, another fired horizontally from the same height. Which lands first?",
        options: ["Same time", "The dropped one", "The fired one", "Depends on the muzzle speed"],
        answer: 0,
        why: "The vertical motion is identical for both — same y₀, same v₀ᵧ = 0, same g. Horizontal velocity never enters the vertical equation.",
      },
      {
        prompt: "x = 5 + 3t − 2t² (SI units). The acceleration is…",
        options: ["−4 m/s²", "−2 m/s²", "3 m/s²", "−9.8 m/s²"],
        answer: 0,
        why: "Match x = x₀ + v₀t + ½at²: ½a = −2, so a = −4 m/s². The t² coefficient is half the acceleration — the classic slip.",
      },
    ],
  },
];
