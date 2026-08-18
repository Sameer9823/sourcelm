"use client";

import { cn } from "@/lib/utils";

export function SovyniqLogo({
  className,
  size = "md",
  showText = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}) {
  const sizeClasses = {
    sm: "size-5",
    md: "size-7",
    lg: "size-9",
    xl: "size-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  return (
    <span className={cn("flex items-center gap-2", className)} aria-label="Sovyniq">
      <svg
        className={cn(sizeClasses[size], "flex-shrink-0")}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sovyniqGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#D946EF" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        {/* Abstract "S" / knowledge node shape */}
        <path
          d="M16 4 C22 4 26 8 26 14 C26 18 23 21 18 23 C13 25 8 23 8 17 C8 12 11 9 16 9 C19 9 21 11 21 14 C21 17 19 19 16 19 C12 19 10 16 10 13 C10 10 13 8 16 8"
          stroke="url(#sovyniqGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Central node */}
        <circle cx="16" cy="16" r="3" fill="url(#sovyniqGradient)" />
        {/* Orbit dots */}
        <circle cx="22" cy="10" r="1.5" fill="#8B5CF6" opacity="0.8" />
        <circle cx="24" cy="20" r="1.5" fill="#D946EF" opacity="0.8" />
        <circle cx="8" cy="22" r="1.5" fill="#06B6D4" opacity="0.8" />
      </svg>
      {showText && (
        <span className={cn("font-heading font-semibold tracking-tight", textSizeClasses[size], "bg-sovyniq-gradient text-sovyniq-gradient")}>
          Sovyniq
        </span>
      )}
    </span>
  );
}