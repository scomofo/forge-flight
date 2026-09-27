export type Family = "metal" | "ceramic" | "polymer" | "composite";

export type Stock = {
  id: string;
  name: string;
  family: Family;
  density: number;
  modulus: number;
  strength: number;
  temp: number;
  note: string;
};

export const stocks: Stock[] = [
  {
    id: "pine",
    name: "Pine",
    family: "composite",
    density: 0.5,
    modulus: 10,
    strength: 40,
    temp: 120,
    note: "A natural composite. These numbers assume the load runs with the grain.",
  },
  {
    id: "hdpe",
    name: "HDPE",
    family: "polymer",
    density: 0.95,
    modulus: 0.8,
    strength: 25,
    temp: 80,
    note: "Cheap, tough, and easy to mold. It softens early.",
  },
  {
    id: "epoxy",
    name: "Epoxy",
    family: "polymer",
    density: 1.2,
    modulus: 3,
    strength: 60,
    temp: 90,
    note: "More often a matrix than a structure. Brittle next to HDPE.",
  },
  {
    id: "cfrp",
    name: "Carbon fiber",
    family: "composite",
    density: 1.55,
    modulus: 140,
    strength: 1500,
    temp: 120,
    note: "Along the fiber. Across the fiber this point would sit much lower.",
  },
  {
    id: "al",
    name: "Aluminum",
    family: "metal",
    density: 2.7,
    modulus: 69,
    strength: 275,
    temp: 150,
    note: "6061-T6 territory. Light for a metal, with a modest modulus.",
  },
  {
    id: "glass",
    name: "Glass",
    family: "ceramic",
    density: 2.5,
    modulus: 70,
    strength: 50,
    temp: 450,
    note: "Tensile strength, limited by flaws. Far stronger in compression.",
  },
  {
    id: "alumina",
    name: "Alumina",
    family: "ceramic",
    density: 3.9,
    modulus: 300,
    strength: 300,
    temp: 1400,
    note: "Stiff, hot, and brittle. A furnace lining, not a spring.",
  },
  {
    id: "ti",
    name: "Titanium",
    family: "metal",
    density: 4.43,
    modulus: 114,
    strength: 900,
    temp: 400,
    note: "Grade-5 territory. Strength without steel’s density. Cost is not on this chart.",
  },
  {
    id: "steel",
    name: "Mild steel",
    family: "metal",
    density: 7.85,
    modulus: 200,
    strength: 400,
    temp: 400,
    note: "The default metal: stiff, formable, heavy, and inexpensive.",
  },
  {
    id: "copper",
    name: "Copper",
    family: "metal",
    density: 8.96,
    modulus: 110,
    strength: 210,
    temp: 200,
    note: "Chosen for conduction, not for being light or especially stiff.",
  },
];

export function specificStrength(s: Stock) {
  return s.strength / s.density;
}
