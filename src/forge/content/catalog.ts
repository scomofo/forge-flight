import type { GeomKind, ProcessId } from "@/forge/types";

export type Material = {
  id: string;
  name: string;
  class: "metal" | "polymer" | "composite" | "ceramic" | "wood";
  E_GPa: number;
  yield_MPa: number;
  ultimate_MPa: number;
  density_kgm3: number;
  elongation_pct: number;
  fatigueSigmaF_MPa?: number;
  fatigueB?: number;
  cte_1e6K?: number;
  poisson?: number;
  k_WmK?: number;
  cost_usd_per_kg: number;
  processes: ProcessId[];
  anisotropy?: { direction: "layup" | "print_layer"; knockdownFactor: number };
  recyclability: number;
  source: { citation: string };
  note: string;
};

export type ProcessRule = {
  id: string;
  check: "min_wall" | "max_hole_aspect" | "draft" | "undercut";
  severity: "error" | "warn";
  message: string;
};

export type Process = {
  id: ProcessId;
  name: string;
  minWall_mm: number;
  maxAspectRatio_hole: number;
  draftAngle_deg: number;
  machineRate_usd_per_hr: number;
  cycleTime_hr: number;
  setupCost_usd: number;
  toolingCost_usd: number;
  labor_usd: number;
  finishing_usd: number;
  scrapFactor: number;
  rules: ProcessRule[];
};

export const materials: Material[] = [
  {
    id: "al6061",
    name: "Aluminum 6061-T6",
    class: "metal",
    E_GPa: 68.9,
    yield_MPa: 276,
    ultimate_MPa: 310,
    density_kgm3: 2700,
    elongation_pct: 12,
    fatigueSigmaF_MPa: 650,
    fatigueB: -0.09,
    cte_1e6K: 23.6,
    poisson: 0.33,
    k_WmK: 167,
    cost_usd_per_kg: 4,
    processes: ["cnc_3axis", "sheet_metal_bend"],
    recyclability: 5,
    source: {
      citation:
        "Typical wrought 6061-T6 room-temperature properties as published in ASM-style overview tables (E 68.9 GPa, Fty about 276 MPa, Ftu about 310 MPa, density 2.70 g/cm³). Not an MMPDS A-basis minimum.",
    },
    note: "Fatigue coefficients are illustrative Basquin numbers, not a coupon test. Cost is a classroom price, not a quote.",
  },
  {
    id: "nylon66",
    name: "Nylon 6,6 (dry)",
    class: "polymer",
    E_GPa: 2.83,
    yield_MPa: 82,
    ultimate_MPa: 90,
    density_kgm3: 1140,
    elongation_pct: 40,
    cte_1e6K: 80,
    poisson: 0.4,
    k_WmK: 0.25,
    cost_usd_per_kg: 4,
    processes: ["cnc_3axis", "injection_mold", "fdm_print"],
    recyclability: 3,
    source: {
      citation:
        "Rounded dry, as-molded nylon 6,6 from public polymer overview tables (modulus near 2.8 GPa, tensile yield near 80 MPa, density near 1.14 g/cm³). Wet nylon is softer and weaker. Not a grade datasheet.",
    },
    note: "Cost is a classroom resin price, not a quote. Moisture is not in this model.",
  },
  {
    id: "pla",
    name: "PLA (printed, teaching)",
    class: "polymer",
    E_GPa: 3.5,
    yield_MPa: 50,
    ultimate_MPa: 55,
    density_kgm3: 1240,
    elongation_pct: 6,
    cost_usd_per_kg: 20,
    processes: ["fdm_print"],
    anisotropy: { direction: "print_layer", knockdownFactor: 0.6 },
    recyclability: 2,
    source: {
      citation:
        "Illustrative FDM PLA, not a filament grade. Printed strength depends on path, temperature, and layer bond. The 0.6 knockdown stands in for that bond. Do not use it as an allowables table.",
    },
    note: "Yield here is a classroom allowable after the layer knockdown is applied in the solver.",
  },
  {
    id: "carbon_tube",
    name: "Pultruded carbon tube",
    class: "composite",
    E_GPa: 120,
    yield_MPa: 400,
    ultimate_MPa: 600,
    density_kgm3: 1600,
    elongation_pct: 1.2,
    cost_usd_per_kg: 80,
    processes: ["composite_layup"],
    anisotropy: { direction: "layup", knockdownFactor: 1 },
    recyclability: 1,
    source: {
      citation:
        "Teaching longitudinal allowable for a pultruded carbon tube (fiber along the tube). Transverse and crush strength are much lower and this model does not check them. Not a certified laminate.",
    },
    note: "The 'yield' number is a compressive teaching allowable, not a metal yield point.",
  },
  {
    id: "balsa",
    name: "Balsa (low density)",
    class: "wood",
    E_GPa: 3.4,
    yield_MPa: 15,
    ultimate_MPa: 20,
    density_kgm3: 160,
    elongation_pct: 1,
    cost_usd_per_kg: 15,
    processes: ["cnc_3axis"],
    anisotropy: { direction: "layup", knockdownFactor: 1 },
    recyclability: 4,
    source: {
      citation:
        "Approximate low-density balsa, parallel to the grain, in the neighborhood of the USDA Forest Products Laboratory Wood Handbook (specific gravity near 0.16). A particular stick can be far off. Not a design value.",
    },
    note: "Grain is assumed along the beam. Cross-grain is not checked. Cost is a classroom price.",
  },
  {
    id: "steel1020",
    name: "Steel 1020 (cold drawn)",
    class: "metal",
    E_GPa: 200,
    yield_MPa: 350,
    ultimate_MPa: 420,
    density_kgm3: 7870,
    elongation_pct: 15,
    cte_1e6K: 12,
    poisson: 0.29,
    k_WmK: 51,
    cost_usd_per_kg: 1.5,
    processes: ["cnc_3axis", "sheet_metal_bend"],
    recyclability: 5,
    source: {
      citation:
        "Typical cold-drawn AISI 1020 overview values (E 200 GPa, yield near 350 MPa, density 7.87 g/cm³). Hot-rolled 1020 yields lower. Not a certified mill cert.",
    },
    note: "Included so the cost model has a cheap stiff metal. Classroom price, not a quote.",
  },
];

