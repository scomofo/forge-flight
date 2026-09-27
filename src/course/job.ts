export const JOB_KEY = "job/shelf";

export const shelfBrief = {
  spanM: 1.2,
  loadN: 400,
  depthM: 0.22,
  sagLimitMm: 4.8,
  minSafety: 2,
  maxMassKg: 8,
  thicknessMinMm: 6,
  thicknessMaxMm: 40,
} as const;

export const shelfMaterials = [
  { id: "wood", name: "Wood", eGpa: 10, allowMpa: 40, density: 700 },
  { id: "aluminum", name: "Aluminum", eGpa: 69, allowMpa: 150, density: 2700 },
  { id: "steel", name: "Steel", eGpa: 200, allowMpa: 250, density: 7800 },
  { id: "acrylic", name: "Acrylic", eGpa: 3, allowMpa: 70, density: 1180 },
] as const;

export type ShelfMaterialId = (typeof shelfMaterials)[number]["id"];

function round(n: number, digits: number) {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

export function evaluateShelf(id: ShelfMaterialId, thicknessMm: number) {
  const mat = shelfMaterials.find((m) => m.id === id) ?? shelfMaterials[0];
  const h = thicknessMm / 1000;
  const { spanM: L, loadN: P, depthM: b } = shelfBrief;
  const inertia = (b * h ** 3) / 12;
  const moment = (P * L) / 4;
  const stressMpa = (6 * moment) / (b * h * h) / 1e6;
  const sagMm = ((P * L ** 3) / (48 * mat.eGpa * 1e9 * inertia)) * 1000;
  const massKg = mat.density * b * h * L;
  const stressShown = round(stressMpa, 2);
  const safetyShown = round(mat.allowMpa / stressShown, 2);
  const sagShown = round(sagMm, 1);
  const massShown = round(massKg, 1);
  const passStress = safetyShown >= shelfBrief.minSafety;
  const passSag = sagShown <= shelfBrief.sagLimitMm;
  const passMass = massShown <= shelfBrief.maxMassKg;
  return {
    mat,
    h,
    inertia,
    moment,
    stressShown,
    safetyShown,
    sagShown,
    massShown,
    passStress,
    passSag,
    passMass,
    pass: passStress && passSag && passMass,
  };
}

export const jobChecks = [
  {
    prompt: "A 12 mm steel board is strong and barely sags. Why does the brief still reject it?",
    options: [
      "Steel cannot be used as a beam",
      "The mass is over 8 kg",
      "The safety factor has to be less than 2",
      "400 N is not a force",
    ],
    answer: 1,
    why: "Strength and sag can both pass while the board is still too heavy to carry. Mass is its own screen. More thickness would make the mass worse.",
  },
  {
    prompt: "A 20 mm wood board is light and has a safety factor above 2. Why is it not yet acceptable?",
    options: [
      "Wood is not a structural material",
      "The span should be shortened",
      "The sag is more than 4.8 mm",
      "The load is at the ends, not the center",
    ],
    answer: 2,
    why: "Passing stress is not passing stiffness. At 20 mm the sag is about 9.8 mm. Thickness cubed is what brings the sag down.",
  },
  {
    prompt: "In this job, safety factor means…",
    options: [
      "Allowable stress divided by the bending stress from the 400 N load",
      "Mass divided by 8 kg",
      "Span divided by sag",
      "How many books fit on the shelf",
    ],
    answer: 0,
    why: "The requirement is that this ratio is at least 2. It says nothing, by itself, about sag or mass.",
  },
  {
    prompt: "Why is the span locked at 1.2 m?",
    options: [
      "The formula only works at 1.2 m",
      "A shorter span would sag more",
      "The opening is already 1.2 m. That is a constraint, not a preference",
      "Mass does not change if the span changes",
    ],
    answer: 2,
    why: "The wall opening is given. Shortening it would be a different room. You only get to choose the material and the thickness.",
  },
] as const;
