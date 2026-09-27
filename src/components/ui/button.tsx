import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost" | "quiet";
};

export function Button({
  variant = "solid",
  className,
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:cursor-default disabled:opacity-40",
        variant === "solid" && "bg-accent text-accent-ink",
        variant === "ghost" && "border border-line bg-surface text-ink",
        variant === "quiet" && "px-2 text-muted",
        className,
      )}
      {...props}
    />
  );
}
