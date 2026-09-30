import type { ExampleContext } from "./types.ts";
import { REFERENCE_SPAR, SPAR_MATERIALS, G as SPAR_G } from "./matsynthesis.ts";
import { CAP_REFERENCE, CAP_MATERIALS, CAP_MISMATCH } from "./capstone.ts";
import { BEAM_CASE, BRACKET_ALTERNATIVES, BRACKET_CRITERIA, normalizeScores, rankAlternatives } from "./optimization.ts";
import { DIFFUSANTS, GAS_CONSTANT } from "./diffusion.ts";
import { LADDER_INPUTS as L } from "./ladder-inputs.ts";

/** Audited, locally visible givens. These supplement—not replace—the canonical lesson text. */
const supplied: Record<string, ExampleContext> = {
  "math/ratios-units": {
    "inputs": [
      {
        "label": "Reference length conversion",
        "value": "1 in = 25.4 mm",
        "origin": "Reference",
        "detail": "Exact definition."
      },
      {
        "label": "Reference mass conversion",
        "value": "1 kg ≈ 2.20462 lb",
        "origin": "Reference",
        "detail": "Rounded reference factor, supplied here rather than expected from memory."
      },
      {
        "label": "Bracket and unit price",
        "value": "3.2 kg; $4.10 per lb",
        "origin": "Given"
      }
    ],
    "sources": [
      {
        "label": "NIST conversion factors",
        "url": "https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b8"
      }
    ]
  },
  "math/powers": {
    "inputs": [
      {
        "label": "Bracket dimensions",
        "value": "80 × 50 × 6 mm",
        "origin": "Given"
      },
      {
        "label": "ρ — aluminum density",
        "value": "2700 kg/m³ = 2.7 g/cm³",
        "origin": "Reference",
        "detail": "Typical supplied material-table value, not calculated from the dimensions."
      },
      {
        "label": "I — second moment of area in the conversion question",
        "value": "2.4 × 10⁻⁹ m⁴",
        "origin": "Given",
        "detail": "A cross-section geometry property; E × I supplies the bending stiffness."
      },
      {
        "label": "M — the prefix mega",
        "value": "10⁶",
        "origin": "Reference",
        "detail": "Capital M means one million. The 150 MPa is a given example stress."
      }
    ],
    "notes": [
      "A power on a unit applies to its conversion factor too. The two exponent operations are different: (10³)⁴ = 10¹², but 10⁻⁹ × 10¹² = 10³."
    ]
  },
  "physics/projectiles": {
    "inputs": [
      {
        "label": "Launch speed and angle",
        "value": "20 m/s; 30° above horizontal",
        "origin": "Given"
      },
      {
        "label": "g — gravitational acceleration",
        "value": "9.81 m/s²",
        "origin": "Assumed",
        "detail": "Rounded near-Earth value used by this exercise, not calculated from the object."
      },
      {
        "label": "Axes and ground",
        "value": "+x forward; +y upward; launch and landing at y = 0",
        "origin": "Assumed"
      },
      {
        "label": "Air resistance",
        "value": "Ignored; vertical acceleration is −g",
        "origin": "Assumed"
      }
    ],
    "working": [
      "½g = 0.5 × 9.81 = 4.905 m/s². This is where the coefficient of t² comes from.",
      "v₀y = 20 sin 30° = 10 m/s; y(t) = 10t − 4.905t². The t = 0 solution is launch; the later zero is landing."
    ]
  },
  "physics/contact": {
    "inputs": [
      {
        "label": "Block mass and ramp angle",
        "value": "5.0 kg; 30°",
        "origin": "Given"
      },
      {
        "label": "g — gravitational acceleration",
        "value": "9.81 m/s²",
        "origin": "Assumed",
        "detail": "Rounded near-Earth value used by this exercise, not calculated from the object."
      },
      {
        "label": "μs and μk — friction coefficients",
        "value": "0.40 static; 0.30 kinetic",
        "origin": "Assumed",
        "detail": "Dimensionless classroom surface-pair values, not calculated from the angle."
      }
    ]
  },
  "physics/potential": {
    "inputs": [
      {
        "label": "Drop height and initial speed",
        "value": "20 m; approximately 0 m/s",
        "origin": "Given"
      },
      {
        "label": "g — gravitational acceleration",
        "value": "9.81 m/s²",
        "origin": "Assumed",
        "detail": "Rounded near-Earth value used by this exercise, not calculated from the object."
      },
      {
        "label": "Losses",
        "value": "Friction and air resistance ignored",
        "origin": "Assumed"
      }
    ]
  },
  "physics/power": {
    "inputs": [
      {
        "label": "Hoist load, lift, elapsed time",
        "value": "200 kg; 3 m; 12 s",
        "origin": "Given"
      },
      {
        "label": "g — gravitational acceleration",
        "value": "9.81 m/s²",
        "origin": "Assumed",
        "detail": "Rounded near-Earth value used by this exercise, not calculated from the object."
      },
      {
        "label": "Electrical input power",
        "value": "800 W",
        "origin": "Given",
        "detail": "Supplied input; do not derive it from the useful mechanical work."
      }
    ]
  },
  "physics/elastic": {
    "inputs": [
      {
        "label": "Rod diameter, length, axial load",
        "value": "10 mm; 2 m; 15 kN",
        "origin": "Given"
      },
      {
        "label": "E — Young’s modulus of the chosen steel",
        "value": "200 GPa = 200 × 10⁹ Pa",
        "origin": "Assumed",
        "detail": "Representative classroom property. E describes elastic stiffness, not yield strength."
      },
      {
        "label": "σy — yield stress of the chosen steel",
        "value": "250 MPa",
        "origin": "Assumed",
        "detail": "Representative classroom strength, not an allowable for an unspecified steel grade."
      },
      {
        "label": "Stress model",
        "value": "Uniform axial tension, no bending or notch",
        "origin": "Assumed"
      }
    ],
    "working": [
      "Radius r = 10/2 = 5 mm = 0.005 m; A = πr² = 7.854 × 10⁻⁵ m².",
      "E is the 200 × 10⁹ in δ = FL/(AE). It comes from the material assumption, not the geometry."
    ]
  },
  "physics/bending": {
    "inputs": [
      {
        "label": "F — tip load",
        "value": "5 N",
        "origin": "Given"
      },
      {
        "label": "L — unsupported length",
        "value": "300 mm = 0.300 m",
        "origin": "Given"
      },
      {
        "label": "b and h — width and bending depth",
        "value": "25 mm = 0.025 m; 2 mm = 0.002 m",
        "origin": "Given",
        "detail": "The ruler is laid flat; 2 mm, not 25 mm, is the depth being cubed."
      },
      {
        "label": "E — Young’s modulus of the chosen steel",
        "value": "200 GPa = 200 × 10⁹ Pa",
        "origin": "Assumed",
        "detail": "Representative classroom property. E describes elastic stiffness, not yield strength."
      },
      {
        "label": "Support model",
        "value": "Clamped cantilever, tip load, small elastic deflection",
        "origin": "Assumed"
      }
    ],
    "working": [
      "I = bh³/12 = 0.025 × 0.002³/12 = 1.667 × 10⁻¹¹ m⁴.",
      "δ = FL³/(3EI) = 5 × 0.300³/(3 × 200 × 10⁹ × 1.667 × 10⁻¹¹) = 0.0135 m = 13.5 mm."
    ]
  },
  "physics/pressure": {
    "inputs": [
      {
        "label": "ρwater — fresh-water density",
        "value": "1000 kg/m³",
        "origin": "Assumed",
        "detail": "Approximation for this exercise; real density varies with conditions."
      },
      {
        "label": "g — gravitational acceleration",
        "value": "9.81 m/s²",
        "origin": "Assumed",
        "detail": "Rounded near-Earth value used by this exercise, not calculated from the object."
      },
      {
        "label": "Seawater density",
        "value": "1025 kg/m³",
        "origin": "Assumed",
        "detail": "Used for the separate ship example; do not silently reuse fresh-water density."
      },
      {
        "label": "Depth / ship displacement",
        "value": "10 m in fresh water / 2.0 m³ in seawater",
        "origin": "Given"
      }
    ]
  },
  "physics/movingfluids": {
    "inputs": [
      {
        "label": "ρwater — fresh-water density",
        "value": "1000 kg/m³",
        "origin": "Assumed",
        "detail": "Approximation for this exercise; real density varies with conditions."
      },
      {
        "label": "Pipe diameters and inlet speed",
        "value": "10 cm to 5 cm; 1.0 m/s",
        "origin": "Given"
      },
      {
        "label": "Flow model",
        "value": "Steady, incompressible, same elevation, negligible losses",
        "origin": "Assumed"
      }
    ]
  },
  "physics/lift": {
    "inputs": [
      {
        "label": "m, S, CLmax — mass, wing area, maximum lift coefficient",
        "value": "0.25 kg; 0.06 m²; 1.1",
        "origin": "Given"
      },
      {
        "label": "ρair — air density",
        "value": "1.225 kg/m³",
        "origin": "Assumed",
        "detail": "Selected atmosphere for this model, not a property of the glider. Actual density changes with pressure, temperature, and humidity."
      },
      {
        "label": "g — gravitational acceleration",
        "value": "9.81 m/s²",
        "origin": "Assumed",
        "detail": "Rounded near-Earth value used by this exercise, not calculated from the object."
      },
      {
        "label": "Stability geometry",
        "value": "Neutral point 0.30 m; CG 0.27 m; mean chord 0.12 m",
        "origin": "Given"
      },
      {
        "label": "Cruise speed and CL",
        "value": "9 m/s; 0.6",
        "origin": "Given"
      },
      {
        "label": "e — span efficiency",
        "value": "0.85",
        "origin": "Assumed",
        "detail": "Teaching coefficient, not measured from the dimensions."
      }
    ],
    "working": [
      "Weight W = mg = 0.25 × 9.81 = 2.4525 N. Use this force, not the 0.25 kg mass, in the lift balance."
    ]
  },
  "physics/towlaunch": {
    "inputs": [
      {
        "label": "m, wing span, chord",
        "value": "0.10 kg; 500 mm; 90 mm",
        "origin": "Given"
      },
      {
        "label": "ρair — air density",
        "value": "1.225 kg/m³",
        "origin": "Assumed",
        "detail": "Selected atmosphere for this model, not a property of the glider. Actual density changes with pressure, temperature, and humidity."
      },
      {
        "label": "g — gravitational acceleration",
        "value": "9.81 m/s²",
        "origin": "Assumed",
        "detail": "Rounded near-Earth value used by this exercise, not calculated from the object."
      },
      {
        "label": "Release speed and height",
        "value": "8 m/s; 30 m",
        "origin": "Given"
      },
      {
        "label": "Angle of attack",
        "value": "4° = 4 × π/180 ≈ 0.0698 rad",
        "origin": "Given"
      },
      {
        "label": "cd0 and e",
        "value": "0.030 and 0.85",
        "origin": "Assumed",
        "detail": "Parasite-drag estimate (±30%) and teaching span efficiency."
      },
      {
        "label": "Neutral point and CG",
        "value": "135 mm and 120 mm from the same datum",
        "origin": "Given"
      }
    ]
  },
  "physics/thermal": {
    "inputs": [
      {
        "label": "L₀ and ΔT",
        "value": "10 m; +40 °C temperature change",
        "origin": "Given"
      },
      {
        "label": "α — selected thermal-expansion coefficient",
        "value": "12 × 10⁻⁶ per °C",
        "origin": "Assumed",
        "detail": "For this representative steel, over this temperature range."
      },
      {
        "label": "E — Young’s modulus of the chosen steel",
        "value": "200 GPa = 200 × 10⁹ Pa",
        "origin": "Assumed",
        "detail": "Representative classroom property. E describes elastic stiffness, not yield strength."
      },
      {
        "label": "σy — yield stress of the chosen steel",
        "value": "250 MPa",
        "origin": "Assumed",
        "detail": "Representative classroom strength, not an allowable for an unspecified steel grade."
      }
    ],
    "notes": [
      "A temperature change of 40 °C equals a change of 40 K. An absolute temperature of 40 °C is 313.15 K; do not confuse those operations."
    ]
  },
  "materials/crystal": {
    "inputs": [
      {
        "label": "Structure and atomic radius",
        "value": "FCC; r = 143 pm",
        "origin": "Given",
        "detail": "Radius is supplied material data, not obtained by counting the atoms."
      },
      {
        "label": "M — aluminum molar mass",
        "value": "26.98 g/mol",
        "origin": "Reference",
        "detail": "Rounded periodic-table value supplied for this example."
      },
      {
        "label": "NA — Avogadro constant",
        "value": "6.02214076 × 10²³ mol⁻¹",
        "origin": "Reference",
        "detail": "Number of entities per mole."
      },
      {
        "label": "Atoms in an FCC conventional cell",
        "value": "4",
        "origin": "Calculated",
        "detail": "8 corners × 1/8 + 6 faces × 1/2 = 4."
      }
    ],
    "working": [
      "Cell edge a = 2√2r ≈ 404 pm = 404 × 10⁻¹⁰ cm.",
      "Cell mass = 4 × 26.98/(6.02214076 × 10²³) ≈ 1.792 × 10⁻²² g.",
      "Density = cell mass/cell volume = 1.792 × 10⁻²²/(404 × 10⁻¹⁰)³ ≈ 2.72 g/cm³. Keeping the unrounded edge gives ≈2.71 g/cm³; both are close to the 2.70 reference, not identical."
    ],
    "sources": [
      {
        "label": "NIST Avogadro constant",
        "url": "https://physics.nist.gov/cgi-bin/cuu/Value?na"
      }
    ]
  },
  "materials/defects": {
    "inputs": [
      {
        "label": "Qv — vacancy formation energy",
        "value": "0.9 eV",
        "origin": "Assumed",
        "detail": "Selected copper teaching value."
      },
      {
        "label": "kB — Boltzmann constant",
        "value": "8.617 × 10⁻⁵ eV/K",
        "origin": "Reference",
        "detail": "Use the eV form because Qv is in eV."
      },
      {
        "label": "Absolute temperatures",
        "value": "1000 K and 300 K",
        "origin": "Given"
      }
    ],
    "notes": [
      "exp(x) means e raised to x. Here e is the mathematical exponential base, not an electron charge."
    ]
  },
  "materials/fracture": {
    "inputs": [
      {
        "label": "σ, KIC, a",
        "value": "200 MPa; 50 MPa√m; 5 mm = 0.005 m",
        "origin": "Given",
        "detail": "a is crack HALF-length in this example, so full crack length is 10 mm."
      },
      {
        "label": "Y — crack geometry factor",
        "value": "1",
        "origin": "Assumed",
        "detail": "Ideal central through-crack in a sufficiently wide plate under uniform tension."
      }
    ],
    "notes": [
      "The calculated critical a uses the same half-length convention. Being below KIC in this model is not an inspection approval or a prediction of fatigue/corrosion growth."
    ],
    "working": [
      "K = Yσ√(πa) = 1 × 200 × √(π × 0.005) ≈ 25.1 MPa√m.",
      "Critical half-length ac = (KIC/(Yσ))²/π ≈ 0.0199 m = 19.9 mm; full length ≈39.8 mm."
    ]
  },
  "materials/creep": {
    "inputs": [
      {
        "label": "Test rupture time and temperature",
        "value": "1000 h at 800 °C",
        "origin": "Measured example",
        "detail": "Hypothetical test record supplied for this exercise."
      },
      {
        "label": "Service temperature",
        "value": "700 °C",
        "origin": "Given"
      },
      {
        "label": "C — Larson–Miller coefficient",
        "value": "20",
        "origin": "Assumed",
        "detail": "Empirical teaching choice for t in hours; not a universal constant."
      },
      {
        "label": "Stress and material condition",
        "value": "Unchanged between test and prediction",
        "origin": "Assumed"
      }
    ],
    "working": [
      "800 + 273.15 = 1073.15 K, rounded to 1073 K in the working; 700 + 273.15 = 973.15 K, rounded to 973 K.",
      "log₁₀(1000) = 3. P = 1073 × (20 + 3) = 24,679.",
      "The ≈230,000 h result is a roughly 230:1 extrapolation, not a qualified service life. Confirm the mechanism and obtain longer-duration data."
    ]
  },
  "materials/phasediagram": {
    "inputs": [
      {
        "label": "C — numerical nickel content",
        "value": "Use 30 for 30 wt% Ni, not 0.30",
        "origin": "Given"
      },
      {
        "label": "Supplied liquidus equation",
        "value": "T (°C) = 1085 + 3.7C",
        "origin": "Assumed",
        "detail": "Teaching straight-line fit, not a universal phase-diagram equation."
      },
      {
        "label": "Supplied solidus equation",
        "value": "T (°C) = 1085 + 3.2C",
        "origin": "Assumed",
        "detail": "Same teaching diagram; do not extrapolate its straight boundaries."
      }
    ],
    "notes": [
      "Use these fits only in the course’s local 20–45 wt% Ni examples. 1085 is an intercept in °C; 3.7 and 3.2 are slopes in °C per wt%-point. Real phase boundaries are curved."
    ]
  },
  "materials/leverrule": {
    "inputs": [
      {
        "label": "C — numerical nickel content",
        "value": "Use 40 for 40 wt% Ni; T = 1220 °C",
        "origin": "Given"
      },
      {
        "label": "Supplied liquidus equation",
        "value": "T (°C) = 1085 + 3.7C",
        "origin": "Assumed",
        "detail": "Teaching straight-line fit, not a universal phase-diagram equation."
      },
      {
        "label": "Supplied solidus equation",
        "value": "T (°C) = 1085 + 3.2C",
        "origin": "Assumed",
        "detail": "Same teaching diagram; do not extrapolate its straight boundaries."
      }
    ],
    "notes": [
      "The 36.5 and 42.2 wt% endpoints are calculated from the supplied teaching lines and rounded before the displayed lever-rule arithmetic. The output is a mass fraction, because the composition basis is wt%."
    ]
  },
  "materials/famlook": {
    "inputs": [
      {
        "label": "Comparison",
        "value": "Same axial stiffness and length; mass is the objective",
        "origin": "Assumed"
      }
    ],
    "working": [
      "Steel: E/ρ = (200 GPa)/(7.85 g/cm³) ≈ 25.5 GPa·cm³/g. The numerator is stiffness; the denominator is density.",
      "Use the same units for every candidate. These index values are not dimensionless."
    ],
    "tables": [
      {
        "caption": "Supplied teaching properties, not procurement specifications",
        "columns": [
          "Material",
          "E (GPa)",
          "ρ (g/cm³)",
          "Condition"
        ],
        "rows": [
          [
            "Steel",
            "200",
            "7.85",
            "Representative room-temperature point"
          ],
          [
            "Aluminum",
            "69",
            "2.70",
            "Representative room-temperature point"
          ],
          [
            "CFRP",
            "140",
            "1.55",
            "Along the fibers only"
          ]
        ]
      }
    ]
  },
  "materials/screenrank": {
    "inputs": [
      {
        "label": "Length and cost ceiling",
        "value": "1 m; $10/kg",
        "origin": "Given"
      },
      {
        "label": "Service screen",
        "value": "Outdoor, uncoated; bare steel excluded by this brief",
        "origin": "Given"
      },
      {
        "label": "Carbon cost",
        "value": "Assume $80/kg for this exercise",
        "origin": "Assumed",
        "detail": "Hypothetical price, not a current supplier quote."
      }
    ],
    "tables": [
      {
        "caption": "Supplied teaching properties, not procurement specifications",
        "columns": [
          "Material",
          "E (GPa)",
          "ρ (g/cm³)",
          "Condition"
        ],
        "rows": [
          [
            "Steel",
            "200",
            "7.85",
            "Representative room-temperature point"
          ],
          [
            "Aluminum",
            "69",
            "2.70",
            "Representative room-temperature point"
          ],
          [
            "CFRP",
            "140",
            "1.55",
            "Along the fibers only"
          ]
        ]
      }
    ]
  },
  "materials/sustain": {
    "inputs": [
      {
        "label": "Candidate masses",
        "value": "2 kg aluminum; 3 kg steel",
        "origin": "Given"
      },
      {
        "label": "Primary aluminum intensity",
        "value": "200 MJ/kg",
        "origin": "Assumed"
      },
      {
        "label": "Steel intensity",
        "value": "30 MJ/kg",
        "origin": "Assumed"
      },
      {
        "label": "Recycled aluminum intensity",
        "value": "10 MJ/kg",
        "origin": "Assumed"
      },
      {
        "label": "Vehicle scenario",
        "value": "200,000 km; 1.5 MJ saved per kg per 1000 km",
        "origin": "Assumed",
        "detail": "A chosen teaching scenario, not a universal fuel-saving coefficient."
      }
    ],
    "notes": [
      "Compare the supplied production-route intensities on the same factory-gate accounting basis. Real life-cycle studies need matched boundaries, regional electricity, route, and allocation data."
    ],
    "working": [
      "1 kg saved × 1.5 MJ/(kg·1000 km) × 200,000 km = 300 MJ saved in use.",
      "Primary-aluminum production penalty = 2 × 200 − 3 × 30 = 310 MJ."
    ]
  },
  "engineering/loadpath": {
    "inputs": [
      {
        "label": "Release load",
        "value": "2 kN",
        "origin": "Given"
      },
      {
        "label": "Bolts",
        "value": "Two identical bolts in a symmetric joint",
        "origin": "Assumed",
        "detail": "Equal stiffness, central load, no eccentricity or prying; not the rule for every two-bolt joint."
      }
    ],
    "working": [
      "Each bolt carries 2 kN/2 = 1 kN only under the stated equal-sharing assumptions."
    ]
  },
  "engineering/bending": {
    "inputs": [
      {
        "label": "Square tube, cantilever, tip load",
        "value": "40 × 40 × 3 mm; 1.2 m; 500 N",
        "origin": "Given"
      },
      {
        "label": "ρ, E and σy — selected aluminum properties",
        "value": "2700 kg/m³; 68.9 GPa; 276 MPa",
        "origin": "Assumed"
      },
      {
        "label": "Strength comparison factor",
        "value": "n = 1 for the yield-only demonstration",
        "origin": "Assumed",
        "detail": "This is not a recommended design factor or a workbench safety approval."
      }
    ],
    "notes": [
      "Ideal sharp-corner geometry; real extrusion fillets and tolerances change section properties. Strength, deflection, joints and buckling require separate checks."
    ],
    "working": [
      "Inner side = 40 − 2 × 3 = 34 mm; A = 40² − 34² = 444 mm².",
      "I = (40⁴ − 34⁴)/12 = 101,972 mm⁴. S = I/(40/2) = 5098.6 mm³ ≈ 5.10 × 10⁻⁶ m³.",
      "Mass per length = 2700 × 444 × 10⁻⁶ = 1.1988 kg/m. The solid bar is 2700 × 1600 × 10⁻⁶ = 4.32 kg/m."
    ]
  },
  "engineering/buckle": {
    "inputs": [
      {
        "label": "Tube geometry and length",
        "value": "25 mm outside diameter; 2 mm wall; 1.5 m long",
        "origin": "Given"
      },
      {
        "label": "E and σy",
        "value": "68.9 GPa; 276 MPa",
        "origin": "Assumed",
        "detail": "Selected classroom aluminum properties."
      },
      {
        "label": "K — effective-length factor",
        "value": "1 for pinned–pinned; 2 for fixed–free",
        "origin": "Assumed",
        "detail": "Ideal end restraints, not a material property."
      },
      {
        "label": "Camper mass and g",
        "value": "70 kg; 9.81 m/s²",
        "origin": "Given"
      }
    ],
    "notes": [
      "These are ideal elastic Euler calculations, not a load rating for a real tent pole."
    ],
    "working": [
      "Inside diameter = 25 − 2 × 2 = 21 mm.",
      "A = π(25² − 21²)/4 = 144.51 mm² = 1.4451 × 10⁻⁴ m².",
      "I = π(25⁴ − 21⁴)/64 = 9628.20 mm⁴ = 9.6282 × 10⁻⁹ m⁴.",
      "Effective length Le = KL. Doubling K multiplies Le by 2, so Euler load falls by 4."
    ]
  },
  "engineering/interfaces": {
    "inputs": [
      {
        "label": "Aluminum modulus",
        "value": "68.9 GPa = 68,900 MPa",
        "origin": "Assumed"
      },
      {
        "label": "Thermal-expansion coefficients",
        "value": "Aluminum 23 × 10⁻⁶/K; stainless steel 17 × 10⁻⁶/K",
        "origin": "Assumed",
        "detail": "Representative teaching values used to obtain Δα, not measured for the railing."
      },
      {
        "label": "Temperature change",
        "value": "60 °C = 60 K change",
        "origin": "Given"
      },
      {
        "label": "Mismatch restraint",
        "value": "One-axis fully restrained estimate",
        "origin": "Assumed"
      }
    ],
    "notes": [
      "The later carbon-steel/aluminum example instead uses Δα = 11 × 10⁻⁶/K and ΔT = 80 K, giving ≈61 MPa. Joint efficiencies of 70% and 100% are this course’s assumptions, not guaranteed weld properties."
    ],
    "working": [
      "Δα = (23 − 17) × 10⁻⁶ = 6 × 10⁻⁶/K.",
      "σ ≈ 68,900 × 6 × 10⁻⁶ × 60 = 24.8 MPa ≈ 25 MPa."
    ]
  },
  "engineering/indicescontext": {
    "inputs": [
      {
        "label": "Joint-screening coefficients",
        "value": "15 MPa adhesive shear; 100% steel-weld comparison efficiency",
        "origin": "Assumed",
        "detail": "Simplified teaching inputs, not approved joint allowables."
      },
      {
        "label": "Galvanic comparison values",
        "value": "Carbon +0.25 V; steel −0.60 V; same reference basis",
        "origin": "Assumed",
        "detail": "Illustrative seawater values; potential difference alone does not predict a corrosion rate."
      }
    ],
    "notes": [
      "Use a qualified weld procedure, the actual material condition, geometry, and test data for real joint sizing. “100%” is not a guarantee about all steel welds."
    ]
  },
  "engineering/processes": {
    "inputs": [
      {
        "label": "Brief",
        "value": "6061 aluminum; 500 parts; hole-position requirement ±0.05 mm",
        "origin": "Given"
      },
      {
        "label": "CNC milling quote",
        "value": "Assume $42/part",
        "origin": "Given",
        "detail": "Hypothetical supplied quote, not calculated here and not a current market price."
      },
      {
        "label": "Die tooling estimate",
        "value": "Assume $12,000",
        "origin": "Given",
        "detail": "Hypothetical supplied setup cost."
      }
    ],
    "notes": [
      "Material compatibility is a hard screen too. Real shop capability depends on the feature, machine, setup and inspection evidence; these are not guarantees."
    ],
    "tables": [
      {
        "caption": "Hypothetical capability data for this exercise",
        "columns": [
          "Process",
          "Typical tolerance assumed",
          "Other screen"
        ],
        "rows": [
          [
            "CNC milling",
            "±0.025 mm",
            "Compatible with aluminum"
          ],
          [
            "Die casting",
            "±0.10 mm",
            "Needs a separate positioning/machining operation"
          ],
          [
            "FDM printing",
            "±0.20 mm",
            "The polymer process is not a route to the specified 6061 material"
          ]
        ]
      }
    ]
  },
  "engineering/smallsample": {
    "inputs": [
      {
        "label": "Thrust readings",
        "value": "19.4, 19.8, 19.5, 19.9, 20.4 kN",
        "origin": "Measured example",
        "detail": "Hypothetical independent repeat measurements."
      },
      {
        "label": "Confidence interval convention",
        "value": "95% two-sided; n = 5; df = n − 1 = 4",
        "origin": "Given"
      },
      {
        "label": "Student-t multiplier",
        "value": "t₀.₉₇₅,₄ ≈ 2.776",
        "origin": "Reference",
        "detail": "Look up row df = 4, cumulative-probability column 0.975; 2.5% sits in each tail."
      },
      {
        "label": "Grubbs threshold",
        "value": "Gcrit ≈ 1.715 (rounded 1.72)",
        "origin": "Reference",
        "detail": "Two-sided single-outlier test, α = 0.05, n = 5, approximately normal independent data."
      }
    ],
    "notes": [
      "The readings produce the mean and sample standard deviation. The chosen confidence/significance levels and reference distribution produce the critical multipliers. A flagged point needs investigation, not automatic deletion."
    ],
    "sources": [
      {
        "label": "NIST Student-t critical-value table",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm"
      },
      {
        "label": "NIST Grubbs critical-value formula and assumptions",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda35h1.htm"
      }
    ]
  },
  "engineering/doeplan": {
    "inputs": [
      {
        "label": "A — glue type",
        "value": "Standard epoxy (−1); toughened epoxy (+1)",
        "origin": "Given",
        "detail": "Categorical: there is no halfway glue."
      },
      {
        "label": "B — cure time",
        "value": "2 h (−1); 24 h (+1)",
        "origin": "Given"
      },
      {
        "label": "Four corner means",
        "value": "8.0, 8.6, 8.4, 13.0 MPa",
        "origin": "Measured example",
        "detail": "Hypothetical means in order (−,−), (+,−), (−,+), (+,+)."
      },
      {
        "label": "Additional 13 h observations",
        "value": "Standard: 8.4, 8.6 MPa; toughened: 11.0, 11.2 MPa",
        "origin": "Measured example",
        "detail": "Hypothetical extra midpoint-in-time data supplied here. Not new results measured by the app."
      }
    ],
    "notes": [
      "Only cure time has a numeric midpoint. Analyze midpoint-in-time runs within each glue and account for repeat scatter and rig/block effects before deciding whether 0.30 MPa is evidence of curvature."
    ],
    "working": [
      "Grand mean = (8.0 + 8.6 + 8.4 + 13.0)/4 = 9.50 MPa.",
      "At 13 h, the no-curvature predictions are 8.20 MPa for standard glue and 10.80 MPa for toughened glue. The supplied midpoint means are 8.50 and 11.10: each is 0.30 MPa above its prediction."
    ]
  },
  "engineering/safetyfactor": {
    "inputs": [
      {
        "label": "Scenario demand and representative yield",
        "value": "12 kN; 250 MPa",
        "origin": "Given"
      },
      {
        "label": "Chosen factor for this exercise",
        "value": "2.0",
        "origin": "Assumed",
        "detail": "Fictional classroom consequence table, not a real code or a trailer design recommendation."
      }
    ],
    "notes": [
      "The actual governing standard, load cases, failure modes, testing, and approval determine a real safety factor. A safety chain alone does not establish a low consequence of hitch failure."
    ]
  },
  "engineering/standards": {
    "inputs": [
      {
        "label": "Excerpt identification",
        "value": "Fictional teaching example — “tow-bar §4.2”",
        "origin": "Given",
        "detail": "Not a citation to a real code."
      },
      {
        "label": "Requirement in the fictional excerpt",
        "value": "3 × rated tow load with no permanent deformation",
        "origin": "Given",
        "detail": "The multiplier is supplied by the exercise, not derived from a material property."
      }
    ],
    "notes": [
      "For real compliance, record document identifier, edition, scope, applicable clauses, and evidence. Appendices can be normative or informative: read their stated status rather than assuming."
    ]
  },
  "manufacturing/chip": {
    "inputs": [
      {
        "label": "b and h — uncut chip width and thickness",
        "value": "3 mm; 0.10 mm",
        "origin": "Given"
      },
      {
        "label": "u — specific cutting energy/force coefficient",
        "value": "2500 N/mm²",
        "origin": "Assumed",
        "detail": "Selected steel teaching coefficient. Energy per volume can be written as force per area."
      }
    ],
    "notes": [
      "u is supplied, not obtained from the chip dimensions. Tool, material and cutting conditions change real coefficients."
    ],
    "working": [
      "Uncut area = b × h = 3 × 0.10 = 0.30 mm².",
      "F = u × area = 2500 N/mm² × 0.30 mm² = 750 N."
    ]
  },
  "manufacturing/freeze": {
    "inputs": [
      {
        "label": "Plate length, width, thickness",
        "value": "120 × 80 × 20 mm",
        "origin": "Given"
      },
      {
        "label": "Riser geometry",
        "value": "Cylinder with height H = diameter D",
        "origin": "Assumed"
      },
      {
        "label": "Heat-loss comparison",
        "value": "Same mold constant C; count all cylinder surfaces",
        "origin": "Assumed",
        "detail": "Shared contact face is ignored in both ideal areas; a real riser needs a heat-flow/feeding assessment."
      }
    ],
    "working": [
      "Plate V = 120 × 80 × 20 = 192,000 mm³.",
      "Plate A = 2(lw + lh + wh) = 2(9600 + 2400 + 1600) = 27,200 mm².",
      "Cylinder V = πD²H/4 = πD³/4; A = πDH + 2πD²/4 = 3πD²/2.",
      "V/A = (πD³/4)/(3πD²/2) = D/6. Thus D > 6 × 7.0588 = 42.35 mm to exceed the plate modulus."
    ]
  },
  "manufacturing/spread": {
    "inputs": [
      {
        "label": "Nominal and specification limits",
        "value": "10.00 mm; LSL = 9.90 mm; USL = 10.10 mm",
        "origin": "Given"
      },
      {
        "label": "σ — process standard deviation",
        "value": "0.025 mm",
        "origin": "Given",
        "detail": "Here sigma means statistical spread, not mechanical stress and not a tolerance."
      },
      {
        "label": "Mean shift",
        "value": "+0.06 mm, so new mean = 10.06 mm",
        "origin": "Given"
      },
      {
        "label": "Capability gate",
        "value": "Cpk ≥ 1.33",
        "origin": "Assumed",
        "detail": "Selected classroom/shop policy, not a law of nature."
      }
    ],
    "notes": [
      "The exercise assumes a stable, approximately normal process. A drawing tolerance does not tell you the process standard deviation."
    ],
    "working": [
      "Specification width = 10.10 − 9.90 = 0.20 mm.",
      "6σ = 6 × 0.025 = 0.150 mm; 3σ = 3 × 0.025 = 0.075 mm.",
      "Nearer-limit distance after the shift = 10.10 − 10.06 = 0.04 mm.",
      "Cp = 0.20/0.15 ≈ 1.33; Cpk = 0.04/0.075 ≈ 0.53."
    ]
  },
  "manufacturing-301/travel": {
    "inputs": [
      {
        "label": "Voltage and current",
        "value": "20 V; 150 A",
        "origin": "Given"
      },
      {
        "label": "Travel speeds",
        "value": "300 mm/min, then 150 mm/min",
        "origin": "Given"
      },
      {
        "label": "η — arc efficiency",
        "value": "1",
        "origin": "Assumed",
        "detail": "Electrical-energy upper estimate; a real arc transfers less to the workpiece."
      }
    ],
    "working": [
      "Electrical power = VI = 20 × 150 = 3000 W = 3000 J/s.",
      "300 mm/min ÷ 60 s/min = 5 mm/s. HI = 3000/5 = 600 J/mm = 0.60 kJ/mm.",
      "The compact conversion is VI × 60/(speed in mm/min)/1000. The 60 is seconds per minute; 1000 is joules per kilojoule."
    ]
  },
  "engineering-201/wear": {
    "inputs": [
      {
        "label": "k — wear coefficient",
        "value": "10⁻⁴",
        "origin": "Assumed",
        "detail": "Dimensionless dry teaching pair, not measured for a specific contact."
      },
      {
        "label": "Load, sliding distance, hardness",
        "value": "200 N; 1000 m; 1000 MPa",
        "origin": "Given"
      }
    ],
    "working": [
      "1000 MPa = 1000 N/mm². F/H = 200/1000 = 0.20 mm².",
      "Convert distance: 1000 m × 1000 mm/m = 1,000,000 mm.",
      "V = k(F/H)s = 10⁻⁴ × 0.20 × 1,000,000 = 20 mm³. The extra 1000 converts travel units; it is not another wear coefficient."
    ]
  },
  "manufacturing-401/dfa": {
    "inputs": [
      {
        "label": "Base assembly time",
        "value": "20 s",
        "origin": "Assumed",
        "detail": "Teaching handling-time model."
      },
      {
        "label": "Time per additional part",
        "value": "8 s",
        "origin": "Assumed"
      },
      {
        "label": "Compared assemblies",
        "value": "6 parts, then 3 parts",
        "origin": "Given"
      }
    ],
    "working": [
      "6 parts: 20 + (6 − 1) × 8 = 60 s.",
      "3 parts: 20 + (3 − 1) × 8 = 36 s.",
      "Saved time = 60 − 36 = 24 s. Replacing three fasteners with one snap is a different case: two fewer parts save 16 s."
    ]
  },
  "manufacturing-301/bonus": {
    "inputs": [
      {
        "label": "Hole at maximum material",
        "value": "Diameter 10.00 mm",
        "origin": "Given"
      },
      {
        "label": "Position callout at MMC",
        "value": "Cylindrical zone diameter ⌀0.20 mm",
        "origin": "Given",
        "detail": "The number is a DIAMETER, not a radial center offset."
      },
      {
        "label": "Measured hole diameter",
        "value": "10.20 mm",
        "origin": "Measured example"
      },
      {
        "label": "Datum mobility",
        "value": "No datum shift in this teaching case",
        "origin": "Assumed"
      }
    ],
    "working": [
      "Bonus = 10.20 − 10.00 = 0.20 mm.",
      "Allowed zone diameter = 0.20 + 0.20 = 0.40 mm; radial center offset limit = 0.40/2 = 0.20 mm."
    ],
    "sources": [
      {
        "label": "KEYENCE: position tolerance is a diametral zone",
        "url": "https://www.keyence.com/ss/products/measure-sys/gd-and-t/type/location-tolerance.jsp"
      }
    ]
  },
  "physics-301/depth": {
    "inputs": [
      {
        "label": "ρwater — fresh-water density",
        "value": "1000 kg/m³",
        "origin": "Assumed",
        "detail": "Approximation for this exercise; real density varies with conditions."
      },
      {
        "label": "g — gravitational acceleration",
        "value": "9.81 m/s²",
        "origin": "Assumed",
        "detail": "Rounded near-Earth value used by this exercise, not calculated from the object."
      },
      {
        "label": "Depth",
        "value": "10 m",
        "origin": "Given"
      },
      {
        "label": "Surface atmosphere for the rough absolute-pressure comparison",
        "value": "About 101 kPa",
        "origin": "Assumed"
      }
    ],
    "working": [
      "1000 × 9.81 × 1 = 9810 Pa = 9.81 kPa extra per metre."
    ]
  },
  "physics-301/flow": {
    "inputs": [
      {
        "label": "ρwater — fresh-water density",
        "value": "1000 kg/m³",
        "origin": "Assumed",
        "detail": "Approximation for this exercise; real density varies with conditions."
      },
      {
        "label": "Total ideal pressure budget",
        "value": "200 kPa",
        "origin": "Given",
        "detail": "Initial speed approximated as zero; use the same pressure datum throughout."
      },
      {
        "label": "Final speed",
        "value": "10 m/s",
        "origin": "Given"
      },
      {
        "label": "Model",
        "value": "Same height; loss-free, steady incompressible streamline",
        "origin": "Assumed"
      }
    ],
    "working": [
      "½ρv² = 0.5 × 1000 × 10² = 50,000 Pa = 50 kPa; static pressure = 200 − 50 = 150 kPa."
    ]
  },
  "physics-301/thermal": {
    "inputs": [
      {
        "label": "E — Young’s modulus of the chosen steel",
        "value": "200 GPa = 200 × 10⁹ Pa",
        "origin": "Assumed",
        "detail": "Representative classroom property. E describes elastic stiffness, not yield strength."
      },
      {
        "label": "α — steel thermal-expansion coefficient",
        "value": "12 × 10⁻⁶/K",
        "origin": "Assumed"
      },
      {
        "label": "Length and temperature change",
        "value": "1 m; +50 K (a +50 °C change)",
        "origin": "Given"
      }
    ],
    "working": [
      "Eα = 200,000 MPa × 12 × 10⁻⁶/K = 2.4 MPa/K.",
      "Fully held: stress magnitude = 2.4 × 50 = 120 MPa, compressive. Free: growth = 12 × 10⁻⁶ × 1 × 50 = 0.00060 m = 0.60 mm."
    ]
  }
};