export const processes: Process[] = [
  {
    id: "cnc_3axis",
    name: "3-axis mill",
    minWall_mm: 0.8,
    maxAspectRatio_hole: 4,
    draftAngle_deg: 0,
    machineRate_usd_per_hr: 75,
    cycleTime_hr: 0.15,
    setupCost_usd: 50,
    toolingCost_usd: 0,
    labor_usd: 2,
    finishing_usd: 1,
    scrapFactor: 1.1,
    rules: [
      { id: "min_wall", check: "min_wall", severity: "warn", message: "Wall is under 0.8 mm. A 3-axis cutter will chatter or break it." },
      { id: "hole_aspect", check: "max_hole_aspect", severity: "warn", message: "Hole is deeper than 4 diameters. The drill wanders." },
      { id: "no_undercut", check: "undercut", severity: "error", message: "Undercut is not reachable with a 3-axis tool coming from one side." },
    ],
  },
  {
    id: "fdm_print",
    name: "FDM print",
    minWall_mm: 1.2,
    maxAspectRatio_hole: 8,
    draftAngle_deg: 0,
    machineRate_usd_per_hr: 8,
    cycleTime_hr: 3,
    setupCost_usd: 5,
    toolingCost_usd: 0,
    labor_usd: 1,
    finishing_usd: 0.5,
    scrapFactor: 1.05,
    rules: [
      { id: "min_wall", check: "min_wall", severity: "warn", message: "Wall is under 1.2 mm. A printed wall that thin misses layers." },
    ],
  },
  {
    id: "injection_mold",
    name: "Injection mold",
    minWall_mm: 1,
    maxAspectRatio_hole: 6,
    draftAngle_deg: 1,
    machineRate_usd_per_hr: 40,
    cycleTime_hr: 0.008,
    setupCost_usd: 100,
    toolingCost_usd: 12000,
    labor_usd: 0.2,
    finishing_usd: 0.3,
    scrapFactor: 1.05,
    rules: [
      { id: "min_wall", check: "min_wall", severity: "warn", message: "Wall is under 1 mm. The plastic freezes before it fills." },
      { id: "draft", check: "draft", severity: "error", message: "Draft is under 1°. The part sticks in the mold." },
    ],
  },
  {
    id: "composite_layup",
    name: "Composite tube",
    minWall_mm: 0.6,
    maxAspectRatio_hole: 4,
    draftAngle_deg: 0,
    machineRate_usd_per_hr: 40,
    cycleTime_hr: 1,
    setupCost_usd: 30,
    toolingCost_usd: 200,
    labor_usd: 8,
    finishing_usd: 2,
    scrapFactor: 1.15,
    rules: [
      { id: "min_wall", check: "min_wall", severity: "warn", message: "Wall is under 0.6 mm. A tube this thin crushes under a fitting." },
    ],
  },
  {
    id: "sheet_metal_bend",
    name: "Sheet metal bend",
    minWall_mm: 0.5,
    maxAspectRatio_hole: 3,
    draftAngle_deg: 0,
    machineRate_usd_per_hr: 50,
    cycleTime_hr: 0.05,
    setupCost_usd: 40,
    toolingCost_usd: 150,
    labor_usd: 1,
    finishing_usd: 0.4,
    scrapFactor: 1.2,
    rules: [
      { id: "min_wall", check: "min_wall", severity: "warn", message: "Sheet is under 0.5 mm. It will crease instead of holding a bend." },
    ],
  },
];

