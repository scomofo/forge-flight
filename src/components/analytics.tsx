import { useEffect, useRef } from "react";
import { useProgress } from "@/course/progress";
import { useForge } from "@/forge/store";
import { lessonsFor } from "@/course/catalog";
import { lessonComplete, lessonKey, type TrackId } from "@/course/types";

export function SkillRadar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const completed = useProgress((s) => s.completed);
  const capstonePass = useProgress((s) => s.capstonePass);
  const runs = useForge((s) => s.runs);

  // Compute 0..100 scores for 5 core dimensions
  const categories = [
    { label: "Physics", score: calculateTrackScore("physics" as TrackId, completed, capstonePass) },
    { label: "Materials", score: calculateTrackScore("materials" as TrackId, completed, capstonePass) },
    { label: "Mechanics", score: calculateTrackScore("engineering" as TrackId, completed, capstonePass) },
    { label: "Aerodynamics", score: calculateMissionScore("glider", runs) },
    { label: "DFM & Cost", score: calculateMissionScore("drone_arm", runs) },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 35;
    const total = categories.length;

    ctx.clearRect(0, 0, width, height);

    // Draw background concentric web
    const levels = 4;
    for (let level = 1; level <= levels; level++) {
      const r = (radius / levels) * level;
      ctx.beginPath();
      for (let i = 0; i < total; i++) {
        const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(180, 160, 120, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axis lines
    for (let i = 0; i < total; i++) {
      const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "rgba(180, 160, 120, 0.25)";
      ctx.stroke();

      // Category labels
      const labelX = centerX + (radius + 22) * Math.cos(angle);
      const labelY = centerY + (radius + 20) * Math.sin(angle);
      ctx.font = "11px system-ui, sans-serif";
      ctx.fillStyle = "#d4af37";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(categories[i].label, labelX, labelY);
    }

    // Draw student skill polygon
    ctx.beginPath();
    for (let i = 0; i < total; i++) {
      const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
      const pct = Math.max(0.1, categories[i].score / 100);
      const r = radius * pct;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.fillStyle = "rgba(212, 175, 55, 0.3)";
    ctx.fill();
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw vertices dots
    for (let i = 0; i < total; i++) {
      const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
      const pct = Math.max(0.1, categories[i].score / 100);
      const r = radius * pct;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#fff8e7";
      ctx.fill();
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [completed, capstonePass, runs]);

  return (
    <div className="flex flex-col items-center rounded-xl border border-line-forge bg-panel p-5 shadow-lg">
      <div className="w-full border-b border-line-forge/60 pb-3">
        <p className="font-forge text-xs uppercase tracking-wider text-brass">Competency Analytics</p>
        <h3 className="font-forge text-xl text-bone">Engineering Mastery Radar</h3>
      </div>
      <div className="mt-4 relative flex items-center justify-center">
        <canvas ref={canvasRef} width={280} height={260} className="max-w-full" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 w-full text-xs text-dust">
        {categories.map((cat) => (
          <div key={cat.label} className="flex justify-between rounded bg-panel-2 p-2">
            <span>{cat.label}</span>
            <span className="font-mono text-bone">{Math.round(cat.score)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function calculateTrackScore(trackId: TrackId, completed: Record<string, number | undefined>, capstonePass: boolean): number {
  const trackLessons = lessonsFor(trackId);
  if (trackLessons.length === 0) return 0;
  const passed = trackLessons.filter((lesson) =>
    lessonComplete(lesson, completed[lessonKey(trackId, lesson.id)] as number | undefined, capstonePass),
  ).length;
  return (passed / trackLessons.length) * 100;
}

function calculateMissionScore(missionId: string, runs: Record<string, { sealedCount?: number; bestScore?: number }>): number {
  const run = runs[missionId];
  if (!run) return 0;
  if (run.sealedCount && run.sealedCount >= 3) return 100;
  if (run.bestScore) return run.bestScore;
  if (run.sealedCount) return Math.min(90, run.sealedCount * 30);
  return 20;
}