const input = (label: string, value: string, detail?: string): ExampleContext["inputs"][number] => ({ label, value, origin: "Assumed", detail });
const number = (value: number, digits = 3) => Number(value.toPrecision(digits)).toString();
const diffusion = DIFFUSANTS.find((material) => material.id === "c-gamma")!;
supplied["materials/diffusion"] = {
  inputs: [
    input("Material model", diffusion.label, "Selected classroom Arrhenius fit, not a new measurement."),
    input("D₀ — diffusivity prefactor", `${diffusion.D0} m²/s`),
    input("Q — activation energy", `${diffusion.Q / 1000} kJ/mol = ${diffusion.Q} J/mol`),
    { label: "R — molar gas constant", value: `${GAS_CONSTANT} J/(mol·K)`, origin: "Reference", detail: "Rounded to match the teaching model; Q and R must use the same energy units." },
    { label: "Temperature, duration and concentrations", value: "950 °C; 4 h; surface Cs = 1.1 wt%, initial C₀ = 0.2 wt%, target C = 0.4 wt%", origin: "Given" },
  ],
  working: [
    "T = 950 + 273.15 = 1223.15 K (1223 K in the rounded working); t = 4 × 3600 = 14,400 s.",
    `D = ${diffusion.D0} × exp(−${diffusion.Q}/(${GAS_CONSTANT} × 1223)) ≈ 1.10 × 10⁻¹¹ m²/s. exp(z) means e raised to z; its input has no units.`,
    "2√(Dt) ≈ 0.80 mm. The required normalized concentration is (1.1 − 0.4)/(1.1 − 0.2) ≈ 0.778.",
    "An inverse-error-function calculator or table gives erf⁻¹(0.778) ≈ 0.86. This is a function lookup, not another material constant. Depth x ≈ 0.86 × 0.80 = 0.69 mm.",
  ],
  notes: ["One-dimensional, semi-infinite solid; constant surface concentration and diffusivity during the hold. The characteristic length 2√(Dt) and the depth at a specified concentration are different quantities."],
};

