import { cn } from "@/lib/utils";

const COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
];

function getColor(initials: string) {
  const index = initials.charCodeAt(0) % COLORS.length;
  return COLORS[index];
}

type AvatarProps = {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Avatar({ initials, size = "md", className }: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold flex-shrink-0",
        sizeClasses[size],
        getColor(initials),
        className
      )}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
}