export const aeroModel = {
  cl0: 0.3,
  stall_deg: 12,
  cd0: 0.04,
  oswald: 0.8,
  /** Lumped η·(1−dε/dα)·(a_t/a_w). A teaching tail, not a vortex-lattice result. */
  tailFactor: 0.5,
  citation:
    "Lift slope is the thin-airfoil 2π per radian with a lifting-line finite-wing correction (Anderson-style). Stall at 12° and CD0 = 0.04 are stated teaching limits for a small cambered model, not a measured polar. Tail factor 0.5 lumps efficiency and downwash.",
};

export type ParamSpec = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
};

export type Mission = {
  id: string;
  title: string;
  brief: string;
  unlockAfter: string[];
  artifactType: "glider" | "drone_arm" | "water_rocket" | "rc_aircraft" | "payload";
  locked?: boolean;
  constraints: {
    maxMass_g?: number;
    maxCost_usd?: number;
    quantity?: number;
    minSafetyFactor?: number;
    maxDeflection_mm?: number;
    dfmScoreMin?: number;
    bodyMass_g?: number;
    armCount?: number;
  };
  requiredAnalyses: Array<"static_stress" | "buckling" | "aero_polar" | "stability" | "dfm" | "cost" | "modal">;
  environment: { rho_kgm3: number; g: number; temp_C: number };
  reflectionPrompts: string[];
  conceptIds: string[];
  parts: Array<{
    id: string;
    name: string;
    kind: GeomKind;
    params: Record<string, number>;
    specs: ParamSpec[];
    materialId: string;
    processId: ProcessId;
    loads: Array<{ id: string; kind: "axial" | "bending_tip" | "bending_center"; magnitude_N: number; k: number }>;
    liftFed?: boolean;
  }>;
  vehicle: null | {
    alpha_deg: number;
    speed_ms: number;
    cg_fromNose_mm: number;
    noseToWingLe_mm: number;
    wingId: string;
    tailId: string;
    fuselageId: string;
  };
};