const spar = REFERENCE_SPAR;
const sparLift = spar.gliderMassKg * SPAR_G * spar.gustFactor;
const sparMoment = sparLift * spar.halfSpanM / 4;
const sparI = spar.sectionBMm * spar.sectionHMm ** 3 / 12;
const referenceSpar: ExampleContext = {
  inputs: [
    { label: "Reference glider and one wing panel", value: `${spar.gliderMassKg * 1000} g glider; ${spar.halfSpanM * 1000} mm half-span; ${spar.sectionBMm} × ${spar.sectionHMm} mm section (${spar.sectionHMm} mm is the bending depth)`, origin: "Given" },
    input("Gust multiplier and gravity", `${spar.gustFactor} × weight; g = ${SPAR_G} m/s²`, "The gust multiplier is a scenario estimate, not a flight measurement."),
    input("Load and support model", "Each half-wing carries half the total lift, uniformly distributed; root fixed"),
    { label: "Deflection requirement", value: `${spar.deflectionLimitM * 1000} mm maximum`, origin: "Given" },
  ],
  tables: [{
    caption: "Supplied spar-model properties — the same values used by Spar Lab II, not certified allowables",
    columns: ["Material / direction", "E (GPa)", "Strength (MPa)", "ρ (kg/m³)", "Chosen factor", "Allowable (MPa)"],
    rows: SPAR_MATERIALS.map((m) => [m.name, String(m.ePa / 1e9), String(m.strengthPa / 1e6), String(m.densityKgM3), String(m.fos), number(m.strengthPa / 1e6 / m.fos, 4)]),
  }],
  working: [
    `Total lift = mgn = ${spar.gliderMassKg} × ${SPAR_G} × ${spar.gustFactor} = ${number(sparLift, 5)} N. One panel carries half; its resultant acts halfway along the half-span. M = (${number(sparLift, 5)}/2) × (${spar.halfSpanM}/2) = ${number(sparMoment, 4)} N·m.`,
    `A = ${spar.sectionBMm} × ${spar.sectionHMm} = ${spar.sectionBMm * spar.sectionHMm} mm². I = bh³/12 = ${sparI} mm⁴ = ${sparI} × 10⁻¹² m⁴. c = h/2 = ${spar.sectionHMm / 2} mm. σ = Mc/I ≈ 6.39 MPa.`,
    "For balsa, w = total lift/(2 × half-span) = 4.905 N/m; δ = w × 0.25⁴/(8 × 3.0 × 10⁹ × 72 × 10⁻¹²) = 0.0111 m = 11.1 mm. This exceeds the 5 mm requirement.",
    "One half-span spar has volume A × length = 24 × 10⁻⁶ × 0.25 = 6 × 10⁻⁶ m³. Mass = ρV: balsa 0.96 g, aluminum 16.86 g, carbon 9.60 g. Change E, strength and density from the table to reproduce the other rows.",
  ],
  notes: ["The selected strength is yield for aluminum and a directional strength for wood/composite. The material-specific factor is a classroom assumption. A large crack-size prediction outside the part's geometry is not an inspection approval."],
};
supplied["materials/sparsynth"] = referenceSpar;
const capstone: ExampleContext = {
  ...referenceSpar,
  inputs: [
    ...referenceSpar.inputs,
    input("Capstone strength factor", String(CAP_REFERENCE.fosStrength), "This capstone model uses one factor for both candidates; the earlier Spar Lab uses a separate wood factor."),
    { label: "Illustrative rig result", value: `${CAP_MISMATCH.measuredDeflectionMm} ± ${CAP_MISMATCH.measurementUncertaintyMm} mm`, origin: "Measured example", detail: "Hypothetical data supplied for this exercise under the same distributed load. This is not a test we performed." },
    { label: "Nominal prediction", value: `${CAP_MISMATCH.predictedDeflectionMm} mm; prediction uncertainty not yet quantified`, origin: "Calculated" },
  ],
  tables: [{
    caption: "Capstone model inputs — shared with the reference calculation",
    columns: ["Material / direction", "E (GPa)", "Strength (MPa)", "ρ (kg/m³)", "Chosen factor"],
    rows: CAP_MATERIALS.map((m) => [m.name, String(m.ePa / 1e9), String(m.strengthPa / 1e6), String(m.densityKgM3), String(CAP_REFERENCE.fosStrength)]),
  }],
  notes: [
    "The measured example differs from the nominal prediction by 0.15 mm, about 33%. The measurement interval alone is 0.56–0.66 mm. A prediction uncertainty budget is still needed before making a combined-uncertainty or statistical-significance claim.",
    "The root-compliance explanation is a hypothesis to test at a second load, not a measured cause. A point-load test and a distributed-load prediction cannot be compared without first matching their load cases.",
  ],
};
supplied["engineering/capmethod"] = capstone;
supplied["engineering/glidersynth"] = capstone;

