import { inline, help, p, list, table, practice, type LessonEnrichment } from './enrichment-types.ts';

/** Edited teaching content from the September 30 transcript; dialogue is excluded. */
export const physicsEnrichment: Record<string, LessonEnrichment> = {
  fermi: {
    sections: [
      inline('idea-0', 'Read the logarithmic ruler', p('Each step in the estimate is one defensible guess. On a logarithmic ruler, equal distances mean equal factors: 10 → 100 is the same step as 100 → 1,000. Build the estimate as a product and check which factor owns the uncertainty.')),
      help('idea-1', 'Why rough guesses can work', p('An overestimate in one independent factor can partly offset an underestimate in another. Cancellation is possible, not guaranteed; shared biases multiply together. Try a low and high estimate as well as your best guess.')),
      help('example', 'Air in a workshop', p('For a 30 × 20 × 6 m shop, volume is 3,600 m³, roughly 4,000 m³. Using a supplied air density of 1.2 kg/m³ gives 4,320 kg, roughly 5 tonnes at estimation precision.')),
    ],
    practice: practice('Estimate litres of fuel used by a city’s cars in one day. For a sample estimate, assume 100,000 cars, 30 km per car per day and 0.08 L/km. State which input you would investigate first.', 'Cars × km/day × L/km = 100,000 × 30 × 0.08 = 240,000 L/day. A range of 20–40 km/day gives 160,000–320,000 L/day with the other guesses held fixed. Investigate the factor with the widest credible range; the assumptions matter more than extra digits.'),
  },
  veccomp: {
    sections: [
      inline('opening', 'Finish the survey', p('Choose east as +x and north as +y. The total is (40 − 25, 30 + 10) = (15, 40) m. Its magnitude is √(15² + 40²) = 42.7 m and its direction is atan2(40, 15) = 69.4° north of east. If the crew walks each straight diagonal leg, the distance walked is 50 + √(25² + 10²) = 76.9 m; an axis-by-axis route would be 105 m. The route must be specified to determine distance.')),
      help('idea-0', 'Tilt the axes with the ramp', p('A 100 N weight on a 30° ramp resolves into 100 sin30° = 50 N along the ramp and 100 cos30° = 86.6 N into it. Label positive directions before assigning signs. Rotating your axes changes the components, not the force.')),
      help('idea-2', 'Projection as useful work', p('“How much points that way?” is the dot-product question. A 200 N rope at 30° to a 10 m displacement does W = 200 × 10 × cos30° = 1,732 J, about 1,730 J.')),
    ],
    practice: practice('A boat moves at 4 m/s north relative to the water. The current is 3 m/s east relative to the bank. Find the boat’s velocity relative to the bank.', 'Add the perpendicular components: (east, north) = (3, 4) m/s. Speed = √(3² + 4²) = 5 m/s. Angle east of north = tan⁻¹(3/4) = 36.9°.'),
  },
  kingraphs: {
    sections: [
      inline('idea-0', 'The slope and area ladder', table(['Graph', 'Slope gives', 'Signed area gives'], [['Position x vs time', 'Velocity', 'No standard motion variable'], ['Velocity v vs time', 'Acceleration', 'Displacement'], ['Acceleration a vs time', 'Rate of change of acceleration', 'Change in velocity']])),
      help('example', 'Central differences and a return journey', p('A central difference estimates the slope at a time using the readings on either side: v(t) ≈ [x(t + Δt) − x(t − Δt)]/(2Δt). A journey 50 m out and 50 m back has +50 and −50 m signed areas under v–t: zero displacement, but 100 m of distance. Upward curvature on x–t means velocity is increasing; downward curvature means it is decreasing.')),
    ],
    practice: practice('A forklift travels at 2 m/s for 4 s, then slows linearly to rest over 2 s. Find displacement and acceleration during braking.', 'Area under v–t = rectangle 2 × 4 + triangle ½ × 2 × 2 = 10 m. Braking acceleration = (0 − 2)/2 = −1 m/s².'),
  },
  projectiles: {
    sections: [
      inline('idea-0', 'Choose an equation by the missing variable', table(['Not needed', 'Constant-acceleration equation'], [['Time t', 'v² = v₀² + 2aΔx'], ['Final velocity v', 'Δx = v₀t + ½at²'], ['Displacement Δx', 'v = v₀ + at'], ['Acceleration a', 'Δx = ½(v₀ + v)t']])),
      help('example', 'Braking and symmetric flight', p('Stopping from 25 m/s at a constant −5 m/s² gives 0 = 25² − 10d, so d = 62.5 m. For a projectile returning to launch height without drag, the upward and downward times match. Since sin60° = sin120°, launches at 30° and 60° have equal range. The 45° maximum-range rule depends on equal landing height, fixed launch speed and no drag.')),
    ],
    practice: practice('A bolt rolls horizontally off a 1.2 m high bench at 2 m/s. Neglect drag and use g = 9.81 m/s². How far from the edge does it land?', 'Vertical fall: t = √(2 × 1.2/9.81) = 0.495 s. Horizontal distance = 2 × 0.495 = 0.99 m, about 1.0 m.'),
  },
  newton: {
    sections: [
      inline('idea-1', 'Choose the body before adding forces', p('For a 2,000 kg trailer accelerating at 1.5 m/s² with 300 N rolling resistance, hitch pull − 300 = 2,000 × 1.5, so hitch pull is 3,300 N. The force the trailer applies back to the truck belongs on the truck’s diagram. Third-law partners do not cancel on one body.')),
      help('idea-2', 'Which frame is the equation using?', p('The ordinary ΣF = ma equation uses an inertial frame, approximately the road frame for this exercise. An accelerating vehicle frame requires an additional inertial-force term. Name the frame before interpreting an acceleration.')),
    ],
    practice: practice('A hoist lifts a 500 kg engine. Use g = 9.81 m/s². Find cable tension during steady upward motion, then during upward acceleration of 1 m/s².', 'Steady speed means a = 0, so T = mg = 4,905 N. Accelerating upward: T − mg = ma, giving T = 500(9.81 + 1) = 5,405 N.'),
  },
  contact: {
    sections: [
      inline('idea-0', 'Normal force comes from the constraint', table(['No acceleration perpendicular to contact', 'Normal force'], [['Flat floor, weight only', 'N = mg'], ['Ramp at θ', 'N = mg cosθ'], ['Push downward with vertical component P', 'N = mg + P'], ['Pull upward with vertical component P', 'N = mg − P while contact remains']])),
      inline('idea-1', 'Static friction matches the demand', table(['Applied tangential demand', 'Static friction'], [['Zero', 'Zero'], ['Below μsN', 'Equal and opposite to demand'], ['At μsN', 'At the limiting value'], ['Above μsN', 'Cannot remain at rest; use the sliding model']])),
      help('example', 'Why the 20° block stays put', p('For the 5 kg block, downslope weight is 5 × 9.81 × sin20° = 16.8 N. The static limit is 0.40 × 5 × 9.81 × cos20° = 18.4 N. Friction supplies only 16.8 N, so it holds.')),
    ],
    practice: practice('Push a 20 kg box horizontally on a level floor. μs = 0.5, μk = 0.3, g = 9.81 m/s². What happens at 80 N and at 120 N?', 'N = 196.2 N and the static limit is 98.1 N. At 80 N it stays still with 80 N friction. At 120 N it slides: kinetic friction = 58.9 N, so a = (120 − 58.9)/20 = 3.06 m/s².'),
  },
  fbd: {
    sections: [
      inline('idea-0', 'A force needs an interacting body', table(['Interaction', 'Arrow on the chosen body'], [['Earth', 'Weight mg downward'], ['Contact surface', 'Normal, and friction if present'], ['Rope / spring', 'Tension / spring force'], ['Another applied push', 'Force in its actual direction'], ['“Motion”, “centripetal”, “ma”', 'Not extra forces; identify the interaction producing the net force']])),
      help('example', 'A crate pulled at an angle', p('Given 40 kg, a 200 N rope at 30° above horizontal, μk = 0.3 and g = 9.81 m/s²: N = 392.4 − 200 sin30° = 292.4 N. Friction = 87.7 N. Net horizontal force = 200 cos30° − 87.7 = 85.5 N, so a = 2.14 m/s². Ask “who pushes?” for every arrow.')),
    ],
    practice: practice('A rope parallel to a smooth 30° ramp holds a 10 kg box at rest. Find tension and normal force using g = 9.81 m/s².', 'Along the ramp: T = mg sin30° = 49.1 N. Perpendicular: N = mg cos30° = 85.0 N. Smooth means no friction arrow.'),
  },
  work: {
    sections: [
      inline('opening', 'Finish the tow-truck calculation', p('Supply a constant cable tension of 2,000 N for the 40 m tow at 20°. The cable’s work is 2,000 × 40 × cos20° = 75,175 J, about 75 kJ. This is work by the cable; finding net work also requires rolling resistance and any other forces doing work.')),
      inline('idea-0', 'Read the cosine before calculating', table(['Angle to displacement', 'Work'], [['0°', '+Fd'], ['90°', '0'], ['180°', '−Fd'], ['No displacement', '0 at any force']])),
      help('idea-1', 'Why braking distance grows with speed squared', p('With constant braking force, Fd = ½mv². For 1,500 kg and 7,500 N braking, 20 m/s requires 40 m; 40 m/s requires 160 m. Use work–energy for speed after a distance; use Newton and kinematics when acceleration or elapsed time is the main question.')),
    ],
    practice: practice('A 2 kg toolbox slides at 3 m/s. A constant 4 N friction force stops it. How far does it slide?', 'Initial kinetic energy = ½ × 2 × 3² = 9 J. Friction removes 4 J per metre, so d = 9/4 = 2.25 m.'),
  },
  potential: {
    sections: [
      inline('idea-0', 'Choose a datum, then track losses', p('The zero of gravitational potential is a choice; only m g Δh enters the energy balance. Gravity and ideal springs are conservative. Friction converts mechanical energy into heat, so include its work explicitly. Mass cancels from free-fall speed because both kinetic and gravitational energy contain the same m.')),
      help('example', 'Two energy extensions', p('Assume a 500 kg coaster drops 20 m from rest and loses 20 kJ to friction: ½mv² = mgh − 20,000, giving v = 17.7 m/s. An ideal spring with k = 800 N/m compressed 0.10 m stores 4 J. Launching a 0.050 kg mass vertically converts that to mgh, so the rise from release is 8.15 m, about 8.2 m.')),
    ],
    practice: practice('An ideal pendulum passes its lowest point at 2 m/s. How high above that point does it rise? Use g = 9.81 m/s².', '½mv² = mgh, so h = v²/(2g) = 4/19.62 = 0.204 m. Choose the lowest point as the datum.'),
  },
  power: {
    sections: [
      inline('idea-0', 'Power units and energy units', table(['Unit', 'Meaning'], [['W', '1 J/s'], ['kW', '1,000 W'], ['Mechanical hp', 'About 746 W'], ['kWh', '3.6 MJ of energy, not power']])),
      help('example', 'Tractor power and chained efficiency', p('A tractor pulling at 20 kN while moving 2 m/s delivers P = Fv = 40 kW, about 54 hp. Three stages at efficiencies 0.85, 0.90 and 0.95 deliver 0.85 × 0.90 × 0.95 = 0.727, about 73% overall. Halving the hoist time from 12 s to 6 s doubles useful power; at the same efficiency, its 800 W input becomes about 1,600 W.')),
    ],
    practice: practice('A conveyor lifts 50 kg bags by 2 m, ten bags per minute. Its motor draws 250 W. Find useful power and efficiency using g = 9.81 m/s².', 'Useful power = 50 × 9.81 × 2 × 10/60 = 163.5 W. Efficiency = 163.5/250 = 65.4%.'),
  },
  impulse: {
    sections: [
      help('idea-0', 'Spend more time stopping', p('Airbags, bent knees and energy-absorbing lanyards increase stopping time or distance, reducing average force for the same momentum change. A hammer does the reverse: 0.5 kg at 10 m/s stopped in 0.001 s gives 5,000 N average impact force.')),
      inline('idea-2', 'Rebound and peak force', p('A rebound to the same speed reverses velocity and doubles the momentum change compared with stopping. A triangular force–time pulse has peak force twice its average; other pulse shapes have different peak-to-average ratios.')),
    ],
    practice: practice('An 80 kg jumper lands at 4 m/s downward. Compare stopping in 0.02 s and 0.20 s. Calculate the average net stopping force, excluding body weight.', 'Momentum change is 80 × 4 = 320 N·s upward. Net stopping force is 320/0.02 = 16,000 N or 320/0.20 = 1,600 N. Average ground reaction would add mg ≈ 785 N in each case.'),
  },
  conserve: {
    sections: [
      inline('idea-0', 'The boundary chooses internal and external', table(['Chosen system', 'Internal', 'External'], [['Two skaters together', 'Their push on one another', 'Ice drag / Earth'], ['One skater', 'No partner force inside this boundary', 'Push from the other skater'], ['Both vehicles during a brief crash', 'Collision forces', 'Road impulse, often small during impact']])),
      help('example', 'Center of mass and recoil', p('For 70 kg at x = 0 and 50 kg at x = 3 m, xCM = (70 × 0 + 50 × 3)/120 = 1.25 m. A 4 kg rifle firing a 0.010 kg projectile at 800 m/s has about 2 m/s backward recoil if other impulses and propellant momentum are neglected. State the interval: total vehicle momentum may be approximately conserved during impact but not through the subsequent braking to rest.')),
    ],
    practice: practice('An 80 kg worker steps off a 40 kg boat initially at rest. The worker’s final speed is 2 m/s relative to the bank. Neglect horizontal external impulse. Find the boat’s speed.', '0 = 80 × 2 + 40v, so v = −4 m/s. The reference frame matters: 2 m/s relative to the boat would produce a different answer.'),
  },
  collisions: {
    sections: [
      help('example', 'Restitution between the two extremes', p('For the lesson’s 2 kg cart at 4 m/s striking a stationary 3 kg cart, take e = 0.5. Momentum gives 2v₁ + 3v₂ = 8; restitution gives v₂ − v₁ = 2. Thus v₁ = 0.4 and v₂ = 2.4 m/s. Final kinetic energy is 8.8 J of the original 16 J.')),
      inline('idea-1', 'A bounce test for restitution', p('Dropping from height H and rebounding to h gives e = √(h/H), if air drag is negligible and the floor is effectively stationary. Equal masses in an ideal one-dimensional elastic collision exchange velocities.')),
    ],
    practice: practice('A 1,000 kg loader moving at 2 m/s couples to a stationary 3,000 kg trailer. Neglect external impulse. Find final speed and kinetic energy lost.', 'Momentum gives v = 1,000 × 2/4,000 = 0.5 m/s. Initial energy = 2,000 J; final = ½ × 4,000 × 0.5² = 500 J. Loss = 1,500 J, or 75%.'),
  },
  torque: {
    sections: [
      help('example', 'The wrench, seesaw and rotating motor', p('At a perpendicular 400 N pull, the 110 N·m lug nut needs r = 110/400 = 0.275 m. 1 ft·lbf ≈ 1.356 N·m. A balanced seesaw satisfies F₁r₁ = F₂r₂. For rotation, P = τω: 300 N·m at 3,000 rpm gives ω = 314 rad/s and P ≈ 94 kW.')),
      inline('idea-2', 'Torque and energy share units but describe different things', p('Torque is a turning tendency about an axis. Work is the integral of torque through an angle in radians. Quoting N·m for torque and J for energy keeps the physical meanings visible.')),
    ],
    practice: practice('A seized bolt requires 300 N·m. You can apply 500 N perpendicular to a bar. What minimum lever arm does the calculation require?', 'r = τ/F = 300/500 = 0.60 m. An angled pull needs a longer lever for the same force. This calculation does not establish a tool’s load rating.'),
  },
  rotation: {
    sections: [
      inline('idea-0', 'Translate between straight and rotary motion', table(['Linear', 'Angular / connection'], [['x, v, a', 'θ, ω, α'], ['v', 'rω'], ['Tangential acceleration', 'rα'], ['F = ma', 'τ = Iα'], ['½mv²', '½Iω²']])),
      help('idea-2', 'Where the mass sits', p('For a rolling tractor tyre, rim speed relative to the axle is rω; without slipping this equals axle speed relative to the ground. Moving flywheel mass toward the rim raises I. A disk of radius 0.10 m has ICM = ½mr²; putting a parallel axle 0.20 m away gives I = ICM + md² = 9ICM.')),
    ],
    practice: practice('A solid grinder disk has mass 1 kg and radius 0.10 m. Apply a constant 0.5 N·m net torque from rest. Find inertia, acceleration, time to 300 rad/s and rim speed.', 'I = ½mr² = 0.005 kg·m². α = τ/I = 100 rad/s². t = 300/100 = 3 s. Rim speed = rω = 30 m/s.'),
  },
  equilibrium: {
    sections: [
      inline('opening', 'Finish the scaffold example', p('Supply a weightless 4 m plank supported at both ends and an 800 N painter 1 m from the left. Moments about the left support give 4RB = 800 × 1, so RB = 200 N; RA = 800 − 200 = 600 N. Plank weight would add its own reactions.')),
      inline('idea-1', 'What a support can supply', table(['Ideal support', 'Unknown reactions in a plane'], [['Roller', 'One force normal to the surface'], ['Pin', 'Two force components'], ['Fixed end', 'Two force components and a moment']])),
      help('example', 'Negative reactions and extra supports', p('A calculated negative reaction means the required force points opposite the arrow you assumed. Cargo behind a trailer axle can demand a downward hitch force; a contact that cannot pull may instead lift off. If reactions outnumber independent equilibrium equations, the structure is statically indeterminate: deformation compatibility and stiffness are also needed.')),
    ],
    practice: practice('A 3 m shelf rests at both ends. Its uniformly distributed weight is 150 N and a 300 N box sits 1 m from the left. Find the reactions.', 'Replace shelf weight by 150 N at its midpoint. 3RB = 150 × 1.5 + 300 × 1 = 525, so RB = 175 N. RA = 450 − 175 = 275 N.'),
  },
  elastic: {
    sections: [
      inline('idea-2', 'Stiffness and strength answer different questions', table(['Property', 'Question'], [['Young’s modulus E', 'How much elastic strain under this stress?'], ['Yield strength', 'When does permanent deformation begin?']]), p('1 MPa = 1 N/mm². High-strength steel can have much higher yield strength while keeping about the same E.')),
      help('example', 'The same rod in aluminium', p('Keeping the lesson’s 10 mm diameter, 2 m length and 15 kN load, but using E = 69 GPa, gives δ = FL/(AE) ≈ 5.54 mm. Stress is still about 191 MPa; changing E changed stretch, not F/A.')),
    ],
    practice: practice('A 12 mm diameter steel rod, 3 m long, carries 20 kN axially. Use E = 200 GPa. Find stress and elastic elongation.', 'A = π12²/4 = 113.1 mm². Stress = 20,000/113.1 = 176.8 MPa. δ = FL/(AE) = 20,000 × 3/(113.1×10⁻⁶ × 200×10⁹) = 2.65 mm.'),
  },
  bending: {
    sections: [
      inline('idea-2', 'Read the powers as design levers', table(['Change, other inputs fixed', 'Deflection multiplier'], [['Length ×k', 'k³'], ['Depth ×k at fixed width', '1/k³'], ['Width ×k at fixed depth', '1/k'], ['Modulus ×k', '1/k']])),
      help('idea-1', 'Why joists stand on edge', p('Rotating a 38 × 235 mm joist changes its I by (235/38)² ≈ 38×. Rotating the 25 × 2 mm ruler changes I by (25/2)² ≈ 156×. In a cantilever, the root’s outer fibres see the largest bending stress; a hole there removes material where it carries the most stress.')),
    ],
    practice: practice('A steel cantilever droops 4 mm. Predict droop if (a) its length becomes 1.5×, (b) its depth doubles at fixed width, or (c) E changes from 200 GPa to aluminium’s 69 GPa. Treat each change separately.', '(a) 4 × 1.5³ = 13.5 mm. (b) 4/2³ = 0.5 mm. (c) 4 × 200/69 = 11.6 mm. Recheck the small-deflection assumption after each change.'),
  },
  fos: {
    sections: [
      inline('idea-0', 'Name the failure mode behind the ratio', p('A yield-based factor does not also check buckling, fatigue, corrosion or a weak connection. Capacity and demand must refer to the same failure mode, geometry and condition.')),
      help('idea-1', 'Factors, ratings and prediction error', table(['Illustrative classroom choice', 'Factor'], [['Known static ductile load', 'Often around 1.5–2 in a specified exercise'], ['More uncertain load / capability', 'A larger justified factor'], ['Rigging', 'Use the applicable standard and manufacturer’s rated working-load limit']]), p('There is no universal safe factor for every application. For a prediction P and measurement M, report signed prediction error as 100(P − M)/M%; state that the measurement is the denominator.')),
    ],
    practice: practice('For a classroom calculation, a chain breaks at 60 kN and a factor of 4 is required. Compare its calculated working load with a 1,200 kg engine. Separately, find the axial load for a 10 mm rod with supplied yield 250 MPa and factor 3. Use g = 9.81 m/s².', 'Chain working load = 60/4 = 15 kN; engine weight = 11.77 kN, so the arithmetic clears. Real lifting uses the assembly’s marked WLL. Rod allowable = 250/3 MPa; load = (250/3) × π10²/4 = 6.54 kN.'),
  },
  pressure: {
    sections: [
      inline('idea-0', 'Pressure units and reference zero', table(['Unit / reference', 'Meaning'], [['1 psi', 'About 6.895 kPa'], ['1 bar', '100 kPa'], ['1 atm', '101.325 kPa'], ['Gauge pressure', 'Pressure above local atmosphere'], ['Absolute pressure', 'Gauge plus atmospheric pressure']])),
      help('example', 'Tyres and tank bottoms', p('A tyre reading 220 kPa gauge is about 321 kPa absolute at standard atmosphere. Ten metres of fresh water adds about 98 kPa. For a flat tank bottom 2 m² in area under 3 m of water, gauge force is ρghA = 58.9 kN, assuming atmospheric pressure cancels on the other side.')),
    ],
    practice: practice('A sealed 200 L drum has mass 20 kg. What is its maximum buoyancy when fully immersed in fresh water, and the limiting payload at neutral buoyancy? Use ρ = 1,000 kg/m³ and g = 9.81 m/s².', '200 L = 0.200 m³, so buoyancy = 1,000 × 9.81 × 0.200 = 1,962 N. It displaces 200 kg of water; subtracting the 20 kg drum leaves 180 kg. A floating payload with freeboard must be smaller.'),
  },
  movingfluids: {
    sections: [
      inline('idea-1', 'Bernoulli as an energy budget per volume', table(['Term', 'Energy associated with'], [['p', 'Pressure'], ['½ρv²', 'Motion'], ['ρgh', 'Elevation']]), p('Along a streamline in the stated ideal model, the sum stays constant.')),
      help('idea-1', 'Where the ideal budget stops', table(['Assumption', 'A case requiring more terms or another model'], [['Steady flow', 'Valve opening transient'], ['Incompressible fluid', 'Fast gas flow'], ['Negligible viscous loss', 'Long narrow pipe'], ['No pump/turbine work between points', 'A pump adds energy']]), p('A Venturi throat lowers pressure and can draw fuel into a carburetor or liquid into a sprayer eductor. For a large open tank draining through a small outlet h below the surface, equal atmospheric pressures and negligible surface speed give v = √(2gh). The equal-transit-time story for wing lift is false; Bernoulli describes the pressure field without requiring equal travel times.')),
    ],
    practice: practice('Water flows at 2 m/s through a 20 mm hose into a 5 mm nozzle. Neglect losses and height change; use ρ = 1,000 kg/m³. Find outlet speed, flow rate and ideal pressure drop.', 'Area ratio = (20/5)² = 16, so speed = 32 m/s. Q = π(0.020)²/4 × 2 = 0.000628 m³/s = 37.7 L/min. Δp = ½ × 1,000 × (32² − 2²) = 510 kPa. Real losses change the required supply pressure.'),
  },
  lift: {
    sections: [
      inline('idea-2', 'Read static margin by regime', table(['Static margin', 'Teaching-model interpretation'], [['Below 0', 'CG aft of neutral point; statically unstable'], ['Exactly 0', 'Neutral: no linear restoring tendency'], ['Above 0 to below 0.05', 'Positive static stability, below classroom target'], ['0.05–0.25 inclusive', 'Positive static stability, within classroom target'], ['Above 0.25', 'Positive static stability, above classroom target; trim and control authority not established']])),
      help('example', 'Finish the cruise balance', p('At the supplied 0.25 kg, S = 0.06 m² and ρ = 1.225 kg/m³, weight is 2.45 N. Holding CL = 0.6 needs v = √(2W/(ρSCL)) = 10.5 m/s. Holding 9 m/s instead needs CL = W/(½ρv²S) = 0.824. Stall is an angle-of-attack limit, not an engine stopping. Higher aspect ratio reduces induced drag at the same CL and efficiency.')),
      help('idea-0', 'Dynamic pressure rises with speed squared', table(['Speed with ρ = 1.225 kg/m³', 'q = ½ρv²'], [['5 m/s', '15.3 Pa'], ['10 m/s', '61.3 Pa'], ['20 m/s', '245 Pa']])),
    ],
    practice: practice('Keep S = 0.06 m², CLmax = 1.1 and ρ = 1.225 kg/m³. Double the glider mass from 0.25 to 0.50 kg. Also calculate static margin for NP = 0.30 m, chord = 0.12 m and CG at (a) 0.29 m, (b) 0.31 m.', 'Stall speed rises by √2: 7.79 × √2 = 11.0 m/s. SM(a) = (0.30 − 0.29)/0.12 = 0.083. SM(b) = −0.01/0.12 = −0.083, statically unstable.'),
  },
  shm: {
    sections: [
      inline('idea-2', 'Where the energy is during a cycle', table(['Position', 'Spring energy', 'Kinetic energy'], [['Extreme displacement', 'Maximum', 'Zero'], ['Equilibrium crossing', 'Zero relative to equilibrium', 'Maximum']])),
      help('idea-1', 'A louder tuning fork keeps its pitch', p('In the linear model, amplitude changes energy, not frequency: f = √(k/m)/(2π). That is why a gently or firmly struck tuning fork has approximately the same pitch. Seat suspensions and machine mounts use the same stiffness-to-mass ratio to set a natural frequency; large motion or nonlinear materials can change the rule.')),
    ],
    practice: practice('Find the frequency of a 0.5 kg mass on an 80 N/m spring. Then find the stiffness needed for a 100 kg seat-and-rider model at 1 Hz.', 'f = √(80/0.5)/(2π) = 2.01 Hz. For the seat, k = m(2πf)² = 100(2π)² = 3,948 N/m, about 3,950 N/m.'),
  },
  reswaves: {
    sections: [
      inline('idea-1', 'Damping controls the resonance peak', table(['Damping ratio ζ', 'Magnification at r = 1, 1/(2ζ)'], [['1%', '50'], ['2.5%', '20'], ['5%', '10']])),
      help('idea-0', 'Swings, washing machines and isolation', p('Push a swing in time with its motion and successive inputs add energy. A washing machine can pass through a large response during spin-up as forcing crosses a natural frequency. In an ideal mount’s force-transmissibility model, isolation begins above r = √2 ≈ 1.4; distinguish that measure from the force-driven displacement magnification used here.')),
      help('idea-2', 'Frequency into wavelength', p('For sound speed 343 m/s and a 440 Hz tone, λ = v/f = 343/440 = 0.780 m. The medium sets wave speed; the source sets frequency.')),
    ],
    practice: practice('A compressor’s force-driven mount model has natural frequency 10 Hz and damping ratio 0.05. Compare displacement magnification at 1,800 rpm and 600 rpm, assuming one force cycle per revolution.', '1,800 rpm = 30 Hz, so r = 3 and M = 1/√[(1 − 9)² + (2 × 0.05 × 3)²] = 0.125, about 0.13× the static deflection. At 600 rpm = 10 Hz, r = 1 and M = 10. These are displacement ratios, not force transmissibility.'),
  },
  thermal: {
    sections: [
      inline('idea-0', 'A steel expansion rule of thumb', p('With α = 12×10⁻⁶/K, each 10 m of steel changes length by 1.2 mm per 10 °C. A prairie swing from −40 to +35 °C spans 75 K: a free 10 m member changes 9 mm.')),
      help('idea-1', 'The same effect can help or hurt', p('Heating a bearing bore can create assembly clearance for a shrink fit. Uneven heating and cooling creates weld distortion. Mixed-metal bolts and joints develop stress when different free expansions are restrained. Read symbols locally: σ may mean stress or the Stefan–Boltzmann constant; ε may mean strain or emissivity.')),
    ],
    practice: practice('A 20 m steel pipe warms from −30 to +30 °C. Use α = 12×10⁻⁶/K and E = 200 GPa. Find free growth and ideal fully restrained stress. How much temperature rise expands a 50 mm steel bearing bore by 0.05 mm?', 'ΔL = αLΔT = 14.4 mm. Fully restrained stress magnitude EαΔT = 144 MPa, compressive on heating. Bearing rise = 0.05/(50 × 12×10⁻⁶) = 83.3 K (an 83 °C rise).'),
  },
  synthmethod: {
    sections: [
      inline('idea-0', 'A ledger for the 20 m drop', table(['Input / assumption', 'Source', 'Confidence / follow-up'], [['Height 20 m', 'Measured distance', 'Record measurement uncertainty'], ['g = 9.81 m/s²', 'Supplied local approximation', 'Adequate here'], ['Released from rest', 'Procedure', 'Check release mechanism'], ['Negligible drag', 'Model assumption', 'Question when measured time is longer']])),
      help('idea-2', 'Endpoints and a falling wrench', p('On a smooth incline a = g sinθ gives zero at 0° and g at 90°; g cosθ fails both endpoints. For a separate example, assume a 1 kg wrench falls 2 m and stops in 0.00313 s: energy gives v = √(2gh) = 6.26 m/s, momentum change is 6.26 N·s, and average net stopping force is about 2,000 N. Each model hands a defined quantity to the next.')),
    ],
    practice: practice('Someone proposes projectile range R = v² cos(2θ)/g for equal launch and landing heights with no drag. Test θ = 0°.', 'It predicts v²/g, a nonzero range, although a horizontal launch from ground level has zero flight time. The correct equal-height expression uses sin(2θ), which returns zero at 0° and 90°.'),
  },
  towlaunch: {
    sections: [
      inline('move', 'Keep the handoffs visible', table(['Link', 'Quantity handed onward'], [['Tow work', 'Kinetic and potential energy at release'], ['Geometry and angle', 'AR and CL'], ['Drag polar', 'CD and L/D'], ['Steady force balance', 'Trim speed and glide angle'], ['Glide geometry', 'Height × L/D range estimate']])),
      help('example', 'Why height times L/D gives range', p('In a steady shallow glide, tanγ = D/L. The descending path is a right triangle: horizontal range = height/tanγ = height × L/D. With the reference polar, varying cd0 by ±30% produces the existing roughly 210–345 m band from 30 m. This assumes still air and ignores the short transition to trim.')),
    ],
    practice: practice('Keep the reference 0.10 kg glider, release speed 8 m/s and L/D = 8.71, but release from 40 m. Use g = 9.81 m/s². Estimate release energy, range and the scaled drag-uncertainty band.', 'Energy = ½ × 0.10 × 8² + 0.10 × 9.81 × 40 = 42.44 J. Range = 40 × 8.71 = 348 m. Scaling the 30 m range band by 4/3 gives roughly 280–460 m; it remains a steady-glide estimate.'),
  },
  masterycheck: {
    sections: [
      inline('idea-0', 'Derive the relation you need', table(['Need', 'Start from'], [['Constant-acceleration displacement', 'Area under the v–t graph'], ['Pulley acceleration', 'One free-body equation per mass'], ['Stopping distance', 'Net work = change in kinetic energy'], ['Beam reactions', 'Force and moment balance']])),
      help('example', 'Catch the cosine mistake with a limit', p('For an incline, try θ = 0° and 90°. The proposed g cosθ predicts maximum acceleration on a level surface and none on a vertical drop. The correct g sinθ passes both tests. A correction should name the error, re-derive the result and state the instinct that failed.')),
      inline('move', 'Self-review before the check', list('Can I state the system, frame and sign convention?', 'Can I draw each free-body diagram and identify external forces?', 'Can I justify a conservation law over a stated interval?', 'Can I keep units through every handoff?', 'Can I test limiting cases and name the model’s assumptions?', 'Can I explain and repair each missed chain?')),
    ],
  },
};