const tubeSpecs: ParamSpec[] = [
  { key: "length_mm", label: "Length", min: 80, max: 220, step: 1, unit: "mm" },
  { key: "outer_mm", label: "Outer diameter", min: 8, max: 20, step: 0.5, unit: "mm" },
  { key: "wall_mm", label: "Wall", min: 0.6, max: 4, step: 0.1, unit: "mm" },
  { key: "draft_deg", label: "Draft", min: 0, max: 3, step: 0.5, unit: "°" },
  { key: "undercut", label: "Undercut (1 = yes)", min: 0, max: 1, step: 1, unit: "" },
  { key: "holeDia_mm", label: "Hole diameter", min: 2, max: 8, step: 0.5, unit: "mm" },
  { key: "holeDepth_mm", label: "Hole depth", min: 2, max: 30, step: 1, unit: "mm" },
];

const sparSpecs: ParamSpec[] = [
  { key: "length_mm", label: "Length", min: 300, max: 600, step: 5, unit: "mm" },
  { key: "outer_mm", label: "Outer diameter", min: 6, max: 16, step: 0.5, unit: "mm" },
  { key: "wall_mm", label: "Wall", min: 0.6, max: 3, step: 0.1, unit: "mm" },
  { key: "draft_deg", label: "Draft", min: 0, max: 3, step: 0.5, unit: "°" },
  { key: "undercut", label: "Undercut (1 = yes)", min: 0, max: 1, step: 1, unit: "" },
  { key: "holeDia_mm", label: "Hole diameter", min: 2, max: 8, step: 0.5, unit: "mm" },
  { key: "holeDepth_mm", label: "Hole depth", min: 2, max: 30, step: 1, unit: "mm" },
];

const finSpecs: ParamSpec[] = [
  { key: "span_mm", label: "Fin span", min: 60, max: 160, step: 2, unit: "mm" },
  { key: "chord_mm", label: "Root chord", min: 40, max: 100, step: 2, unit: "mm" },
  { key: "thickness_mm", label: "Thickness", min: 0.8, max: 4, step: 0.1, unit: "mm" },
];

const baySpecs: ParamSpec[] = [
  { key: "span_mm", label: "Span between rails", min: 120, max: 280, step: 5, unit: "mm" },
  { key: "chord_mm", label: "Plate width", min: 80, max: 160, step: 5, unit: "mm" },
  { key: "thickness_mm", label: "Thickness", min: 1, max: 5, step: 0.1, unit: "mm" },
];