const normalized = normalizeScores(BRACKET_ALTERNATIVES, BRACKET_CRITERIA);
const ranked = rankAlternatives(BRACKET_ALTERNATIVES, BRACKET_CRITERIA);
supplied["engineering/tradestudy"] = {
  inputs: [input("Scenario data", "The four alternatives and five criteria below", "Hypothetical classroom scores and prices, shared with the trade-study bench. All candidates are assumed to have passed the brief's hard screens first.")],
  tables: [
    { caption: "Raw input matrix", columns: ["Alternative", ...BRACKET_CRITERIA.map((c) => `${c.name} (${c.unit})`)], rows: BRACKET_ALTERNATIVES.map((a) => [a.name, ...BRACKET_CRITERIA.map((c) => String(a.scores[c.id]))]) },
    { caption: "Normalization rules and chosen weights", columns: ["Criterion", "Better direction", "Worst", "Best", "Weight"], rows: BRACKET_CRITERIA.map((c) => {
      const values = BRACKET_ALTERNATIVES.map((a) => a.scores[c.id]);
      const lo = Math.min(...values), hi = Math.max(...values);
      return [c.name, c.direction === "min" ? "Smaller" : "Larger", String(c.direction === "min" ? hi : lo), String(c.direction === "min" ? lo : hi), String(c.weight)];
    }) },
    { caption: "Calculated scores (rounded here; full precision used in totals)", columns: ["Alternative", ...BRACKET_CRITERIA.map((c) => c.name), "Weighted total"], rows: ranked.map((a) => [a.name, ...BRACKET_CRITERIA.map((c) => a.normalized[c.id].toFixed(3)), a.total.toFixed(3)]) },
  ],
  working: [
    "For a smaller-is-better criterion: score = (worst − value)/(worst − best). For larger-is-better: score = (value − worst)/(best − worst). All-equal values receive the same score and cannot separate alternatives.",
    "Nylon mass: (160 − 60)/(160 − 45) = 100/115 ≈ 0.870. Nylon cost: (220 − 25)/(220 − 25) = 1. Its stiffness, lead-time and confidence scores are 0, 1 and (7 − 6)/(9 − 6) = 1/3.",
    `Nylon total = ${BRACKET_CRITERIA.map((c) => `${c.weight} × ${number(normalized.nylon[c.id], 4)}`).join(" + ")} ≈ ${ranked.find((a) => a.id === "nylon")!.total.toFixed(3)}. This is a ranking under the stated weights, not an unconditional design approval.`,
  ],
};
supplied["engineering/paramsweep"] = {
  inputs: [
    { label: "Beam geometry and load", value: `L = ${BEAM_CASE.lengthM} m; b = ${BEAM_CASE.widthM * 1000} mm; F = ${BEAM_CASE.forceN} N at the free tip`, origin: "Given" },
    input("Selected aluminum modulus E", `${BEAM_CASE.modulusPa / 1e9} GPa`, "Use this model's 70 GPa, not another lesson's 68.9 GPa."),
    input("Selected density ρ", `${BEAM_CASE.densityKgM3} kg/m³`),
    { label: "Deflection limit", value: `${BEAM_CASE.deflectionLimitM * 1000} mm`, origin: "Given" },
    input("Model", "Fixed-root, slender linear-elastic beam; no self-weight or shear deflection"),
  ],
  working: [
    "At h = 53 mm = 0.053 m: I = 0.040 × 0.053³/12 ≈ 4.963 × 10⁻⁷ m⁴.",
    `δ = ${BEAM_CASE.forceN} × ${BEAM_CASE.lengthM}³/(3 × ${BEAM_CASE.modulusPa / 1e9} × 10⁹ × I) ≈ 1.92 mm.`,
    `m = ρbhL = ${BEAM_CASE.densityKgM3} × ${BEAM_CASE.widthM} × 0.053 × ${BEAM_CASE.lengthM} = 5.724 kg ≈ 5.72 kg. The inputs are supplied; I, deflection and mass are calculated.`,
  ],
};

