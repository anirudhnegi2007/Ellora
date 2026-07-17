import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel = "Continue Shopping",
  actionHref = "/",
}: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
      <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-900">{icon}</div>
      <h2 className="mt-6 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
        {title}
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
        {description}
      </p>
      {actionHref && (
        <Button asChild className="mt-8" size="lg">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