export const missions: Mission[] = [
  {
    id: "glider",
    title: "Balsa glider",
    brief:
      "Hand-launch a small glider across the bay. It has to weigh under 120 g, stay under $90 in classroom prices, and keep a static margin between 5% and 25% of the chord.\n\nMost of that price is the mill's setup, not the wood. The wing is a solid plate. Half the lift is applied as one force at the tip of each half-span. A real wing's lift is spread out, so this moment is worse than the flying case.\n\nThe center of gravity starts too far forward. Move it until the margin sits in the band.\n\nYou are not certifying an airplane. You are learning which number moved, and why.",
    unlockAfter: [],
    artifactType: "glider",
    constraints: { maxMass_g: 120, maxCost_usd: 90, quantity: 1, minSafetyFactor: 1.5, maxDeflection_mm: 12, dfmScoreMin: 70 },
    requiredAnalyses: ["static_stress", "aero_polar", "stability", "dfm", "cost"],
    environment: { rho_kgm3: 1.225, g: 9.81, temp_C: 20 },
    reflectionPrompts: [
      "Name one tradeoff you made — mass, stiffness, stability, or cost — and what you gave up.",
      "Name one assumption the model is making that a real glider would violate.",
    ],
    conceptIds: ["lift", "stall", "margin", "inertia", "yield", "tooling"],
    parts: [
      {
        id: "wing",
        name: "Wing",
        kind: "plate",
        params: { span_mm: 500, chord_mm: 90, thickness_mm: 4 },
        specs: [
          { key: "span_mm", label: "Span", min: 300, max: 800, step: 10, unit: "mm" },
          { key: "chord_mm", label: "Chord", min: 50, max: 140, step: 2, unit: "mm" },
          { key: "thickness_mm", label: "Thickness", min: 1, max: 10, step: 0.5, unit: "mm" },
        ],
        materialId: "balsa",
        processId: "cnc_3axis",
        loads: [],
        liftFed: true,
      },
      {
        id: "fuselage",
        name: "Fuselage",
        kind: "box",
        params: { length_mm: 420, width_mm: 12, height_mm: 12 },
        specs: [
          { key: "length_mm", label: "Length", min: 280, max: 600, step: 10, unit: "mm" },
          { key: "width_mm", label: "Width", min: 8, max: 30, step: 1, unit: "mm" },
          { key: "height_mm", label: "Height", min: 8, max: 30, step: 1, unit: "mm" },
        ],
        materialId: "balsa",
        processId: "cnc_3axis",
        loads: [{ id: "launch", kind: "axial", magnitude_N: 12, k: 1 }],
      },
      {
        id: "tail",
        name: "Tail",
        kind: "plate",
        params: { span_mm: 160, chord_mm: 50, thickness_mm: 3 },
        specs: [
          { key: "span_mm", label: "Tail span", min: 80, max: 260, step: 5, unit: "mm" },
          { key: "chord_mm", label: "Tail chord", min: 30, max: 80, step: 2, unit: "mm" },
          { key: "thickness_mm", label: "Tail thickness", min: 1, max: 6, step: 0.5, unit: "mm" },
        ],
        materialId: "balsa",
        processId: "cnc_3axis",
        loads: [],
      },
    ],
    vehicle: {
      alpha_deg: 4,
      speed_ms: 8,
      cg_fromNose_mm: 120,
      noseToWingLe_mm: 120,
      wingId: "wing",
      tailId: "tail",
      fuselageId: "fuselage",
    },
  },
  {
    id: "drone_arm",
    title: "Drone arm",
    brief:
      "One arm of a small quad. A 40 N tip load stands in for a hard motor pull. The arm is a cantilever tube: fixed at the body, free at the motor.\n\nPass needs a safety factor of at least 2 on yield, tip sag at or under 8 mm, mass at or under 40 g, and a unit cost at or under $25 in classroom prices.\n\nQuantity is how many you buy, not how many arms the quad has. The airframe still counts four arms plus a 180 g body when it talks about thrust-to-weight.\n\nThe arm starts in dry nylon, which is too soft at this length. Aluminum mills. Nylon also molds. Watch what quantity does to the recommended process. Aluminum cannot be injection-molded in this shop.",
    unlockAfter: ["glider"],
    artifactType: "drone_arm",
    constraints: {
      maxMass_g: 40,
      maxCost_usd: 25,
      quantity: 10,
      minSafetyFactor: 2,
      maxDeflection_mm: 8,
      dfmScoreMin: 70,
      bodyMass_g: 180,
      armCount: 4,
    },
    requiredAnalyses: ["static_stress", "buckling", "dfm", "cost"],
    environment: { rho_kgm3: 1.225, g: 9.81, temp_C: 20 },
    reflectionPrompts: [
      "What did you change, and which constraint did that change help — and which did it hurt?",
      "Which assumption, if it were wrong, would make you distrust the safety factor?",
    ],
    conceptIds: ["yield", "inertia", "buckling", "dfm", "tooling", "resonance"],
    parts: [
      {
        id: "arm",
        name: "Arm",
        kind: "tube",
        params: {
          length_mm: 160,
          outer_mm: 12,
          wall_mm: 1.5,
          draft_deg: 1,
          undercut: 0,
          holeDia_mm: 4,
          holeDepth_mm: 10,
        },
        specs: tubeSpecs,
        materialId: "nylon66",
        processId: "cnc_3axis",
        loads: [
          { id: "thrust", kind: "bending_tip", magnitude_N: 40, k: 2 },
          { id: "landing", kind: "axial", magnitude_N: 25, k: 2 },
        ],
      },
    ],
    vehicle: null,
  },
  {
    id: "water_rocket",
    title: "Water rocket",
    brief:
      "A two-liter bottle, half full of water, about 4 bar in the headspace. Peak thrust is on the order of 60 to 100 N for under half a second; after that it is a ballistic coast to apogee.\n\nThe sim models none of that. It models one fin: a plate cantilever with a 10 N tip load standing in for the peak gust load as the rocket weathercocks off the rail. Fin flutter is not modeled — this check is static root stress and tip sag only.\n\nThe fin starts at 1.0 mm printed PLA. That is under the printer's 1.2 mm wall rule, and the root stress is past the knocked-down allowable. The ship carries three fins, so the mass and cost budgets are per fin.",
    unlockAfter: ["drone_arm"],
    artifactType: "water_rocket",
    constraints: {
      maxMass_g: 15,
      maxCost_usd: 30,
      quantity: 3,
      minSafetyFactor: 2,
      maxDeflection_mm: 6,
      dfmScoreMin: 70,
    },
    requiredAnalyses: ["static_stress", "dfm", "cost"],
    environment: { rho_kgm3: 1.225, g: 9.81, temp_C: 20 },
    reflectionPrompts: [
      "What did you change, and which constraint did that change help — and which did it hurt?",
      "The model checks static root stress. Name one failure mode of a real fin that this check cannot see.",
    ],
    conceptIds: ["yield", "inertia", "dfm", "tooling"],
    parts: [
      {
        id: "fin",
        name: "Fin",
        kind: "plate",
        params: {
          span_mm: 100,
          chord_mm: 60,
          thickness_mm: 1.0,
        },
        specs: finSpecs,
        materialId: "pla",
        processId: "fdm_print",
        loads: [{ id: "gust", kind: "bending_tip", magnitude_N: 10, k: 2 }],
      },
    ],
    vehicle: null,
  },
  {
    id: "rc_aircraft",
    title: "RC aircraft",
    brief:
      "A 1.2 kg trainer with a 900 mm span, built around a single spar. The sim models one half-span as a cantilever tube with half the weight — 6 N — as a tip load. Same convention as the glider's wing, and just as rough: ribs, sheeting, and torsion are not modeled.\n\nThe spar starts as an 8 mm aluminum tube with a 0.8 mm wall. Stress is fine. The tip sags about 22 mm against a 12 mm limit, and the ailerons would go mushy well before that. Carbon is stiffer per gram and much dearer; aluminum is cheap and honest. The classroom budget is $70. Pick your tradeoff.",
    unlockAfter: ["drone_arm"],
    artifactType: "rc_aircraft",
    constraints: {
      maxMass_g: 40,
      maxCost_usd: 70,
      quantity: 1,
      minSafetyFactor: 2.5,
      maxDeflection_mm: 12,
      dfmScoreMin: 70,
    },
    requiredAnalyses: ["static_stress", "dfm", "cost"],
    environment: { rho_kgm3: 1.225, g: 9.81, temp_C: 20 },
    reflectionPrompts: [
      "What did you change, and which constraint did that change help — and which did it hurt?",
      "The deflection limit sizes this spar, not the stress limit. In one sentence, say why.",
    ],
    conceptIds: ["yield", "inertia", "dfm", "tooling"],
    parts: [
      {
        id: "spar",
        name: "Wing spar",
        kind: "tube",
        params: {
          length_mm: 450,
          outer_mm: 8,
          wall_mm: 0.8,
          draft_deg: 1,
          undercut: 0,
          holeDia_mm: 4,
          holeDepth_mm: 10,
        },
        specs: sparSpecs,
        materialId: "al6061",
        processId: "cnc_3axis",
        loads: [{ id: "lift", kind: "bending_tip", magnitude_N: 6, k: 2 }],
      },
    ],
    vehicle: null,
  },
  {
    id: "payload",
    title: "Payload bay",
    brief:
      "The avionics bay: a flat plate on rails carrying the flight stack. At 6 g the 500 g stack pushes down with 30 N at the middle of the plate. The sim treats the plate as simply supported with a center load; the rails are assumed rigid, which flatters the answer.\n\nThe plate starts as 2 mm printed PLA. Stress passes with room to spare, but the middle sags about 3.7 mm against a 1.0 mm connector limit. Thin aluminum and thick plastic both get there — at different mass and cost.",
    unlockAfter: ["drone_arm"],
    artifactType: "payload",
    constraints: {
      maxMass_g: 120,
      maxCost_usd: 70,
      quantity: 1,
      minSafetyFactor: 2,
      maxDeflection_mm: 1.0,
      dfmScoreMin: 70,
    },
    requiredAnalyses: ["static_stress", "dfm", "cost"],
    environment: { rho_kgm3: 1.225, g: 9.81, temp_C: 20 },
    reflectionPrompts: [
      "What did you change, and which constraint did that change help — and which did it hurt?",
      "The rails are assumed rigid. What changes about the answer if they are not?",
    ],
    conceptIds: ["yield", "inertia", "dfm", "tooling"],
    parts: [
      {
        id: "bayplate",
        name: "Bay plate",
        kind: "plate",
        params: {
          span_mm: 200,
          chord_mm: 120,
          thickness_mm: 2.0,
        },
        specs: baySpecs,
        materialId: "pla",
        processId: "fdm_print",
        loads: [{ id: "stack", kind: "bending_center", magnitude_N: 30, k: 1 }],
      },
    ],
    vehicle: null,
  },
];

