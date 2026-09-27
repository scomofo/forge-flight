import { runAnalysis, type DesignInput, type SimResult } from "@/forge/sim/evaluate";
import { materials, processes } from "@/forge/content/catalog";
import type { AnalysisKind } from "@/forge/types";

let worker: Worker | null = null;
let seq = 0;

export function runInWorker(kind: AnalysisKind, input: DesignInput): Promise<SimResult> {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return Promise.resolve(runAnalysis(kind, input, materials, processes));
  }
  worker ??= new Worker(new URL("../workers/sim.worker.ts", import.meta.url), { type: "module" });
  const id = ++seq;
  return new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent<{ id: number; result: SimResult }>) => {
      if (event.data.id !== id) return;
      worker?.removeEventListener("message", onMessage);
      resolve(event.data.result);
    };
    worker?.addEventListener("message", onMessage);
    worker?.addEventListener("error", () => reject(new Error("solver worker failed")), { once: true });
    worker?.postMessage({ id, kind, input });
  });
}
