import { cn } from "@/lib/utils"

type LogoMarkProps = {
  className?: string
  size?: "nav" | "footer" | "intro"
  state?: "apart" | "locked"
  inverted?: boolean
}

export function LogoMark({
  className,
  size = "nav",
  state = "locked",
  inverted = false,
}: LogoMarkProps) {
  const sizeClass =
    size === "intro"
      ? "text-[clamp(3.4rem,11vw,8.5rem)]"
      : size === "footer"
        ? "text-[1.65rem]"
        : "text-[1.15rem]"

  return (
    <span
      className={cn(
        "logo-mark relative inline-grid select-none items-center",
        "grid-cols-[0.92em_1.12em_0.38em] grid-rows-2",
        sizeClass,
        inverted ? "text-background" : "text-foreground",
        className,
      )}
      data-state={state}
      aria-label="TOIMOI"
    >
      <span className="display col-start-1 row-start-1 justify-self-end pr-[0.06em] leading-none tracking-[0.08em]">
        T
      </span>
      <span className="display col-start-3 row-start-1 leading-none tracking-[0.08em]">
        I
      </span>
      <span className="display col-start-1 row-start-2 justify-self-end pr-[0.06em] leading-none tracking-[0.08em]">
        M
      </span>
      <span className="display col-start-3 row-start-2 leading-none tracking-[0.08em]">
        I
      </span>
      <svg
        className="col-start-2 row-span-2 row-start-1 h-[1.72em] w-[1.12em] self-center"
        viewBox="0 0 112 168"
        fill="none"
        aria-hidden
      >
        <circle
          className="logo-ring logo-ring-top"
          cx="56"
          cy="64"
          r="32"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <circle
          className="logo-ring logo-ring-bottom"
          cx="56"
          cy="104"
          r="32"
          stroke="currentColor"
          strokeWidth="2.2"
        />
      </svg>
    </span>
  )
}