export const concepts: Record<string, { title: string; body: string }> = {
  yield: {
    title: "Yield",
    body: "Yield is the stress where the part takes a permanent set. Under it, letting go brings the shape back. Over it, the shape stays wrong. Safety factor is yield divided by the stress you actually have. Utilization is the inverse.",
  },
  inertia: {
    title: "Second moment of area",
    body: "Stiffness in bending follows I, not area. For a rectangle, I = b·h³/12. Double the thickness and I goes up eight times. Material near the middle is almost a passenger. The wall far from the center does the work.",
  },
  buckling: {
    title: "Buckling",
    body: "A long thin column can bow sideways before the material yields. Euler's load is π²EI/(KL)². K is 2 when one end is fixed and the other is free. Yield strength does not enter until the column is stocky.",
  },
  stall: {
    title: "Stall",
    body: "Lift slope holds only while the flow stays attached. Past the stall angle in this model, lift stops climbing and falls. The number is a teaching limit of 12°, not a tunnel polar.",
  },
  dfm: {
    title: "The tool has to reach",
    body: "A shape the solver likes can still be a shape the cutter, the nozzle, or the mold cannot make. An undercut on a 3-axis mill and a wall thinner than the process allows are that kind of miss.",
  },
  tooling: {
    title: "Setup and the mold",
    body: "A mold costs the same whether you buy ten parts or ten thousand. That cost is divided by quantity. Cycle time is not. At small quantity the mold loses. At large quantity the slow machine loses.",
  },
  margin: {
    title: "Static margin",
    body: "Static margin is how far the neutral point sits behind the center of gravity, divided by the chord. The target is 5% to 25%. Below 5%, restoring stability is weak and the glider is twitchy; below zero, it is statically unstable. Above 25%, the CG sits too far forward and the glider is nose-heavy and sluggish.",
  },
  lift: {
    title: "Lift",
    body: "Lift is ½ρV²S·CL. Speed is squared. Area and CL are not. CL here climbs with angle until stall, using a thin-airfoil slope corrected for a finite wing.",
  },
  resonance: {
    title: "First mode",
    body: "The L1 check is the first bending frequency of a cantilever. If a motor spins within 15% of that frequency, the arm is in the resonance flag. This is one mode, not a full modal survey.",
  },
};

export function materialById(id: string): Material {
  const found = materials.find((m) => m.id === id);
  if (!found) throw new Error(`Unknown material ${id}`);
  return found;
}

export function processById(id: string): Process {
  const found = processes.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown process ${id}`);
  return found;
}

export function missionById(id: string): Mission | undefined {
  return missions.find((m) => m.id === id);
}
