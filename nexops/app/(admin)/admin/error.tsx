"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6">
      <div className="card p-8 max-w-lg mx-auto mt-8">
        <ErrorState
          title="Failed to load admin module"
          message={error?.message || "An unexpected error occurred in the administration suite."}
          onRetry={reset}
        />
      </div>
    </div>
  );
}
