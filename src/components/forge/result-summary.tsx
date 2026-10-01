import type { DesignInput, Evaluation } from "@/forge/sim/evaluate";
import { evaluationMessages, evaluationSummary } from "@/forge/sim/result-messages";

export function ResultSummary({ evaluation, limits }: { evaluation: Evaluation; limits: DesignInput["limits"] }) {
  const messages = evaluationMessages(evaluation, limits);
  return <section aria-label="Virtual check result" aria-live="polite" className="space-y-2" data-virtual-result>
    <p className="font-medium">{evaluationSummary(evaluation)}</p>
    {messages.length > 0 && <ul className="space-y-2">{messages.map((message, i) => <li key={`${i}-${message}`}>{message}</li>)}</ul>}
  </section>;
}
export function VirtualTestLimit({ glider = false }: { glider?: boolean }) {
  return <p className="text-sm text-dust" data-virtual-test-limit>
    This virtual check uses the model’s equations. It is not a physical measurement or independent validation. Interpret the result with the stated assumptions and model-validity warnings.
    {glider && " The displayed path is a longitudinal glide from 8 m, not a full flight simulation."}
  </p>;
}
