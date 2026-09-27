import { materials, processes } from "@/forge/content/catalog";
import { runAnalysis, type DesignInput } from "@/forge/sim/evaluate";
import type { AnalysisKind } from "@/forge/types";

export type WorkerRequest = { id: number; kind: AnalysisKind; input: DesignInput };

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const started = performance.now();
  const result = runAnalysis(event.data.kind, event.data.input, materials, processes);
  result.computeMs = performance.now() - started;
  self.postMessage({ id: event.data.id, result });
};
