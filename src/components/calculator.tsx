import { useState } from "react";
import { Calculator as CalcIcon, X } from "lucide-react";
import { playClick, playSlider } from "@/lib/audio";

export function EngineeringCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"beam" | "area" | "aero" | "safety">("beam");

  // Beam state
  const [loadN, setLoadN] = useState(100);
  const [lengthMm, setLengthMm] = useState(200);
  const [youngsGpa, setYoungsGpa] = useState(69); // Aluminum default
  const [inertiaMm4, setInertiaMm4] = useState(1000);

  // Inertia state
  const [widthMm, setWidthMm] = useState(12);
  const [heightMm, setHeightMm] = useState(12);

  // Aero state
  const [speedMs, setSpeedMs] = useState(10);
  const [areaM2, setAreaM2] = useState(0.045);
  const [cl, setCl] = useState(0.6);

  // Safety state
  const [allowableMPa, setAllowableMPa] = useState(250);
  const [actualMPa, setActualMPa] = useState(120);

  // Calculated values
  const E_Pa = youngsGpa * 1e9;
  const I_m4 = inertiaMm4 * 1e-12;
  const L_m = lengthMm / 1000;
  const cantileverDeflMm = (loadN * Math.pow(L_m, 3)) / (3 * E_Pa * I_m4) * 1000;
  const maxBendingMomentNm = loadN * L_m;

  const rectI_mm4 = (widthMm * Math.pow(heightMm, 3)) / 12;

  const rho = 1.225; // Sea level air density
  const liftN = 0.5 * rho * Math.pow(speedMs, 2) * areaM2 * cl;

  const sf = actualMPa > 0 ? allowableMPa / actualMPa : 0;
  const marginPct = (sf - 1) * 100;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          playClick();
          setIsOpen(true);
        }}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full border border-brass/50 bg-panel/90 px-4 py-2.5 font-forge text-sm text-brass shadow-xl backdrop-blur-md hover:bg-brass hover:text-brass-ink transition-all"
      >
        <CalcIcon className="size-4" />
        <span>Engineering Calc</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 w-80 sm:w-96 rounded-xl border border-brass/40 bg-panel/95 p-4 shadow-2xl backdrop-blur-md text-bone text-sm animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between border-b border-line-forge pb-2">
        <div className="flex items-center gap-2 font-forge text-brass">
          <CalcIcon className="size-4" />
          <span>Engineering Quick Workbench</span>
        </div>
        <button
          type="button"
          onClick={() => {
            playClick();
            setIsOpen(false);
          }}
          className="rounded p-1 text-dust hover:text-bone"
          aria-label="Close calculator"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex gap-1 border-b border-line-forge/60 pb-2">
        {(
          [
            ["beam", "Bending"],
            ["area", "Area (I)"],
            ["aero", "Aero"],
            ["safety", "Safety Factor"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              playClick();
              setTab(key);
            }}
            className={`flex-1 rounded px-2 py-1 text-xs font-forge transition-colors ${
              tab === key ? "bg-brass text-brass-ink" : "bg-panel-2 text-dust hover:text-bone"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-3">
        {tab === "beam" && (
          <>
            <p className="text-xs text-dust">Cantilever beam end deflection: δ = (F · L³) / (3 · E · I)</p>
            <div className="space-y-2 text-xs">
              <label className="flex justify-between items-center">
                <span className="text-dust">Load (F):</span>
                <span className="font-mono text-bone">{loadN} N</span>
              </label>
              <input
                type="range"
                min={1}
                max={1000}
                value={loadN}
                onChange={(e) => {
                  setLoadN(Number(e.target.value));
                  playSlider(Number(e.target.value) / 1000);
                }}
                className="w-full"
              />

              <label className="flex justify-between items-center">
                <span className="text-dust">Length (L):</span>
                <span className="font-mono text-bone">{lengthMm} mm</span>
              </label>
              <input
                type="range"
                min={10}
                max={1000}
                value={lengthMm}
                onChange={(e) => {
                  setLengthMm(Number(e.target.value));
                  playSlider(Number(e.target.value) / 1000);
                }}
                className="w-full"
              />

              <label className="flex justify-between items-center">
                <span className="text-dust">Young's Modulus (E):</span>
                <span className="font-mono text-bone">{youngsGpa} GPa</span>
              </label>
              <input
                type="range"
                min={1}
                max={210}
                value={youngsGpa}
                onChange={(e) => setYoungsGpa(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="rounded-lg bg-panel-2 p-3 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-dust">Max Bending Moment:</span>
                <span className="text-brass">{maxBendingMomentNm.toFixed(2)} N·m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dust">Tip Sag (δ):</span>
                <span className="text-brass">{cantileverDeflMm.toFixed(2)} mm</span>
              </div>
            </div>
          </>
        )}

        {tab === "area" && (
          <>
            <p className="text-xs text-dust">Rectangular cross-section: I = (b · h³) / 12</p>
            <div className="space-y-2 text-xs">
              <label className="flex justify-between items-center">
                <span className="text-dust">Width (b):</span>
                <span className="font-mono text-bone">{widthMm} mm</span>
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={widthMm}
                onChange={(e) => setWidthMm(Number(e.target.value))}
                className="w-full"
              />

              <label className="flex justify-between items-center">
                <span className="text-dust">Height/Thickness (h):</span>
                <span className="font-mono text-bone">{heightMm} mm</span>
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={heightMm}
                onChange={(e) => setHeightMm(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="rounded-lg bg-panel-2 p-3 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-dust">Area (A):</span>
                <span className="text-bone">{(widthMm * heightMm).toFixed(1)} mm²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dust">Second Moment (I):</span>
                <span className="text-brass">{rectI_mm4.toFixed(1)} mm⁴</span>
              </div>
            </div>
          </>
        )}

        {tab === "aero" && (
          <>
            <p className="text-xs text-dust">Aerodynamic lift: L = 0.5 · ρ · V² · S · C_L (ρ = 1.225 kg/m³)</p>
            <div className="space-y-2 text-xs">
              <label className="flex justify-between items-center">
                <span className="text-dust">Airspeed (V):</span>
                <span className="font-mono text-bone">{speedMs} m/s</span>
              </label>
              <input
                type="range"
                min={2}
                max={40}
                value={speedMs}
                onChange={(e) => setSpeedMs(Number(e.target.value))}
                className="w-full"
              />

              <label className="flex justify-between items-center">
                <span className="text-dust">Wing Area (S):</span>
                <span className="font-mono text-bone">{areaM2} m²</span>
              </label>
              <input
                type="range"
                min={0.01}
                max={0.5}
                step={0.005}
                value={areaM2}
                onChange={(e) => setAreaM2(Number(e.target.value))}
                className="w-full"
              />

              <label className="flex justify-between items-center">
                <span className="text-dust">Lift Coefficient (C_L):</span>
                <span className="font-mono text-bone">{cl}</span>
              </label>
              <input
                type="range"
                min={0.1}
                max={1.8}
                step={0.05}
                value={cl}
                onChange={(e) => setCl(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="rounded-lg bg-panel-2 p-3 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-dust">Generated Lift (L):</span>
                <span className="text-brass">{liftN.toFixed(2)} N</span>
              </div>
            </div>
          </>
        )}

        {tab === "safety" && (
          <>
            <p className="text-xs text-dust">Safety Factor SF = σ_allow / σ_calc, Margin = SF - 1</p>
            <div className="space-y-2 text-xs">
              <label className="flex justify-between items-center">
                <span className="text-dust">Allowable Strength (σ_allow):</span>
                <span className="font-mono text-bone">{allowableMPa} MPa</span>
              </label>
              <input
                type="range"
                min={10}
                max={1000}
                value={allowableMPa}
                onChange={(e) => setAllowableMPa(Number(e.target.value))}
                className="w-full"
              />

              <label className="flex justify-between items-center">
                <span className="text-dust">Calculated Stress (σ_calc):</span>
                <span className="font-mono text-bone">{actualMPa} MPa</span>
              </label>
              <input
                type="range"
                min={1}
                max={1000}
                value={actualMPa}
                onChange={(e) => setActualMPa(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="rounded-lg bg-panel-2 p-3 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-dust">Safety Factor (SF):</span>
                <span className={sf >= 1.5 ? "text-brass font-bold" : "text-alarm"}>
                  {sf.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dust">Safety Margin:</span>
                <span className={marginPct >= 0 ? "text-bone" : "text-alarm"}>
                  {marginPct.toFixed(0)}%
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
