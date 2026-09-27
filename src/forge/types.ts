export type ProcessId = "cnc_3axis" | "fdm_print" | "injection_mold" | "composite_layup" | "sheet_metal_bend";

export type GeomKind = "tube" | "plate" | "box";

export type AnalysisKind = "static_stress" | "buckling" | "modal" | "aero_polar" | "stability" | "thermal" | "dfm" | "cost";

export type Phase = "brief" | "design" | "materials" | "simulate" | "make" | "test" | "review";

export const PHASES: Phase[] = ["brief", "design", "materials", "simulate", "make", "test", "review"];

export type LoadKind = "axial" | "bending_tip" | "bending_center";
