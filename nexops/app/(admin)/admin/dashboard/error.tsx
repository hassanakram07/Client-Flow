"use client";
import { ErrorState } from "@/components/ui/error-state";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <div className="p-6"><div className="card"><ErrorState onRetry={reset} /></div></div>;
}
