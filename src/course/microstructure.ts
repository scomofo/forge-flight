/**
 * Pure microstructure logic for Materials 101, Week 12.
 *
 * No UI here: crystal-structure arithmetic (atoms per cell, packing
 * efficiency, lattice parameter, theoretical density) and the Hall–Petch
 * grain-size estimate. All functions are unit-tested in
 * materials-w12.test.ts.
 */

export type CrystalStructure = "sc" | "bcc" | "fcc" | "hcp";

export const STRUCTURES: Record<
  CrystalStructure,
  {
    label: string;
    /** Atoms counted inside one conventional unit cell. */
    atomsPerCell: number;
    /** Nearest neighbors of one atom. */
    coordination: number;
    /** Fraction of the cell volume actually occupied by atoms. */
    packing: number;
    /** Independent slip systems available for plastic flow. */
    slipSystems: number;
    examples: string;
  }
> = {
  sc: {
    label: "Simple cubic",
    atomsPerCell: 1,
    coordination: 6,
    packing: 0.52,
    slipSystems: 6,
    examples: "Polonium — the only element that does this",
  },
  bcc: {
    label: "Body-centered cubic",
    atomsPerCell: 2,
    coordination: 8,
    packing: 0.68,
    slipSystems: 12,
    examples: "α-iron, chromium, tungsten, molybdenum",
  },
  fcc: {
    label: "Face-centered cubic",
    atomsPerCell: 4,
    coordination: 12,
    packing: 0.74,
    slipSystems: 12,
    examples: "Aluminum, copper, nickel, lead, gold, γ-iron",
  },
  hcp: {
    label: "Hexagonal close-packed",
    atomsPerCell: 6,
    coordination: 12,
    packing: 0.74,
    slipSystems: 3,
    examples: "Magnesium, titanium, zinc, cobalt",
  },
};

/**
 * Lattice parameter a (in pm) of the conventional cell from the atomic
 * radius (in pm), assuming hard touching spheres:
 * SC: a = 2r · BCC: a = 4r/√3 · FCC: a = 2√2·r · HCP: a = 2r.
 */
export function latticeParameterPm(structure: CrystalStructure, radiusPm: number): number {
  switch (structure) {
    case "sc":
      return 2 * radiusPm;
    case "bcc":
      return (4 * radiusPm) / Math.sqrt(3);
    case "fcc":
      return 2 * Math.SQRT2 * radiusPm;
    case "hcp":
      return 2 * radiusPm;
  }
}

/** Volume of a cubic conventional cell with edge a (pm), in cm³. */
export function cubicCellVolumeCm3(aPm: number): number {
  const aCm = aPm * 1e-10;
  return aCm ** 3;
}

/**
 * Volume of the conventional hexagonal cell (6 atoms) with basal
 * parameter a (pm) and ideal c/a = 1.633, in cm³.
 */
export function hcpCellVolumeCm3(aPm: number, cOverA = 1.633): number {
  const aCm = aPm * 1e-10;
  const cCm = aCm * cOverA;
  return ((3 * Math.sqrt(3)) / 2) * aCm * aCm * cCm;
}

const AVOGADRO = 6.02214076e23;

/**
 * Theoretical density (g/cm³) from molar mass, atoms per cell, and the
 * conventional cell volume. Structure alone predicts the datasheet number.
 */
export function theoreticalDensity(
  gPerMol: number,
  atomsPerCell: number,
  cellVolumeCm3: number,
): number {
  const massPerCellG = (atomsPerCell * gPerMol) / AVOGADRO;
  return massPerCellG / cellVolumeCm3;
}

/**
 * Hall–Petch estimate of yield strength (MPa) from the friction stress
 * σ₀ (MPa), the Hall–Petch slope k (MPa·√m), and the mean grain
 * diameter d (µm). Finer grains → higher yield, down to the
 * nanocrystalline regime where the relation breaks.
 */
export function hallPetch(sigma0MPa: number, kMPaSqrtM: number, dUm: number): number {
  return sigma0MPa + kMPaSqrtM / Math.sqrt(dUm * 1e-6);
}

/**
 * Grain-boundary area per unit volume (m²/m³) for roughly equiaxed
 * grains of diameter d (µm). Stereology gives ≈ 2/d; it is the reason
 * "fine grained" is a strength specification.
 */
export function boundaryAreaPerVolume(dUm: number): number {
  return 2 / (dUm * 1e-6);
}
