"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

export default function SentryExamplePage() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  const triggerError = () => {
    setStatus("idle");
    try {
      throw new Error("Sentry test error from example page");
    } catch (e) {
      Sentry.captureException(e);
      setStatus("sent");
    }
  };

  const triggerUndefined = () => {
    // Trigger a JS runtime error that Sentry auto-captures
    setStatus("idle");
    const x = (undefined as unknown) as { nonExistent: () => void };
    x.nonExistent();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Sentry Test Page
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Use these buttons to trigger test errors and verify Sentry is
          capturing them.
        </p>

        <div className="space-y-4">
          <button
            onClick={triggerError}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Capture Exception
          </button>

          <button
            onClick={triggerUndefined}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Trigger Runtime Error
          </button>
        </div>

        {status === "sent" && (
          <p className="text-green-600 font-medium">
            ✅ Error sent to Sentry! Check your dashboard.
          </p>
        )}
      </div>
    </div>
  );
}
