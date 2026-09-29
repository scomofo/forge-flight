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
      "A survey crew marks one corner 40 m east and 30 m north of a benchmark, then another 25 m west and 10 m north of that. If you want the straight-line displacement, adding the distances walked is not enough. || A vector has both magnitude and direction. Once you choose perpendicular axes, you can describe it with two signed components: x = |v|cosθ and y = |v|sinθ. Change the axes and the component numbers change, but the vector itself does not. || Components are useful because they turn geometry into ordinary arithmetic. Add the x-components, add the y-components, and then rebuild the magnitude and direction at the end.",
    use: "Whenever vectors must be combined — forces on a bracket, a boat in a current, displacements on a map — or when only the part of a vector along some direction matters. || Write each vector as (x, y). Add component-wise: R = (Ax+Bx, Ay+By). Recover magnitude |R| = √(Rx² + Ry²) and direction θ = atan2(Ry, Rx). For the part of A along B, take A·B = AxBx + AyBy = |A||B|cosφ and divide by |B|. || Stop when you can state the result as magnitude and direction in the frame the problem uses. Never add magnitudes unless the vectors are parallel — the sum of the lengths is only an upper bound.",
    example:
      "Two tugs pull a barge: F₁ = 5.0 kN at 30° above the dock axis, F₂ = 3.0 kN at 20° below it. Resultant? || F₁ = (5cos30°, 5sin30°) = (4.33, 2.50) kN. F₂ = (3cos(−20°), 3sin(−20°)) = (2.82, −1.03) kN. Sum: R = (7.15, 1.47) kN. |R| = √(7.15² + 1.47²) = 7.30 kN, at θ = atan2(1.47, 7.15) = 11.6° above the dock. The projection of F₁ onto the dock direction is F₁·x̂ = 4.33 kN. || The barge feels 7.30 kN at 11.6° — well under the 8.0 kN the magnitudes sum to, because the vertical parts partly cancel. That cancellation is the entire reason components exist.",
    ideas: [
      {
        heading: "Choose axes that make the problem easier",
        body: "The same vector can have different components in different coordinate systems. That is expected. Its magnitude and the angles between vectors do not change. If a ramp or cable suggests a more convenient axis direction, use it. A good coordinate choice can remove half the algebra.",
        formula: "Ax = |A|cosθ,  Ay = |A|sinθ",
      },
      {
        heading: "Add components, not magnitudes",
        body: "If two vectors point in different directions, adding their magnitudes is usually wrong. A 3-block east move followed by 4 blocks north gives a 5-block displacement, not 7. Add the components first, then calculate the resultant magnitude.",
        formula: "|A + B| ≤ |A| + |B|",
      },
      {
        heading: "The dot product measures alignment",
        body: "The dot product tells you how strongly two vectors line up. If they are parallel, the value is largest; if they are perpendicular, it is zero. In work, F·d keeps only the part of the force along the displacement, which is exactly the component that can change the object's kinetic energy.",
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
      "Suppose a van's GPS records position once per second. From that position log, you can work out when the van was moving quickly, when it slowed down, and how far it travelled over a time interval. || Velocity is the slope of a position-time graph. Acceleration is the slope of a velocity-time graph. Going the other way, the signed area under a velocity-time graph gives displacement. || The main skill is translating between the graphs. Read the axes first, then ask whether the question wants a slope, an area, or simply a value from the graph.",
    use: "Whenever motion is recorded or plotted — lab sensors, telemetry, timestamped video. || Average velocity between samples: Δx/Δt, the secant slope. Instantaneous velocity from samples: the central difference (x[i+1]−x[i−1])/(t[i+1]−t[i−1]) — it centers the estimate instead of attributing one interval's slope to its endpoint. Displacement: area under v–t, by geometry for straight segments. Curvature of x–t: concave up means a > 0, concave down a < 0, straight means a = 0. || Stop when you can narrate the motion — 'cruised, then braked, then waited' — and back every verb with a slope or an area.",
    example:
      "A cart's position is logged: t = 0, 1, 2, 3 s → x = 0, 2.0, 8.0, 18.0 m. What happened? || Central-difference velocities: v(1) = (8−0)/2 = 4 m/s, v(2) = (18−2)/2 = 8 m/s. The v–t slope is (8−4)/(2−1) = 4 m/s² — constant acceleration. Displacement from t = 1 to t = 3 is the area under v–t: with v(3) ≈ 12 m/s the trapezoid gives (4+12)/2 × 2 = 16 m, matching x(3) − x(1) = 16 m. || Steady 4 m/s² acceleration. The consistency check is the point: the area under the derived v–t must return the measured displacement. When it doesn't, your velocities are wrong — not the geometry.",
    ideas: [
      {
        heading: "Read the axes before reading the slope",
        body: "Slope means change in the vertical quantity per change in the horizontal quantity. On x–t that is velocity; on v–t it is acceleration. A flat position-time line means the object is at rest. A flat velocity-time line means constant velocity.",
        formula: "v = dx/dt,   a = dv/dt",
      },
      {
        heading: "Area under v–t gives displacement",
        body: "Velocity multiplied by time has units of distance, which is why area under a velocity-time graph gives displacement. Areas below the time axis count negative, so an out-and-back trip can have zero net displacement even though the object travelled a substantial distance.",
        formula: "Δx = area under v–t (signed)",
      },
      {
        heading: "Curvature tells you whether velocity is changing",
        body: "A straight position-time graph has constant slope, so the velocity is constant. If the graph bends, the slope is changing and the object is accelerating. The direction of the bend tells you the sign of that acceleration.",
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
      "For constant acceleration, the velocity-time graph is a straight line. That picture is enough to build the standard equations instead of memorizing them cold. || The line starts at v₀ and has slope a, so v = v₀ + at. The area under it is a rectangle plus a triangle: v₀t + ½at², which gives the displacement. Eliminating time gives v² = v₀² + 2aΔx. || These equations are reliable when acceleration is constant. If the acceleration changes with speed, time, or position, switch tools rather than forcing these formulas to fit.",
    use: "Falling bodies, cars braking at steady deceleration, any motion with constant a — and projectiles, which are two such motions at right angles. || Horizontal: no acceleration (drag ignored), so x = x₀ + v₀ₓt with v₀ₓ = v₀cosθ. Vertical: a = −g, so y = y₀ + v₀ᵧt − ½gt² with v₀ᵧ = v₀sinθ. Solve the vertical equation for the flight time, feed it to the horizontal one. Flat-ground range: R = v₀²sin2θ/g. || Stop when each axis has its own equation and time is the only variable they share. If acceleration isn't constant — drag, thrust curves — these equations are the wrong tool; integrate numerically instead.",
    example:
      "A ball launches at 20 m/s and 30° from level ground. Range? Max height? || v₀ₓ = 20cos30° = 17.3 m/s, v₀ᵧ = 20sin30° = 10.0 m/s. Vertical: 0 = 10t − 4.905t² gives flight time t = 2.04 s. Range: x = 17.3 × 2.04 = 35.3 m. Max height at t = v₀ᵧ/g = 1.02 s: y = 10(1.02) − 4.905(1.02)² = 5.10 m. Cross-check: R = v₀²sin60°/g = 400 × 0.866/9.81 = 35.3 m. || The axis-separated solution and the closed-form range agree — both came from the same straight line. When they disagree, suspect the algebra.",
    ideas: [
      {
        heading: "Derive them from the v–t graph",
        body: "For constant acceleration, the area under the v–t graph is a rectangle plus a triangle. That gives Δx = v₀t + ½at². The other familiar equations come from combining this with v = v₀ + at. If you can rebuild them from the graph, you are less likely to use them in the wrong situation.",
        formula: "Δx = v₀t + ½at²  (area under v–t)",
      },
      {
        heading: "Treat horizontal and vertical motion separately",
        body: "Without air resistance, gravity acts vertically, so the horizontal velocity stays constant while the vertical velocity changes. Solve the two directions separately and connect them with the same time variable. Air resistance breaks this clean separation because the drag depends on the total velocity.",
        formula: "x = v₀cosθ·t,   y = v₀sinθ·t − ½gt²",
      },
      {
        heading: "Check the assumptions behind the 45° rule",
        body: "The familiar 45° maximum-range result assumes equal launch and landing heights, no drag, and fixed launch speed. Change those conditions and the best angle changes too. Use the formula only when its assumptions match the problem.",
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
