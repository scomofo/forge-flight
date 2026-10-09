import { Link } from "@tanstack/react-router";
import { Volume2, VolumeX, Award, Rocket, BookOpen } from "lucide-react";
import { lessons } from "@/course/catalog";
import { JOB_KEY } from "@/course/job";
import { useProgress } from "@/course/progress";
import { isPassed, lessonComplete, lessonKey } from "@/course/types";
import { useAudioStore, playClick } from "@/lib/audio";
import { useAchievements } from "@/course/achievements";

const intro = new Set(["physics", "materials", "engineering"]);

export function SiteHeader() {
  const completed = useProgress((s) => s.completed);
  const capstonePass = useProgress((s) => s.capstonePass);
  const hydrated = useProgress((s) => s.hydrated);
  const core = lessons.filter((lesson) => intro.has(lesson.track));
  const making = lessons.filter((lesson) => lesson.track === "manufacturing");
  const upper = lessons.filter((lesson) => lesson.track !== "manufacturing" && !intro.has(lesson.track));
  const coreDone = core.filter((lesson) => lessonComplete(lesson, completed[lessonKey(lesson.track, lesson.id)], capstonePass)).length;
  const makingDone = making.filter((lesson) => lessonComplete(lesson, completed[lessonKey(lesson.track, lesson.id)], capstonePass)).length;
  const upperDone = upper.filter((lesson) => lessonComplete(lesson, completed[lessonKey(lesson.track, lesson.id)], capstonePass)).length;
  const jobPassed = isPassed(completed[JOB_KEY]);
  const label = !hydrated
    ? "—"
    : coreDone === 0 && makingDone === 0 && upperDone === 0 && !jobPassed
      ? `${core.length} lessons`
      : jobPassed && coreDone === core.length && makingDone === making.length && upperDone === upper.length
        ? "All passed"
        : jobPassed && coreDone === core.length
          ? `Shelf specified · ${makingDone} of ${making.length} making · ${upperDone} of ${upper.length} upper`
          : `${coreDone} of ${core.length}${makingDone ? ` · ${makingDone} making` : ""}${upperDone ? ` · ${upperDone} upper` : ""}${jobPassed ? " · shelf passed" : ""}`;

  const audioEnabled = useAudioStore((s) => s.enabled);
  const toggleSound = useAudioStore((s) => s.toggleSound);
  const unlockedBadges = useAchievements((s) => s.unlockedBadges);

  return (
    <header className="border-b border-line bg-panel/80 backdrop-blur-md sticky top-0 z-30">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-serif text-xl text-ink hover:opacity-80 transition-opacity">
            <span className="inline-block size-2.5 rounded-sm bg-accent" aria-hidden />
            Forge & Flight · Axiom
          </Link>
          <nav className="hidden sm:flex items-center gap-3 text-xs font-medium">
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-muted hover:text-ink hover:bg-panel-2 transition-all"
            >
              <Rocket className="size-3.5" />
              <span>Hangar Bay</span>
            </Link>
            <Link
              to="/learn"
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-muted hover:text-ink hover:bg-panel-2 transition-all"
            >
              <BookOpen className="size-3.5" />
              <span>Course Catalog</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <p className="hidden md:block text-xs tabular-nums text-muted">
            {label}
          </p>
          <div className="flex items-center gap-1.5 rounded-full bg-brass/10 px-2.5 py-1 text-xs text-brass font-mono border border-brass/20">
            <Award className="size-3.5" />
            <span>{unlockedBadges.length}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              toggleSound();
              playClick();
            }}
            className="flex size-8 items-center justify-center rounded-md border border-line text-muted hover:text-ink hover:bg-panel-2 transition-all"
            aria-label={audioEnabled ? "Mute audio" : "Unmute audio"}
            title={audioEnabled ? "Sound enabled" : "Sound muted"}
          >
            {audioEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4 text-alarm" />}
          </button>
        </div>
      </div>
    </header>
  );
}
