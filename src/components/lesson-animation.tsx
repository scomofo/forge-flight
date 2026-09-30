import { useEffect, useId, useRef, useState } from "react";
import { animationAssets, type AnimationId } from "@/course/animation-assets";

/**
 * Opt-in, local-only teaching media. It never starts simply because it scrolled
 * into view. Native video controls provide pause, seeking and full-screen.
 * Copy this file to src/components/lesson-animation.tsx and the manifest to
 * src/course/animation-assets.ts. All media paths are under public/learn-media.
 */
export function LessonAnimation({ id }: { id: AnimationId }) {
  return <AnimationMedia key={id} id={id} />;
}

function AnimationMedia({ id }: { id: AnimationId }) {
  const asset = animationAssets[id];
  const descriptionId = useId();
  const video = useRef<HTMLVideoElement>(null);
  const [motion, setMotion] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stopOnPreferenceChange = () => {
      if (preference.matches) setMotion(false);
    };
    const pauseWhenHidden = () => {
      if (document.hidden) video.current?.pause();
    };
    preference.addEventListener("change", stopOnPreferenceChange);
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => {
      preference.removeEventListener("change", stopOnPreferenceChange);
      document.removeEventListener("visibilitychange", pauseWhenHidden);
    };
  }, []);

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-line bg-surface">
      {motion ? (
        <video
          key={id}
          ref={video}
          src={asset.mp4}
          poster={asset.poster}
          width={asset.width}
          height={asset.height}
          className="block h-auto w-full"
          controls
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-label={asset.title}
          aria-describedby={descriptionId}
          onError={() => {
            setMotion(false);
            setError(true);
          }}
        />
      ) : (
        <img
          src={asset.poster}
          width={asset.width}
          height={asset.height}
          className="block h-auto w-full"
          loading="lazy"
          alt={asset.alt}
        />
      )}
      <figcaption className="px-4 pb-4 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink">
            {asset.title} · {asset.duration}s
          </p>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-line px-4 py-2 text-sm font-medium text-accent"
            onClick={() => {
              setError(false);
              setMotion((current) => !current);
            }}
            aria-pressed={motion}
          >
            {motion ? "Show still image" : "Play animation"}
          </button>
        </div>
        {error ? (
          <p role="status" className="mt-2 text-sm text-muted">
            The animation could not load. The still and explanation are available.
          </p>
        ) : null}
        <p id={descriptionId} className="mt-3 text-sm leading-relaxed text-muted">
          {asset.takeaway}
        </p>
        <details className="mt-3 text-sm leading-relaxed text-muted">
          <summary className="min-h-11 cursor-pointer py-2 text-ink">
            Read the sequence and model limits
          </summary>
          <p>{asset.alt}</p>
          <p className="mt-2">{asset.notes}</p>
        </details>
      </figcaption>
    </figure>
  );
}