supplied["physics-401/rodspeed"] = {
  inputs: [input("Wave model", "Longitudinal wave in a thin, elastic rod")],
  tables: [{ caption: "Supplied classroom properties, shared with the bench", columns: ["Material", "E (Pa)", "ρ (kg/m³)", "Calculated c (m/s)"], rows: L.rodMaterials.map((m) => [m.name, String(m.e), String(m.rho), String(Math.round(Math.sqrt(m.e / m.rho)))]) }],
  working: ["For steel: c = √(200 × 10⁹ Pa / 7800 kg/m³) ≈ 5064 m/s. GPa must become Pa before combining it with kg/m³. The units under the root reduce to m²/s²."],
};
supplied["physics-401/modeshape"] = {
  inputs: [input("Section and supports", `${L.mode.sideM * 1000} mm square, pinned at both ends, first bending mode`), input("Selected steel properties", `E = ${L.mode.modulusPa / 1e9} GPa; ρ = ${L.mode.densityKgM3} kg/m³`), { label: "Spans compared", value: "0.60 m and 1.20 m", origin: "Given" }],
  working: ["A = 0.020² = 0.0004 m²; I = 0.020⁴/12 = 1.333 × 10⁻⁸ m⁴; μ = ρA = 3.12 kg/m (mass per length, not friction).", "ω = (π/L)²√(EI/μ). At L = 0.60 m, ω ≈ 802 rad/s; f = ω/(2π) ≈ 128 Hz. At 1.20 m, f ≈ 32 Hz. ω is angular frequency; f is cycles per second."],
};
supplied["materials-201/creeprate"] = {
  inputs: [input("Reference state", `${L.creep.referenceHours} h to 1% strain at ${L.creep.referenceStressMPa} MPa and ${L.creep.referenceTemperatureK} K`), input("Teaching exponents", `Stress exponent n = ${L.creep.exponent}; Q/R = ${L.creep.qOverRInK} K`, "A selected model fit, not a certified alloy. Q/R is already combined; do not divide by R again.")],
  working: ["t = 1000 h × (100 MPa/σ)⁵ × exp[30000 K × (1/T − 1/800 K)]. All ratios and the exponential input are dimensionless.", "At 200 MPa and 800 K, t = 1000/32 = 31.25 h. At 100 MPa and 850 K, t ≈ 110 h, about one ninth of the reference life. Temperature is absolute kelvin, not °C."],
};
supplied["materials-401/panel"] = {
  inputs: [input("Index unit convention", "E in GPa; ρ in g/cm³", "Keep one convention across candidates. The displayed index is not dimensionless and is only for the stated panel constraint.")],
  tables: [{ caption: "Selected directional property values, shared with the bench", columns: ["Material / direction", "E (GPa)", "ρ (g/cm³)", "E^(1/3)/ρ", "E/ρ"], rows: L.panelMaterials.map((m) => [m.name, String(m.e), String(m.rho), (Math.cbrt(m.e) / m.rho).toFixed(2), (m.e / m.rho).toFixed(2)]) }],
  working: ["Steel panel index = ∛200/7.8 ≈ 0.75; wood = ∛10/0.5 ≈ 4.31. In an axial stiffness comparison, instead use 200/7.8 ≈ 25.6 versus 10/0.5 = 20."],
};
supplied["engineering-301/whirl"] = {
  inputs: [input("Shaft and disk", `${L.whirl.diameterM * 1000} mm diameter shaft; E = ${L.whirl.modulusPa / 1e9} GPa; ${L.whirl.diskMassKg} kg disk at midspan`), input("Support model", "Simply supported, shaft mass neglected, one transverse mode"), { label: "Spans compared", value: "0.40 m and 0.80 m", origin: "Given" }],
  working: ["I = πd⁴/64 = π × 0.020⁴/64 = 7.854 × 10⁻⁹ m⁴. Midspan stiffness k = 48EI/L³; 48 belongs to this support/load case.", "At 0.40 m: k ≈ 1.178 × 10⁶ N/m, ω = √(k/2 kg) ≈ 767 rad/s. Convert rad/s to revolutions/minute with 60/(2π): N ≈ 7330 rpm. At 0.80 m, N ≈ 2590 rpm."],
};
supplied["engineering-401/interval"] = {
  inputs: [
    input("Paris-law fit", `m = ${L.crack.exponent}; C = ${L.crack.parisC} m/cycle/(MPa√m)³`, "The units of C belong to this ΔK unit convention."),
    input("Stress cycle", `0 to ${L.crack.maximumStressMPa} MPa; Δσ = ${L.crack.stressRangeMPa} MPa`, "In this example maximum stress equals the stress range. They are not interchangeable for a different cycle."),
    input("Crack geometry and toughness", `Y = ${L.crack.geometryFactor}; K_IC = ${L.crack.toughnessMPaSqrtM} MPa√m`, "Selected edge-crack approximation; use a in metres."),
    { label: "Detectable sizes compared", value: "a₀ = 0.5 mm and 2.0 mm", origin: "Given" },
  ],
  working: ["a_c = (50/(1.12 × 120))²/π ≈ 0.0441 m. This threshold uses maximum stress; crack-growth ΔK uses the stress range.", "For m = 3, integrate da/dN = C(YΔσ√(πa))³: N = 2(1/√a₀ − 1/√a_c) / [C(YΔσ√π)³].", "Substitute a₀ = 0.0005 m to get about 0.86 million cycles; a₀ = 0.002 m gives about 0.38 million. These are model growth lives, not approved inspection intervals."],
  notes: ["An inspection plan also needs detection probability, life factors and verification that the crack geometry and growth regime apply."],
};
supplied["manufacturing-201/taylor"] = {
  inputs: [input("Fitted teaching coefficients", `n = ${L.taylor.exponent}; C = ${L.taylor.coefficient}`, "C = 200 (m/min)·min^0.2 when V is m/min and tool time T is minutes. The fit depends on the tool, workpiece and chosen wear criterion."), { label: "Cutting speeds", value: "100 m/min and 150 m/min", origin: "Given" }],
  working: ["VTⁿ = C gives T = (C/V)^(1/n). Since 1/0.2 = 5, at 100 m/min T = (200/100)⁵ = 32 min; at 150 m/min T = (200/150)⁵ ≈ 4.21 min."],
};

export const exampleContexts: Readonly<Record<string, ExampleContext>> = supplied;

/** No fallback guesses: lessons without audited metadata keep their existing presentation. */
export function getExampleContext(track: string, id: string): ExampleContext | undefined {
  return exampleContexts[`${track}/${id}`];
}
