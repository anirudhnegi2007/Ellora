import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variant === "default" &&
          "bg-indigo-500/10 text-indigo-600 ring-1 ring-inset ring-indigo-500/20 dark:text-indigo-400",
        variant === "secondary" &&
          "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
        variant === "outline" &&
          "border border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
