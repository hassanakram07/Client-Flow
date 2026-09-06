"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card p-8 max-w-lg mx-auto mt-8">
      <ErrorState
        title="Failed to load portal content"
        message={error?.message || "An unexpected error occurred while loading this section."}
        onRetry={reset}
      />
    </div>
  );
}
