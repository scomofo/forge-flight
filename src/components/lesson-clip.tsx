import { useState } from "react";
import type { Clip } from "@/course/types";

const idOk = /^[A-Za-z0-9_-]{11}$/;

export function LessonClip({ clip }: { clip: Clip }) {
  const [open, setOpen] = useState(false);
  const youtube = clip.youtubeId && idOk.test(clip.youtubeId) ? clip.youtubeId : "";
  const params = new URLSearchParams({ rel: "0" });
  if (clip.start) params.set("start", String(clip.start));
  if (clip.end) params.set("end", String(clip.end));
  const embed = youtube ? `https://www.youtube-nocookie.com/embed/${youtube}?${params.toString()}` : "";
  const playable = Boolean(clip.src || embed);

  return (
    <aside className="mt-10 border-t border-line pt-8">
      <p className="text-sm font-medium text-accent">A look, not the lesson</p>
      <h2 className="mt-2 font-serif text-2xl text-ink">See it happen</h2>
      <p className="mt-3 max-w-prose leading-relaxed text-ink">Watch for this: {clip.watch}</p>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">Leave the rest. {clip.leave}</p>
      {clip.src ? (
        <video
          className="mt-4 aspect-video w-full rounded-lg bg-well"
          src={clip.src}
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
        />
      ) : playable && open ? (
        <div className="mt-4 aspect-video overflow-hidden rounded-lg bg-well">
          <iframe
            className="h-full w-full"
            src={embed}
            title={clip.title}
            allow="accelerometer; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={!playable}
          className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-line bg-surface px-4 text-sm font-medium text-ink"
        >
          Show the clip
        </button>
      )}
      <p className="mt-3 text-sm text-muted">
        {clip.title}. {clip.channel}.
        {clip.src ? " Six seconds, looping. Then use the bench." : ""}
      </p>
    </aside>
  );
}
