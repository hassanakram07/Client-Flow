"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this content.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon flex items-center justify-center w-10 h-10 rounded-full bg-[var(--status-danger-bg)]">
        <AlertTriangle className="w-5 h-5 text-[var(--status-danger-text)]" />
      </div>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-desc">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-secondary btn-sm mt-2 gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </button>
      )}
    </div>
  );
}
